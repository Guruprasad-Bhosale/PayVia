import {
  FulfillmentDependency,
  FulfillmentStatus,
  FulfillmentTask,
  ScheduleRiskAnalysis,
} from "@/types/fulfillment";
import { NegotiationAgreement } from "@/types/negotiation";
import { Product } from "@/types/product";

export interface ScheduleCalculationOptions {
  startTime?: Date | string;
  paypalOrderId?: string;
  paypalCaptureId?: string;
  simulatedDelayHours?: number;
}

export interface ScheduleValidationResult {
  valid: boolean;
  promisedDeliveryDate: Date;
  deliveryDeadline: Date;
  slackHours: number;
  isAtRisk: boolean;
  error?: string;
}

/**
 * Validates whether a proposed fulfillment completion date respects the hard negotiated delivery deadline.
 */
export function validateScheduleDeadline(
  deliveryDeadline: Date,
  promisedDeliveryDate: Date
): ScheduleValidationResult {
  const slackMs = deliveryDeadline.getTime() - promisedDeliveryDate.getTime();
  const slackHours = Number((slackMs / (1000 * 60 * 60)).toFixed(2));
  const isAtRisk = slackHours < 0;

  if (isAtRisk) {
    return {
      valid: false,
      promisedDeliveryDate,
      deliveryDeadline,
      slackHours,
      isAtRisk: true,
      error: `Schedule violates customer delivery commitment by ${Math.abs(slackHours)} hours! Promised: ${promisedDeliveryDate.toISOString()}, Deadline: ${deliveryDeadline.toISOString()}`,
    };
  }

  return {
    valid: true,
    promisedDeliveryDate,
    deliveryDeadline,
    slackHours,
    isAtRisk: false,
  };
}

/**
 * Generates a deterministic sequence of fulfillment tasks and calculates start/end timestamps
 * strictly respecting the negotiated deliveryDays constraint.
 */
