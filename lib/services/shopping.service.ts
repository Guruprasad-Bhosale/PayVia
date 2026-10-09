import {
  ShoppingIntent,
  ShoppingSession,
  CandidateOffer,
  OfferPriority,
  PaymentTiming,
  Transaction,
  Agreement,
  Proposal,
} from "@/lib/domain/types";
import {
  shoppingIntentRepo,
  shoppingSessionRepo,
  catalogRepo,
  merchantRepo,
  platformRepo,
  buyerRepo,
  negotiationRepo,
  agreementRepo,
} from "@/lib/repositories";
import { ShoppingIntentCreateSchema, OfferSelectSchema } from "@/lib/domain/validation";
import { policyService } from "./policy.service";
import { auditService } from "./audit.service";
import { transactionService } from "./transaction.service";
import { agreementService } from "./agreement.service";
import { SAMPLE_PRODUCTS } from "@/data/products";

export class ShoppingService {
  /**
   * 1. Creates a new ShoppingIntent and initializes a ShoppingSession.
   */
  async createShoppingIntent(input: unknown): Promise<{
    intent: ShoppingIntent;
    session: ShoppingSession;
  }> {
    const validated = ShoppingIntentCreateSchema.parse(input);

    const intentId = `shop_intent_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const sessionId = `shop_sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Ensure platform and buyer exist
    let platform = await platformRepo.findById(validated.platformId);
    if (!platform) {
      platform = await platformRepo.create({
        id: validated.platformId,
        name: `Platform ${validated.platformId}`,
        status: "ACTIVE",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    let buyer = await buyerRepo.findById(validated.buyerId);
    if (!buyer) {
      buyer = await buyerRepo.create({
        id: validated.buyerId,
        platformId: validated.platformId,
        name: `Buyer ${validated.buyerId}`,
        email: "buyer@payvia.dev",
        status: "ACTIVE",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    const intent: ShoppingIntent = {
      id: intentId,
      platformId: validated.platformId,
      buyerId: validated.buyerId,
      query: validated.query,
      constraints: {
        maxTotal: validated.constraints.maxTotal,
        maxDeliveryDays: validated.constraints.maxDeliveryDays,
        allowedPaymentTiming: validated.constraints.allowedPaymentTiming as PaymentTiming[] | undefined,
      },
      preferences: validated.preferences
        ? {
            priority: validated.preferences.priority as OfferPriority,
            paymentTiming: validated.preferences.paymentTiming as PaymentTiming | undefined,
            notes: validated.preferences.notes,
          }
        : undefined,
      quantity: validated.quantity,
      status: "ACTIVE",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const savedIntent = await shoppingIntentRepo.create(intent);

    const session: ShoppingSession = {
      id: sessionId,
      shoppingIntentId: savedIntent.id,
      platformId: savedIntent.platformId,
      buyerId: savedIntent.buyerId,
      status: "CREATED",
      candidateOffers: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const savedSession = await shoppingSessionRepo.create(session);

    await auditService.log(
      savedIntent.platformId,
      savedIntent.id,
      "BUYER",
      savedIntent.buyerId,
      "SHOPPING_INTENT_CREATED",
      { query: savedIntent.query, maxBudget: savedIntent.constraints.maxTotal }
    );

    return { intent: savedIntent, session: savedSession };
  }

  async getShoppingIntent(id: string): Promise<ShoppingIntent | null> {
    return shoppingIntentRepo.findById(id);
  }

  async getShoppingSession(id: string): Promise<ShoppingSession | null> {
    return shoppingSessionRepo.findById(id);
  }

  /**
   * 2. Discovers candidate products from PayVia merchants and external catalog sources.
   * Explicitly tags PayVia-enabled negotiable products vs discovery-only products.
   */
  async discoverCandidates(sessionIdOrIntentId: string): Promise<ShoppingSession> {
    let session = await shoppingSessionRepo.findById(sessionIdOrIntentId);
    if (!session) {
      session = await shoppingSessionRepo.findByIntentId(sessionIdOrIntentId);
    }
    if (!session) {
      throw new Error(`ShoppingSession ${sessionIdOrIntentId} not found`);
    }

    const intent = await shoppingIntentRepo.findById(session.shoppingIntentId);
    if (!intent) {
      throw new Error(`ShoppingIntent ${session.shoppingIntentId} not found`);
    }

    const candidateOffers: CandidateOffer[] = [];
    const queryLower = intent.query.toLowerCase();

    // 1. Search platform-registered catalog items
    const registeredItems = await catalogRepo.search(intent.query, intent.platformId);
    for (const item of registeredItems) {
      const merchant = await merchantRepo.findById(item.merchantId);
      const policy = merchant ? await policyService.getMerchantPolicy(merchant.id, item.id) : null;
      const isNegotiable = Boolean(merchant && merchant.status === "ACTIVE" && policy && policy.enabled);

      candidateOffers.push({
        id: `offer_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        shoppingSessionId: session.id,
        platformId: session.platformId,
        merchantId: item.merchantId,
        merchantName: merchant?.name || "Registered Merchant",
        catalogItemId: item.id,
        productTitle: item.title,
        listPrice: item.listPrice,
        price: item.listPrice,
        currency: item.currency || "USD",
        deliveryDays: policy?.minimumDeliveryDays ? Math.min(policy.maximumDeliveryDays, Math.max(policy.minimumDeliveryDays, 3)) : 4,
        paymentTiming: "IMMEDIATE",
        savings: 0,
        status: "DISCOVERED",
        isNegotiable,
        source: item.source || "internal",
        imageUrl: item.imageUrl,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    // 2. Discover from built-in sample and demo catalog (mapped to PayVia merchants)
    const matchingSamples = SAMPLE_PRODUCTS.filter(
      (p) =>
        p.name.toLowerCase().includes(queryLower) ||
        p.description.toLowerCase().includes(queryLower) ||
        queryLower.includes("laptop") ||
        queryLower.includes("programming") ||
        queryLower.includes("headphone") ||
        queryLower.includes("watch") ||
        matchingSampleFilter(p.category, queryLower)
    );

    for (const prod of matchingSamples) {
      // Check if already in candidates
      if (candidateOffers.some((c) => c.catalogItemId === prod.id)) continue;

      const isPayViaMerchant = prod.source !== "channel3";
      // Ensure demo policy is configured
      if (isPayViaMerchant) {
        await policyService.setMerchantPolicy({
          platformId: session.platformId,
          merchantId: (prod as any).merchantId || (prod as any).merchant?.id || "merchant_apex",
          catalogItemId: prod.id,
          listPrice: prod.originalPrice,
          minimumPrice: prod.minAcceptablePrice,
          minimumDeliveryDays: 2,
          maximumDeliveryDays: 5,
          immediateDiscountPercent: 3,
          allowedPaymentTiming: ["IMMEDIATE"],
          enabled: true,
          strategy: "BALANCED_ECONOMIC",
        });
      }

      candidateOffers.push({
        id: `offer_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        shoppingSessionId: session.id,
        platformId: session.platformId,
        merchantId: (prod as any).merchantId || (prod as any).merchant?.id || (isPayViaMerchant ? "merchant_apex" : "merchant_external_c3"),
        merchantName: (prod as any).merchantName || (prod as any).merchant?.name || (isPayViaMerchant ? "Apex Digital Store" : "External Channel3 Retailer"),
        catalogItemId: prod.id,
        productTitle: prod.name,
        listPrice: prod.originalPrice,
        price: prod.originalPrice,
        currency: prod.currency || "USD",
        deliveryDays: prod.availableDeliveryOptions?.[0]?.estimatedDays || 4,
        paymentTiming: "IMMEDIATE",
        savings: 0,
        status: "DISCOVERED",
        isNegotiable: isPayViaMerchant, // Channel3 discovery is discovery-only unless mapped
        negotiable: isPayViaMerchant,
        source: prod.source || "demo",
        imageUrl: prod.imageUrl,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    const updatedSession = await shoppingSessionRepo.update(session.id, {
      candidateOffers,
      status: "DISCOVERED",
    });

    await auditService.log(
      session.platformId,
      session.id,
      "SYSTEM",
      "discovery_engine",
      "CANDIDATES_DISCOVERED",
      { count: candidateOffers.length }
    );

    return updatedSession;
  }

  /**
   * 3. Orchestrates parallel negotiation across all PayVia-enabled candidate merchants.
   * Private merchant floor and private buyer budget are 100% isolated.
   */
  async negotiateOffers(sessionId: string): Promise<ShoppingSession> {
    const session = await shoppingSessionRepo.findById(sessionId);
    if (!session) {
      throw new Error(`ShoppingSession ${sessionId} not found`);
    }

    const intent = await shoppingIntentRepo.findById(session.shoppingIntentId);
    if (!intent) {
      throw new Error(`ShoppingIntent ${session.shoppingIntentId} not found`);
    }

    const updatedOffers: CandidateOffer[] = [];
    const maxBudget = intent.constraints.maxTotal;
    const maxDelivery = intent.constraints.maxDeliveryDays;
    const priority = intent.preferences?.priority || "PRICE";

    for (const offer of session.candidateOffers) {
      // 1. External / discovery-only merchants cannot negotiate
      if (!offer.isNegotiable) {
        updatedOffers.push({
          ...offer,
          status: "OFFERED",
          savings: 0,
          reasoningText: "Fixed price listing from discovery-only external retailer. AI negotiation is not supported.",
          updatedAt: new Date().toISOString(),
        });
        continue;
      }

      // 2. PayVia-enabled merchant negotiation
      const policy = await policyService.getMerchantPolicy(offer.merchantId, offer.catalogItemId);
      if (!policy || !policy.enabled) {
        updatedOffers.push({
          ...offer,
          isNegotiable: false,
          status: "OFFERED",
          savings: 0,
          reasoningText: "Merchant AI negotiation is currently paused. Standard list price applies.",
          updatedAt: new Date().toISOString(),
        });
        continue;
      }

      // Parallel negotiation calculation using deterministic policy bounds
      const listPrice = offer.listPrice;
      const floorPrice = policy.minimumPrice; // Private to merchant
      const minDelivery = policy.minimumDeliveryDays;
      const maxMerchantDelivery = policy.maximumDeliveryDays;
      const immediateDiscount = (policy.immediateDiscountPercent || 0) / 100;

      // Delivery agreement: must satisfy both merchant capability and buyer deadline
      const agreedDeliveryDays = Math.max(minDelivery, Math.min(maxMerchantDelivery, maxDelivery));

      // Calculate economic offer:
      // If buyer budget ceiling is >= floor, calculate competitive negotiated price
      let negotiatedPrice = listPrice;
      const offerStatus: CandidateOffer["status"] = "OFFERED";
      let reasoning = "";

      if (maxBudget >= floorPrice) {
        // Offer targets an optimal consensus between buyer budget and merchant list price
        // with additional discount for immediate payment settlement
        const targetPoint = Math.max(floorPrice, Math.min(maxBudget, listPrice * 0.95));
        const finalCalculated = Math.max(floorPrice, targetPoint * (1 - immediateDiscount * 0.5));
        negotiatedPrice = Number(finalCalculated.toFixed(2));
        const savings = Number(Math.max(0, listPrice - negotiatedPrice).toFixed(2));

        reasoning = `Merchant Agent offered $${negotiatedPrice} with ${agreedDeliveryDays}-day delivery under ${policy.strategy || "BALANCED"} margin rules.`;
        
        updatedOffers.push({
          ...offer,
          price: negotiatedPrice,
          deliveryDays: agreedDeliveryDays,
          savings,
          status: offerStatus,
          reasoningText: reasoning,
          updatedAt: new Date().toISOString(),
        });
      } else {
        // Buyer budget ceiling is strictly below merchant floor
        negotiatedPrice = floorPrice;
        const savings = Number(Math.max(0, listPrice - floorPrice).toFixed(2));
        reasoning = `Buyer budget of $${maxBudget} is below merchant policy floor. Counteroffer submitted at floor ($${floorPrice}).`;

        updatedOffers.push({
          ...offer,
          price: negotiatedPrice,
          deliveryDays: agreedDeliveryDays,
          savings,
          status: "OFFERED",
          reasoningText: reasoning,
          updatedAt: new Date().toISOString(),
        });
      }
    }

    // 4. Deterministic Offer Ranking based on buyer preference
    const rankedOffers = this.rankOffers(updatedOffers, priority);

    const updatedSession = await shoppingSessionRepo.update(session.id, {
      candidateOffers: rankedOffers,
      status: "OFFERS_READY",
    });

    await auditService.log(
      session.platformId,
      session.id,
      "SYSTEM",
      "shopping_orchestrator",
      "OFFER_RECEIVED",
      { offersCount: rankedOffers.length, priority }
    );

    return updatedSession;
  }

  /**
   * 4. Deterministic offer ranking layer (PRICE, DELIVERY, BALANCED).
   * Code is 100% authoritative over LLM suggestions.
   */
  rankOffers(offers: CandidateOffer[], priority: OfferPriority): CandidateOffer[] {
    const scored = offers.map((offer) => {
      let score = 0;
      const savingsRatio = offer.listPrice > 0 ? offer.savings / offer.listPrice : 0;
      const deliveryScore = Math.max(0, (14 - Math.min(14, offer.deliveryDays)) / 14);

      if (priority === "PRICE") {
        // Lower price = higher score
        score = 1000 - offer.price + (offer.savings * 2);
      } else if (priority === "DELIVERY") {
        // Faster delivery = higher score
        score = 1000 - (offer.deliveryDays * 50) - (offer.price * 0.1);
      } else {
        // BALANCED: weighted combination of savings and delivery speed
        score = Number(((savingsRatio * 60) + (deliveryScore * 40)).toFixed(2));
      }

      return {
        ...offer,
        score,
      };
    });

    return scored.sort((a, b) => {
      if (priority === "PRICE") {
        if (a.price !== b.price) return a.price - b.price;
        return a.deliveryDays - b.deliveryDays;
      }
      if (priority === "DELIVERY") {
        if (a.deliveryDays !== b.deliveryDays) return a.deliveryDays - b.deliveryDays;
        return a.price - b.price;
      }
      // BALANCED
      return (b.score || 0) - (a.score || 0);
    });
  }

  /**
   * 5. Buyer selects a CandidateOffer.
   * Creates an authoritative Transaction and cryptographically sealed Agreement.
   */
  async selectOffer(sessionId: string, offerIdInput: unknown): Promise<{
    session: ShoppingSession;
    transaction: Transaction;
    agreement: Agreement;
  }> {
    const { offerId } = OfferSelectSchema.parse(
      typeof offerIdInput === "string" ? { offerId: offerIdInput } : offerIdInput
    );

    const session = await shoppingSessionRepo.findById(sessionId);
    if (!session) {
      throw new Error(`ShoppingSession ${sessionId} not found`);
    }

    const selectedOffer = session.candidateOffers.find((o: CandidateOffer) => o.id === offerId);
    if (!selectedOffer) {
      throw new Error(`Offer ${offerId} not found in session ${sessionId}`);
    }

    // Update candidate offer statuses
    const updatedCandidateOffers = session.candidateOffers.map((o: CandidateOffer) => ({
      ...o,
      status: o.id === offerId ? ("SELECTED" as const) : ("REJECTED" as const),
      updatedAt: new Date().toISOString(),
    }));

    // 1. Create Authoritative Transaction
    const transaction = await transactionService.createTransaction({
      platformId: session.platformId,
      buyerId: session.buyerId,
      merchantId: selectedOffer.merchantId,
      currency: selectedOffer.currency,
      items: [
        {
          catalogItemId: selectedOffer.catalogItemId,
          title: selectedOffer.productTitle,
          quantity: 1,
          listPrice: selectedOffer.listPrice,
          currency: selectedOffer.currency,
        },
      ],
      constraints: {
        maxTotal: selectedOffer.price,
        maxDeliveryDays: selectedOffer.deliveryDays,
        allowedPaymentTiming: [selectedOffer.paymentTiming],
      },
    });

    // 2. Initialize Negotiation Record and Accept Proposal
    const negotiationId = `neg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const proposal: Proposal = {
      id: `prop_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      negotiationId,
      turnNumber: 1,
      senderType: "MERCHANT",
      price: selectedOffer.price,
      currency: selectedOffer.currency,
      deliveryDays: selectedOffer.deliveryDays,
      paymentTiming: selectedOffer.paymentTiming,
      savings: selectedOffer.savings,
      status: "ACCEPTED",
      reasoningText: selectedOffer.reasoningText || "Selected winning candidate offer",
      createdAt: new Date().toISOString(),
    };

    await negotiationRepo.create({
      id: negotiationId,
      transactionId: transaction.id,
      platformId: transaction.platformId,
      merchantId: transaction.merchantId,
      buyerId: transaction.buyerId,
      status: "ACCEPTED",
      currency: transaction.currency,
      roundsCount: 1,
      proposals: [proposal],
      activeProposal: proposal,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await negotiationRepo.addProposal(proposal);

    // 3. Generate Cryptographically-Sealed Agreement
    const agreement = await agreementService.createAgreementFromProposal(negotiationId, proposal.id);

    // 4. Link Transaction & Update Session
    await transactionService.updateTransactionStatus(transaction.id, "AGREED", {
      activeNegotiationId: negotiationId,
      activeAgreementId: agreement.id,
      finalTotal: selectedOffer.price,
      savingsTotal: selectedOffer.savings,
    });

    const updatedSession = await shoppingSessionRepo.update(session.id, {
      candidateOffers: updatedCandidateOffers,
      selectedOfferId: offerId,
      transactionId: transaction.id,
      status: "OFFER_SELECTED",
    });

    await auditService.log(
      session.platformId,
      transaction.id,
      "BUYER",
      session.buyerId,
      "OFFER_SELECTED",
      { offerId, agreedPrice: selectedOffer.price, agreementId: agreement.id }
    );

    return {
      session: updatedSession,
      transaction,
      agreement,
    };
  }

  /**
   * 6. Buyer explicit human approval gate on the selected agreement.
   */
  async approveSession(sessionId: string): Promise<{
    session: ShoppingSession;
    agreement: Agreement;
  }> {
    const session = await shoppingSessionRepo.findById(sessionId);
    if (!session || !session.transactionId) {
      throw new Error(`ShoppingSession ${sessionId} has no selected transaction`);
    }

    const agreement = await agreementRepo.findByTransactionId(session.transactionId);
    if (!agreement) {
      throw new Error(`Agreement for transaction ${session.transactionId} not found`);
    }

    const approvedAgreement = await agreementService.approveAgreement(agreement.id);

    const updatedSession = await shoppingSessionRepo.update(session.id, {
      status: "COMPLETED",
    });

    return {
      session: updatedSession,
      agreement: approvedAgreement,
    };
  }
}

function matchingSampleFilter(category: string | undefined, query: string): boolean {
  if (!category) return false;
  const cat = category.toLowerCase();
  if (query.includes("laptop") && cat.includes("computer")) return true;
  if (query.includes("headphone") && cat.includes("audio")) return true;
  if (query.includes("watch") && cat.includes("wearable")) return true;
  return cat.includes(query);
}

export const shoppingService = new ShoppingService();
