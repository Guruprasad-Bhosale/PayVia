/**
 * PayVia Fulfillment & Bryntum Scheduling Types
 * Models operational tasks, resources, dependencies, and agent-driven fulfillment plans.
 */

export type FulfillmentStatus =
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "ON_TRACK"
  | "AT_RISK"
  | "DELIVERED";

export type TaskStatus =
  | "completed"
  | "in_progress"
  | "pending"
  | "blocked"
  | "at_risk";

export type FulfillmentTaskType =
  | "payment"
  | "processing"
  | "picking"
  | "packing"
  | "dispatch"
  | "transit"
  | "delivery";

export interface FulfillmentTask {
  id: string;
  fulfillmentId: string;
  name: string;
  type: FulfillmentTaskType;
  startDate: string; // ISO 8601 string
  endDate: string; // ISO 8601 string
  duration: number; // Numeric duration in days or hours
  durationUnit: "d" | "h";
  status: TaskStatus;
  resourceId: string;
  resourceName: string;
  dependencies: string[]; // List of predecessor task IDs
  progress: number; // 0 to 100 percentage
  isMilestone?: boolean;
  notes?: string;
  eventColor?: string;
  iconCls?: string;
}

export interface FulfillmentResource {
  id: string;
  name: string;
  category: string;
  role: string;
  eventColor?: string;
  avatar?: string;
}

export interface FulfillmentDependency {
  id: string;
  from: string; // Predecessor task id
  to: string; // Successor task id
  type?: number; // 2 = Finish-to-Start (standard Bryntum dependency type)
}

export interface ScheduleRiskAnalysis {
  isAtRisk: boolean;
  slackHours: number;
  slackDays: number;
  bottleneckTaskId?: string;
  criticalPath: string[];
  riskReason?: string;
  mitigationSuggestion?: string;
}

export interface FulfillmentPlan {
  id: string;
  negotiationId: string;
  agreementId: string;
  paypalOrderId: string;
  paypalCaptureId?: string;
  productId: string;
  productName: string;
  productCategory: string;
  source: "channel3" | "demo";
  merchantName: string;
  productUrl?: string;
  externalId?: string;
  quantity: number;
  originalPrice: number;
  agreedPrice: number;
  savings: number;
  currency: string;
  buyerMaxDeliveryDays: number;
  negotiatedDeliveryDays: number;
  createdAt: string; // ISO string when agreement/settlement was initiated
  deliveryDeadline: string; // Hard constraint: createdAt + negotiatedDeliveryDays
  promisedDeliveryDate: string; // Deterministic milestone date
  status: FulfillmentStatus;
  totalDurationDays: number;
  tasks: FulfillmentTask[];
  resources: FulfillmentResource[];
  dependencies: FulfillmentDependency[];
  riskAnalysis: ScheduleRiskAnalysis;
}

export interface FulfillmentAiQueryRequest {
  query: string;
  negotiationId?: string;
  planId?: string;
}

export interface FulfillmentAiQueryResponse {
  success: boolean;
  answer: string;
  status: FulfillmentStatus;
  promisedDeliveryDate: string;
  slackHours: number;
  criticalTask?: string;
  error?: string;
}
