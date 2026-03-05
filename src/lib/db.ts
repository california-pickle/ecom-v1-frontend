/**
 * In-memory mock database.
 * Lives in Node.js module scope — persists across requests within one server process.
 * Seeded with realistic data. Swap for real DB later by replacing helpers only.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Order {
  id: string;
  customer: string;
  email: string;
  address: string;
  product: string;
  quantity: number;
  amount: number;
  cost: number;       // cost of goods for this order
  profit: number;     // amount - cost
  status: "Pending" | "Shipped" | "Delivered" | "Cancelled";
  paymentStatus: "Paid" | "Refunded" | "Pending";
  date: string;
  notes: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
  joinDate: string;
  address: string;
  orderHistory: string[];
}

export interface Product {
  id: string;
  name: string;
  variant: string;
  sellingPrice: number;
  costPrice: number;
  stock: number;
  lowStockThreshold: number;
  sold: number;
}

export interface BulkOrder {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  quantity: string;
  message: string;
  status: "New" | "Contacted" | "Closed";
  date: string;
}

export interface Notification {
  id: string;
  type: "order" | "bulk_order" | "status_change" | "low_stock";
  title: string;
  message: string;
  href: string;
  read: boolean;
  date: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  detail: string;
  date: string;
  time: string;
}

export interface AdminSettings {
  adminEmail: string;
  emailNotificationsEnabled: boolean;
  lowStockAlertEnabled: boolean;
  orderNotificationsEnabled: boolean;
}

// ─── Seed products ────────────────────────────────────────────────────────────

const seedProducts: Product[] = [
  { id: "PROD-001", name: "California Pickle", variant: "60ml Pack (x12)", sellingPrice: 29.99, costPrice: 9.50, stock: 142, lowStockThreshold: 20, sold: 284 },
  { id: "PROD-002", name: "California Pickle", variant: "Half Gallon", sellingPrice: 34.99, costPrice: 11.00, stock: 89, lowStockThreshold: 15, sold: 176 },
  { id: "PROD-003", name: "California Pickle", variant: "1 Gallon", sellingPrice: 54.99, costPrice: 17.50, stock: 56, lowStockThreshold: 10, sold: 98 },
];

// Helper: compute order cost and profit from items
function calcOrderMargin(product: string, quantity: number, amount: number): { cost: number; profit: number } {
  // Find matching product by variant name in product string
  const prod = seedProducts.find((p) => product.includes(p.variant));
  if (prod) {
    const cost = parseFloat((prod.costPrice * quantity).toFixed(2));
    return { cost, profit: parseFloat((amount - cost).toFixed(2)) };
  }
  // Fallback: assume ~33% cost
  const cost = parseFloat((amount * 0.33).toFixed(2));
  return { cost, profit: parseFloat((amount - cost).toFixed(2)) };
}

// ─── Seed orders ──────────────────────────────────────────────────────────────

const rawOrders = [
  { id: "ORD-1001", customer: "Marcus Rivera", email: "marcus@email.com", address: "142 Sunset Blvd, Los Angeles, CA 90028", product: "60ml Pack (x12)", quantity: 2, amount: 59.98, status: "Delivered" as const, date: "2026-02-28", paymentStatus: "Paid" as const, notes: "" },
  { id: "ORD-1002", customer: "Priya Nair", email: "priya@email.com", address: "87 Ocean Ave, Santa Monica, CA 90401", product: "Half Gallon", quantity: 1, amount: 34.99, status: "Shipped" as const, date: "2026-02-27", paymentStatus: "Paid" as const, notes: "Leave at door" },
  { id: "ORD-1003", customer: "Jake Thompson", email: "jake@email.com", address: "23 Elm St, San Diego, CA 92101", product: "1 Gallon", quantity: 1, amount: 54.99, status: "Pending" as const, date: "2026-02-27", paymentStatus: "Paid" as const, notes: "" },
  { id: "ORD-1004", customer: "Sofia Chen", email: "sofia@email.com", address: "500 Market St, San Francisco, CA 94105", product: "60ml Pack (x12)", quantity: 3, amount: 89.97, status: "Delivered" as const, date: "2026-02-26", paymentStatus: "Paid" as const, notes: "" },
  { id: "ORD-1005", customer: "Derek Brown", email: "derek@email.com", address: "11 Pine Rd, Oakland, CA 94601", product: "Half Gallon", quantity: 2, amount: 69.98, status: "Cancelled" as const, date: "2026-02-25", paymentStatus: "Refunded" as const, notes: "Customer requested cancel" },
  { id: "ORD-1006", customer: "Ava Martinez", email: "ava@email.com", address: "9 Broadway, Sacramento, CA 95814", product: "1 Gallon", quantity: 2, amount: 109.98, status: "Delivered" as const, date: "2026-02-24", paymentStatus: "Paid" as const, notes: "" },
  { id: "ORD-1007", customer: "Liam O'Brien", email: "liam@email.com", address: "77 Harbor Dr, Long Beach, CA 90802", product: "60ml Pack (x12)", quantity: 1, amount: 29.99, status: "Shipped" as const, date: "2026-02-24", paymentStatus: "Paid" as const, notes: "" },
  { id: "ORD-1008", customer: "Zoe Kim", email: "zoe@email.com", address: "304 Valley Rd, Pasadena, CA 91101", product: "Half Gallon", quantity: 1, amount: 34.99, status: "Pending" as const, date: "2026-02-23", paymentStatus: "Pending" as const, notes: "" },
  { id: "ORD-1009", customer: "Noah Williams", email: "noah@email.com", address: "18 Central Ave, Fresno, CA 93701", product: "1 Gallon", quantity: 1, amount: 54.99, status: "Delivered" as const, date: "2026-02-22", paymentStatus: "Paid" as const, notes: "" },
  { id: "ORD-1010", customer: "Emma Davis", email: "emma@email.com", address: "62 Redwood Ln, San Jose, CA 95101", product: "60ml Pack (x12)", quantity: 4, amount: 119.96, status: "Delivered" as const, date: "2026-02-21", paymentStatus: "Paid" as const, notes: "Gift wrap please" },
  { id: "ORD-1011", customer: "Carlos Reyes", email: "carlos@email.com", address: "400 Desert Rd, Palm Springs, CA 92262", product: "1 Gallon", quantity: 1, amount: 54.99, status: "Shipped" as const, date: "2026-02-20", paymentStatus: "Paid" as const, notes: "" },
  { id: "ORD-1012", customer: "Hannah Lee", email: "hannah@email.com", address: "55 Maple Ave, Irvine, CA 92602", product: "Half Gallon", quantity: 3, amount: 104.97, status: "Delivered" as const, date: "2026-02-19", paymentStatus: "Paid" as const, notes: "" },
];

const seedOrders: Order[] = rawOrders.map((o) => ({
  ...o,
  ...calcOrderMargin(o.product, o.quantity, o.amount),
}));

// ─── Seed customers ───────────────────────────────────────────────────────────

const seedCustomers: Customer[] = [
  { id: "CUST-001", name: "Marcus Rivera", email: "marcus@email.com", totalOrders: 1, totalSpent: 59.98, joinDate: "2026-02-28", address: "142 Sunset Blvd, Los Angeles, CA 90028", orderHistory: ["ORD-1001"] },
  { id: "CUST-002", name: "Priya Nair", email: "priya@email.com", totalOrders: 1, totalSpent: 34.99, joinDate: "2026-02-27", address: "87 Ocean Ave, Santa Monica, CA 90401", orderHistory: ["ORD-1002"] },
  { id: "CUST-003", name: "Jake Thompson", email: "jake@email.com", totalOrders: 1, totalSpent: 54.99, joinDate: "2026-02-27", address: "23 Elm St, San Diego, CA 92101", orderHistory: ["ORD-1003"] },
  { id: "CUST-004", name: "Sofia Chen", email: "sofia@email.com", totalOrders: 1, totalSpent: 89.97, joinDate: "2026-02-26", address: "500 Market St, San Francisco, CA 94105", orderHistory: ["ORD-1004"] },
  { id: "CUST-005", name: "Derek Brown", email: "derek@email.com", totalOrders: 1, totalSpent: 0, joinDate: "2026-02-25", address: "11 Pine Rd, Oakland, CA 94601", orderHistory: ["ORD-1005"] },
  { id: "CUST-006", name: "Ava Martinez", email: "ava@email.com", totalOrders: 1, totalSpent: 109.98, joinDate: "2026-02-24", address: "9 Broadway, Sacramento, CA 95814", orderHistory: ["ORD-1006"] },
  { id: "CUST-007", name: "Liam O'Brien", email: "liam@email.com", totalOrders: 1, totalSpent: 29.99, joinDate: "2026-02-24", address: "77 Harbor Dr, Long Beach, CA 90802", orderHistory: ["ORD-1007"] },
  { id: "CUST-008", name: "Zoe Kim", email: "zoe@email.com", totalOrders: 1, totalSpent: 0, joinDate: "2026-02-23", address: "304 Valley Rd, Pasadena, CA 91101", orderHistory: ["ORD-1008"] },
  { id: "CUST-009", name: "Noah Williams", email: "noah@email.com", totalOrders: 1, totalSpent: 54.99, joinDate: "2026-02-22", address: "18 Central Ave, Fresno, CA 93701", orderHistory: ["ORD-1009"] },
  { id: "CUST-010", name: "Emma Davis", email: "emma@email.com", totalOrders: 1, totalSpent: 119.96, joinDate: "2026-02-21", address: "62 Redwood Ln, San Jose, CA 95101", orderHistory: ["ORD-1010"] },
  { id: "CUST-011", name: "Carlos Reyes", email: "carlos@email.com", totalOrders: 1, totalSpent: 54.99, joinDate: "2026-02-20", address: "400 Desert Rd, Palm Springs, CA 92262", orderHistory: ["ORD-1011"] },
  { id: "CUST-012", name: "Hannah Lee", email: "hannah@email.com", totalOrders: 1, totalSpent: 104.97, joinDate: "2026-02-19", address: "55 Maple Ave, Irvine, CA 92602", orderHistory: ["ORD-1012"] },
];

// ─── Seed bulk orders ─────────────────────────────────────────────────────────

const seedBulkOrders: BulkOrder[] = [
  { id: "BLK-001", name: "Ryan Foster", email: "ryan@gymchain.com", phone: "+1 310 555 0198", company: "FitLife Gym Chain", quantity: "500 units/month", message: "We run 12 locations across California and want to stock hydration products.", status: "Contacted", date: "2026-02-26" },
  { id: "BLK-002", name: "Tanya Walsh", email: "tanya@sportsnow.com", phone: "+1 415 555 0274", company: "Sports Now Retail", quantity: "1000 cases", message: "Interested in private label or bulk wholesale pricing.", status: "New", date: "2026-02-28" },
  { id: "BLK-003", name: "Jerome Ellis", email: "jerome@elitesports.com", phone: "+1 213 555 0312", company: "Elite Sports Academy", quantity: "200 cases/quarter", message: "Need bulk supply for athlete training programs.", status: "New", date: "2026-03-01" },
];

// ─── Seed notifications ───────────────────────────────────────────────────────

const seedNotifications: Notification[] = [
  { id: "NOTIF-001", type: "order", title: "New Order Placed", message: "ORD-1001 from Marcus Rivera — $59.98", href: "/admin/orders", read: true, date: "2026-02-28" },
  { id: "NOTIF-002", type: "bulk_order", title: "New Bulk Inquiry", message: "Tanya Walsh from Sports Now Retail", href: "/admin/bulk-orders", read: false, date: "2026-02-28" },
  { id: "NOTIF-003", type: "bulk_order", title: "New Bulk Inquiry", message: "Jerome Ellis from Elite Sports Academy", href: "/admin/bulk-orders", read: false, date: "2026-03-01" },
];

// ─── Seed activity log ────────────────────────────────────────────────────────

const seedLogs: ActivityLog[] = [
  { id: "LOG-001", action: "Order Created", detail: "ORD-1001 placed by Marcus Rivera — $59.98", date: "2026-02-28", time: "09:14" },
  { id: "LOG-002", action: "Order Created", detail: "ORD-1002 placed by Priya Nair — $34.99", date: "2026-02-27", time: "14:22" },
  { id: "LOG-003", action: "Order Created", detail: "ORD-1003 placed by Jake Thompson — $54.99", date: "2026-02-27", time: "16:05" },
  { id: "LOG-004", action: "Status Changed", detail: "ORD-1001 marked as Delivered", date: "2026-02-28", time: "17:30" },
  { id: "LOG-005", action: "Status Changed", detail: "ORD-1005 marked as Cancelled by admin", date: "2026-02-25", time: "11:08" },
  { id: "LOG-006", action: "Bulk Lead", detail: "New bulk inquiry from Ryan Foster (FitLife Gym Chain)", date: "2026-02-26", time: "10:45" },
  { id: "LOG-007", action: "Bulk Lead", detail: "New bulk inquiry from Tanya Walsh (Sports Now Retail)", date: "2026-02-28", time: "08:19" },
  { id: "LOG-008", action: "Bulk Lead", detail: "New bulk inquiry from Jerome Ellis (Elite Sports Academy)", date: "2026-03-01", time: "07:55" },
];

// ─── Seed settings ────────────────────────────────────────────────────────────

const seedSettings: AdminSettings = {
  adminEmail: "admin@californiapickle.com",
  emailNotificationsEnabled: true,
  lowStockAlertEnabled: true,
  orderNotificationsEnabled: true,
};

// ─── Singleton global store ───────────────────────────────────────────────────

declare global {
  // eslint-disable-next-line no-var
  var __db:
    | {
        orders: Order[];
        customers: Customer[];
        products: Product[];
        bulkOrders: BulkOrder[];
        notifications: Notification[];
        logs: ActivityLog[];
        settings: AdminSettings;
        orderCounter: number;
        bulkCounter: number;
        notifCounter: number;
        logCounter: number;
      }
    | undefined;
}

if (!global.__db) {
  global.__db = {
    orders: [...seedOrders],
    customers: [...seedCustomers],
    products: [...seedProducts],
    bulkOrders: [...seedBulkOrders],
    notifications: [...seedNotifications],
    logs: [...seedLogs],
    settings: { ...seedSettings },
    orderCounter: 1012,
    bulkCounter: 3,
    notifCounter: 3,
    logCounter: 8,
  };
}

export const db = global.__db;

// ─── ID generators ────────────────────────────────────────────────────────────

export function generateOrderId(): string {
  db.orderCounter += 1;
  return `ORD-${db.orderCounter}`;
}

export function generateCustomerId(): string {
  return `CUST-${String(db.customers.length + 1).padStart(3, "0")}`;
}

export function generateBulkId(): string {
  db.bulkCounter += 1;
  return `BLK-${String(db.bulkCounter).padStart(3, "0")}`;
}

export function generateNotifId(): string {
  db.notifCounter += 1;
  return `NOTIF-${String(db.notifCounter).padStart(3, "0")}`;
}

export function generateLogId(): string {
  db.logCounter += 1;
  return `LOG-${String(db.logCounter).padStart(3, "0")}`;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Get today as YYYY-MM-DD */
