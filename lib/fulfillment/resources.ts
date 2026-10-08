import { FulfillmentResource } from "@/types/fulfillment";

export const FULFILLMENT_RESOURCES: FulfillmentResource[] = [
  {
    id: "res_settlement_gateway",
    name: "PayPal & Settlement Gateway",
    category: "Fintech Settlement",
    role: "Automated Ledger & Capture Verifier",
    eventColor: "cyan",
  },
  {
    id: "res_oms_dispatcher",
    name: "Merchant OMS Dispatcher",
    category: "Order Management",
    role: "Inventory Allocation & ERP Router",
    eventColor: "blue",
  },
  {
    id: "res_picking_station",
    name: "Automated Picking Bay 4",
    category: "Warehouse Logistics",
    role: "Robotic Bin Retrieval & Item Staging",
    eventColor: "indigo",
  },
  {
    id: "res_packing_qa",
    name: "Packaging & QA Station Alpha",
    category: "Fulfillment QA",
    role: "Cushioning, Barcode Verification & Sealing",
    eventColor: "purple",
  },
  {
    id: "res_carrier_transit",
    name: "Express Carrier Hub",
    category: "Logistics Carrier",
    role: "Interstate Air & Linehaul Transit",
    eventColor: "teal",
  },
  {
    id: "res_last_mile_courier",
    name: "Last-Mile Delivery Network",
    category: "Destination Logistics",
    role: "Local Dispatch & Customer Handover",
    eventColor: "green",
  },
];
