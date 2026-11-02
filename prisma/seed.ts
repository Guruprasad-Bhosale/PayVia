import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function seed() {
  console.log("🌱 PayVia Production Seeder: Initializing authoritative baseline entities...");

  // 1. Authoritative Reference Platform
  const platform = await prisma.platform.upsert({
    where: { id: "plat_default" },
    update: {},
    create: {
      id: "plat_default",
      name: "PayVia Reference Platform",
      status: "ACTIVE",
    },
  });
  console.log(`✅ Platform verified: ${platform.id} (${platform.name})`);

  // 2. Authoritative Reference Merchant (Apex Digital Store)
  const merchantApex = await prisma.merchant.upsert({
    where: { id: "merchant_apex" },
    update: {},
    create: {
      id: "merchant_apex",
      platformId: platform.id,
      name: "Apex Digital Store",
      email: "support@apexretailers.example.com",
      settlementEmail: "merchant-sandbox@payvia.dev",
      status: "ACTIVE",
    },
  });
  console.log(`✅ Reference Merchant verified: ${merchantApex.id} (${merchantApex.name})`);

  // 3. Storewide Baseline Negotiation Policy (Preserves existing customized pricing)
  const storePolicy = await prisma.merchantPolicy.upsert({
    where: { id: "pol_merchant_apex_store" },
    update: {},
    create: {
      id: "pol_merchant_apex_store",
      platformId: platform.id,
      merchantId: merchantApex.id,
      catalogItemId: null,
      enabled: true,
      currency: "USD",
      listPrice: 1000.0,
      minimumPrice: 700.0,
      minimumDeliveryDays: 2,
      maximumDeliveryDays: 7,
      immediateDiscountPercent: 3.0,
      allowedPaymentTiming: ["IMMEDIATE", "NET_30"],
      strategy: "BALANCED_ECONOMIC",
    },
  });
  console.log(`✅ Storewide Policy verified: ${storePolicy.id}`);

  console.log("✨ Seeding completed safely and idempotently.");
}

seed()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