export function today(): string {
  return new Date().toISOString().split("T")[0];
}

/** Current HH:MM */
export function nowTime(): string {
  return new Date().toTimeString().slice(0, 5);
}

/** Compute cost + profit for an order based on products in DB */
export function computeMargin(product: string, quantity: number, amount: number): { cost: number; profit: number } {
  const prod = db.products.find((p) => product.includes(p.variant));
  if (prod) {
    const cost = parseFloat((prod.costPrice * quantity).toFixed(2));
    return { cost, profit: parseFloat((amount - cost).toFixed(2)) };
  }
  const cost = parseFloat((amount * 0.33).toFixed(2));
  return { cost, profit: parseFloat((amount - cost).toFixed(2)) };
}

/** Add a notification */
export function addNotification(notif: Omit<Notification, "id">): void {
  db.notifications.unshift({ ...notif, id: generateNotifId() });
}

/** Add an activity log entry */
export function addLog(action: string, detail: string): void {
  db.logs.unshift({
    id: generateLogId(),
    action,
    detail,
    date: today(),
    time: nowTime(),
  });
}

/** Upsert customer when a new order arrives */
export function upsertCustomer(order: Order): void {
  const existing = db.customers.find(
    (c) => c.email.toLowerCase() === order.email.toLowerCase()
  );
  if (existing) {
    existing.totalOrders += 1;
    if (order.paymentStatus === "Paid") existing.totalSpent = parseFloat((existing.totalSpent + order.amount).toFixed(2));
    if (!existing.orderHistory.includes(order.id)) existing.orderHistory.push(order.id);
    existing.address = order.address;
  } else {
    db.customers.push({
      id: generateCustomerId(),
      name: order.customer,
      email: order.email,
      totalOrders: 1,
      totalSpent: order.paymentStatus === "Paid" ? order.amount : 0,
      joinDate: order.date,
      address: order.address,
      orderHistory: [order.id],
    });
  }
}

/** Deduct inventory for products in an order. Returns any low-stock products. */
export function deductInventory(productStr: string, quantity: number): Product[] {
  const lowStockAlerts: Product[] = [];
  const prod = db.products.find((p) => productStr.includes(p.variant));
  if (prod) {
    prod.stock = Math.max(0, prod.stock - quantity);
    prod.sold += quantity;
    if (prod.stock <= prod.lowStockThreshold) {
      lowStockAlerts.push(prod);
    }
  }
  return lowStockAlerts;
}

/** Mock email trigger */
export function triggerEmail(
  type: "confirmation" | "shipping" | "status_update",
  order: Order
): void {
  const messages: Record<string, string> = {
    confirmation: `[EMAIL] Order confirmation sent to ${order.email} for ${order.id} — $${order.amount.toFixed(2)}`,
    shipping: `[EMAIL] Shipping update sent to ${order.email} for ${order.id}`,
    status_update: `[EMAIL] Status update sent to ${order.email} for ${order.id}`,
  };
  console.log(messages[type]);
}
