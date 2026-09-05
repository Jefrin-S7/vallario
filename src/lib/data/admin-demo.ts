// VALLARIO admin/ERP demo data.
//
// This mirrors the exact Firestore document shapes described in
// src/lib/firebase/schema.md, so every admin screen renders correctly today
// and needs only a data-source swap (these arrays -> Firestore queries via
// src/lib/firebase/admin.ts) once a real project is connected.
//
// Per spec #52: this is clearly-labeled seed/demo data, never presented as
// real revenue, customers, or transactions. Every admin page in this app
// carries a "Demo data" badge wherever these arrays are used.

export type OrderStatus = "pending" | "paid" | "failed" | "refunded" | "cancelled";

export interface DemoOrder {
  id: string;
  customerName: string;
  customerEmail: string;
  items: string[];
  total: number;
  provider: "cashfree" | "paypal";
  status: OrderStatus;
  createdAt: string;
}

export const demoOrders: DemoOrder[] = [
  {
    id: "ord_8841",
    customerName: "Priya Nair",
    customerEmail: "priya.n@example.com",
    items: ["15,000+ AI Agents, Bots & Automation Templates"],
    total: 59,
    provider: "cashfree",
    status: "paid",
    createdAt: "2026-08-23T09:14:00Z",
  },
  {
    id: "ord_8840",
    customerName: "Marcus Webb",
    customerEmail: "marcus.webb@example.com",
    items: ["VALLARIO Digital Product Mega Bundle"],
    total: 149,
    provider: "paypal",
    status: "paid",
    createdAt: "2026-08-23T07:52:00Z",
  },
  {
    id: "ord_8839",
    customerName: "Amara Chen",
    customerEmail: "amara.c@example.com",
    items: ["Ultimate Ebooks Pack", "10K+ Reels Pack"],
    total: 51,
    provider: "cashfree",
    status: "pending",
    createdAt: "2026-08-22T21:03:00Z",
  },
  {
    id: "ord_8838",
    customerName: "Diego Fuentes",
    customerEmail: "diego.f@example.com",
    items: ["1000+ Courses — All-In-One Learning Bundle"],
    total: 39,
    provider: "paypal",
    status: "refunded",
    createdAt: "2026-08-21T14:40:00Z",
  },
  {
    id: "ord_8837",
    customerName: "Sofia Reyes",
    customerEmail: "sofia.r@example.com",
    items: ["Digital Products Mega Collection"],
    total: 32,
    provider: "cashfree",
    status: "failed",
    createdAt: "2026-08-21T11:18:00Z",
  },
];

export interface DemoCustomer {
  uid: string;
  name: string;
  email: string;
  orders: number;
  totalSpent: number;
  role: "customer";
  joined: string;
}

export const demoCustomers: DemoCustomer[] = [
  { uid: "u_1", name: "Priya Nair", email: "priya.n@example.com", orders: 3, totalSpent: 205, role: "customer", joined: "2026-05-02" },
  { uid: "u_2", name: "Marcus Webb", email: "marcus.webb@example.com", orders: 1, totalSpent: 149, role: "customer", joined: "2026-08-23" },
  { uid: "u_3", name: "Amara Chen", email: "amara.c@example.com", orders: 2, totalSpent: 78, role: "customer", joined: "2026-07-11" },
  { uid: "u_4", name: "Diego Fuentes", email: "diego.f@example.com", orders: 1, totalSpent: 39, role: "customer", joined: "2026-06-30" },
];

export interface DemoAuditLog {
  id: string;
  action: string;
  actor: string;
  target: string;
  createdAt: string;
}

export const demoAuditLogs: DemoAuditLog[] = [
  { id: "log_1", action: "product_update", actor: "admin@vallario.com", target: "15000-ai-agents-n8n-automation", createdAt: "2026-08-23T09:02:00Z" },
  { id: "log_2", action: "refund_issued", actor: "finance@vallario.com", target: "ord_8838", createdAt: "2026-08-21T15:10:00Z" },
  { id: "log_3", action: "role_change", actor: "admin@vallario.com", target: "u_2", createdAt: "2026-08-20T10:44:00Z" },
  { id: "log_4", action: "price_change", actor: "manager@vallario.com", target: "ultimate-ebooks-pack", createdAt: "2026-08-18T13:27:00Z" },
  { id: "log_5", action: "admin_login", actor: "admin@vallario.com", target: "-", createdAt: "2026-08-23T08:55:00Z" },
];

export const demoFinance = {
  grossRevenue: 429,
  discounts: 18,
  refunds: 39,
  taxes: 0,
  paymentFees: 12,
  cashfreeRevenue: 142,
  paypalRevenue: 287,
};

export function netRevenue() {
  return demoFinance.grossRevenue - demoFinance.discounts - demoFinance.refunds - demoFinance.paymentFees;
}