export function generateFulfillmentSchedule(
  agreement: NegotiationAgreement,
  product?: Product | null,
  options?: ScheduleCalculationOptions
): {
  tasks: FulfillmentTask[];
  dependencies: FulfillmentDependency[];
  promisedDeliveryDate: string;
  deliveryDeadline: string;
  riskAnalysis: ScheduleRiskAnalysis;
  status: FulfillmentStatus;
  totalDurationDays: number;
} {
  const startTimestamp = options?.startTime ? new Date(options.startTime) : new Date(agreement.createdAt || Date.now());
  const deliveryDays = agreement.deliveryDays || 5;

  // Compute hard customer deadline
  const deadlineMs = startTimestamp.getTime() + deliveryDays * 24 * 60 * 60 * 1000;
  const deliveryDeadlineDate = new Date(deadlineMs);

  const fulfillmentId = `ful_${agreement.negotiationId || agreement.id}`;

  // Deterministic stage duration breakdown in hours
  // Total hours budget = deliveryDays * 24
  const totalBudgetHours = deliveryDays * 24;

  let paymentHours = 6;
  let processingHours = 12;
  let pickingHours = 18;
  let packingHours = 12;
  let dispatchHours = 12;

  const prepBudget = paymentHours + processingHours + pickingHours + packingHours + dispatchHours; // 60 hours = 2.5 days

  let transitHours: number;

  if (totalBudgetHours <= prepBudget) {
    // Expedited fast-track mode (e.g. 1-2 day delivery commitments)
    paymentHours = Number((totalBudgetHours * 0.05).toFixed(1));
    processingHours = Number((totalBudgetHours * 0.10).toFixed(1));
    pickingHours = Number((totalBudgetHours * 0.15).toFixed(1));
    packingHours = Number((totalBudgetHours * 0.10).toFixed(1));
    dispatchHours = Number((totalBudgetHours * 0.10).toFixed(1));
    transitHours = Number((totalBudgetHours * 0.50).toFixed(1));
  } else {
    // Standard transit gets the remainder of the negotiated window
    transitHours = totalBudgetHours - prepBudget;
  }

  // Apply optional simulated delay for risk testing if specified
  if (options?.simulatedDelayHours) {
    transitHours += options.simulatedDelayHours;
  }

  const tasks: FulfillmentTask[] = [];
  let currentCursor = new Date(startTimestamp);

  function addTask(
    idSuffix: string,
    name: string,
    type: FulfillmentTask["type"],
    durationHours: number,
    resourceId: string,
    resourceName: string,
    predecessorIds: string[],
    iconCls: string,
    eventColor: string,
    progress: number,
    isMilestone = false
  ): FulfillmentTask {
    const taskStart = new Date(currentCursor);
    const taskEnd = new Date(taskStart.getTime() + durationHours * 60 * 60 * 1000);
    currentCursor = taskEnd;

    const task: FulfillmentTask = {
      id: `${fulfillmentId}_${idSuffix}`,
      fulfillmentId,
      name,
      type,
      startDate: taskStart.toISOString(),
      endDate: taskEnd.toISOString(),
      duration: Number((durationHours / 24).toFixed(2)),
      durationUnit: "d",
      status: progress === 100 ? "completed" : progress > 0 ? "in_progress" : "pending",
      resourceId,
      resourceName,
      dependencies: predecessorIds.map((p) => `${fulfillmentId}_${p}`),
      progress,
      iconCls,
      eventColor,
      isMilestone,
    };

    tasks.push(task);
    return task;
  }

  // 1. Payment Confirmed
  const t1 = addTask(
    "t1_payment",
    "PayPal Payment Verified & Settled",
    "payment",
    paymentHours,
    "res_settlement_gateway",
    "PayPal & Settlement Gateway",
    [],
    "b-fa b-fa-check-circle",
    "cyan",
    100
  );

  // 2. Order Processing
  const t2 = addTask(
    "t2_processing",
    "Order Processing & Inventory Allocation",
    "processing",
    processingHours,
    "res_oms_dispatcher",
    "Merchant OMS Dispatcher",
    ["t1_payment"],
    "b-fa b-fa-cogs",
    "blue",
    100
  );

  // 3. Warehouse Picking
  const t3 = addTask(
    "t3_picking",
    "Automated Warehouse Picking",
    "picking",
    pickingHours,
    "res_picking_station",
    "Automated Picking Bay 4",
    ["t2_processing"],
    "b-fa b-fa-box-open",
    "indigo",
    75
  );

  // 4. Protective Packing & QA
  const t4 = addTask(
    "t4_packing",
    "Protective Packaging & QA Inspection",
    "packing",
    packingHours,
    "res_packing_qa",
    "Packaging & QA Station Alpha",
    ["t3_picking"],
    "b-fa b-fa-shield-alt",
    "purple",
    0
  );

  // 5. Carrier Hub Dispatch
  const t5 = addTask(
    "t5_dispatch",
    "Carrier Staging & Linehaul Dispatch",
    "dispatch",
    dispatchHours,
    "res_carrier_transit",
    "Express Carrier Hub",
    ["t4_packing"],
    "b-fa b-fa-truck-loading",
    "teal",
    0
  );

  // 6. Interstate Transit
  const t6 = addTask(
    "t6_transit",
    "Express Carrier Air / Ground Transit",
    "transit",
    transitHours,
    "res_carrier_transit",
    "Express Carrier Hub",
    ["t5_dispatch"],
    "b-fa b-fa-plane",
    "teal",
    0
  );

  // 7. Delivery Milestone
  const t7 = addTask(
    "t7_delivery",
    `Guaranteed Handover (${agreement.productName})`,
    "delivery",
    0,
    "res_last_mile_courier",
    "Last-Mile Delivery Network",
    ["t6_transit"],
    "b-fa b-fa-map-marker-alt",
    "green",
    0,
    true
  );

  const promisedDeliveryDate = t7.endDate;
  const promisedDateObj = new Date(promisedDeliveryDate);

  // Generate dependencies
  const dependencies: FulfillmentDependency[] = [
    { id: `dep_${t1.id}_${t2.id}`, from: t1.id, to: t2.id, type: 2 },
    { id: `dep_${t2.id}_${t3.id}`, from: t2.id, to: t3.id, type: 2 },
    { id: `dep_${t3.id}_${t4.id}`, from: t3.id, to: t4.id, type: 2 },
    { id: `dep_${t4.id}_${t5.id}`, from: t4.id, to: t5.id, type: 2 },
    { id: `dep_${t5.id}_${t6.id}`, from: t5.id, to: t6.id, type: 2 },
    { id: `dep_${t6.id}_${t7.id}`, from: t6.id, to: t7.id, type: 2 },
  ];

  // Validate deadline
  const validation = validateScheduleDeadline(deliveryDeadlineDate, promisedDateObj);

  const totalCalculatedDays = Number(
    ((promisedDateObj.getTime() - startTimestamp.getTime()) / (1000 * 60 * 60 * 24)).toFixed(2)
  );

  const riskAnalysis: ScheduleRiskAnalysis = {
    isAtRisk: validation.isAtRisk,
    slackHours: validation.slackHours,
    slackDays: Number((validation.slackHours / 24).toFixed(2)),
    bottleneckTaskId: validation.isAtRisk ? t6.id : undefined,
    criticalPath: tasks.map((t) => t.id),
    riskReason: validation.isAtRisk
      ? `Transit delay of ${Math.abs(validation.slackHours)}h breaches negotiated ${deliveryDays}-day deadline`
      : undefined,
    mitigationSuggestion: validation.isAtRisk
      ? "Upgrade to next-flight-out air courier or expedite warehouse staging by 12 hours"
      : undefined,
  };

  const status: FulfillmentStatus = validation.isAtRisk
    ? "AT_RISK"
    : t7.status === "completed"
    ? "DELIVERED"
    : "ON_TRACK";

  return {
    tasks,
    dependencies,
    promisedDeliveryDate,
    deliveryDeadline: deliveryDeadlineDate.toISOString(),
    riskAnalysis,
    status,
    totalDurationDays: totalCalculatedDays,
  };
}
