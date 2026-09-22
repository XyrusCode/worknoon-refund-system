import { refundsApi } from "../api/endpoints/refunds.api";
import { customersApi } from "../api/endpoints/customers.api";
import { ordersApi } from "../api/endpoints/orders.api";

// ── Entity Types ────────────────────────────────────────────────────────────

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  createdAt: string;
  orders?: Order[];
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  totalAmount: number;
  status: string;
  isFinalSale: boolean;
  createdAt: string;
  items: OrderItem[];
  customer?: Customer;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  isDamaged: boolean;
}

export type RefundStatus = "PENDING" | "APPROVED" | "DENIED" | "ESCALATED";

export interface RefundRequest {
  id: string;
  customerId: string;
  orderId: string;
  customerMessage: string;
  status: RefundStatus;
  aiDecision: string | null;
  aiReasoning: string | null;
  policyViolations: string[];
  confidence: number | null;
  createdAt: string;
  customer?: Customer;
  order?: Order;
}

export interface CreateRefundPayload {
  customerId: string;
  orderId: string;
  message?: string;
  customerMessage?: string;
}

// ── API Client ──────────────────────────────────────────────────────────────

export const apiClient = {
  refunds: refundsApi,
  customers: customersApi,
  orders: ordersApi,
};
