export interface Order {
  id: string;
  customer: string;
  email: string;
  address: string;
  product: string;
  quantity: number;
  amount: number;
  status: "Pending" | "Shipped" | "Delivered" | "Cancelled";
  date: string;
  paymentStatus: "Paid" | "Refunded" | "Pending";
  notes: string;
}

export interface Product {
  id: string;
  name: string;
  image: string;
  variant: "60ml Pack (x12)" | "Half Gallon" | "1 Gallon";
  price: number;
  stock: number;
  sold: number;
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

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

export const mockOrders: Order[] = [
  { id: "ORD-1001", customer: "Marcus Rivera", email: "marcus@email.com", address: "142 Sunset Blvd, Los Angeles, CA 90028", product: "60ml Pack (x12)", quantity: 2, amount: 59.98, status: "Delivered", date: "2026-02-28", paymentStatus: "Paid", notes: "" },
  { id: "ORD-1002", customer: "Priya Nair", email: "priya@email.com", address: "87 Ocean Ave, Santa Monica, CA 90401", product: "Half Gallon", quantity: 1, amount: 34.99, status: "Shipped", date: "2026-02-27", paymentStatus: "Paid", notes: "Leave at door" },
  { id: "ORD-1003", customer: "Jake Thompson", email: "jake@email.com", address: "23 Elm St, San Diego, CA 92101", product: "1 Gallon", quantity: 1, amount: 54.99, status: "Pending", date: "2026-02-27", paymentStatus: "Paid", notes: "" },
  { id: "ORD-1004", customer: "Sofia Chen", email: "sofia@email.com", address: "500 Market St, San Francisco, CA 94105", product: "60ml Pack (x12)", quantity: 3, amount: 89.97, status: "Delivered", date: "2026-02-26", paymentStatus: "Paid", notes: "" },
  { id: "ORD-1005", customer: "Derek Brown", email: "derek@email.com", address: "11 Pine Rd, Oakland, CA 94601", product: "Half Gallon", quantity: 2, amount: 69.98, status: "Cancelled", date: "2026-02-25", paymentStatus: "Refunded", notes: "Customer requested cancel" },
  { id: "ORD-1006", customer: "Ava Martinez", email: "ava@email.com", address: "9 Broadway, Sacramento, CA 95814", product: "1 Gallon", quantity: 2, amount: 109.98, status: "Delivered", date: "2026-02-24", paymentStatus: "Paid", notes: "" },
  { id: "ORD-1007", customer: "Liam O'Brien", email: "liam@email.com", address: "77 Harbor Dr, Long Beach, CA 90802", product: "60ml Pack (x12)", quantity: 1, amount: 29.99, status: "Shipped", date: "2026-02-24", paymentStatus: "Paid", notes: "" },
  { id: "ORD-1008", customer: "Zoe Kim", email: "zoe@email.com", address: "304 Valley Rd, Pasadena, CA 91101", product: "Half Gallon", quantity: 1, amount: 34.99, status: "Pending", date: "2026-02-23", paymentStatus: "Pending", notes: "" },
  { id: "ORD-1009", customer: "Noah Williams", email: "noah@email.com", address: "18 Central Ave, Fresno, CA 93701", product: "1 Gallon", quantity: 1, amount: 54.99, status: "Delivered", date: "2026-02-22", paymentStatus: "Paid", notes: "" },
  { id: "ORD-1010", customer: "Emma Davis", email: "emma@email.com", address: "62 Redwood Ln, San Jose, CA 95101", product: "60ml Pack (x12)", quantity: 4, amount: 119.96, status: "Delivered", date: "2026-02-21", paymentStatus: "Paid", notes: "Gift wrap please" },
  { id: "ORD-1011", customer: "Carlos Reyes", email: "carlos@email.com", address: "400 Desert Rd, Palm Springs, CA 92262", product: "1 Gallon", quantity: 1, amount: 54.99, status: "Shipped", date: "2026-02-20", paymentStatus: "Paid", notes: "" },
  { id: "ORD-1012", customer: "Hannah Lee", email: "hannah@email.com", address: "55 Maple Ave, Irvine, CA 92602", product: "Half Gallon", quantity: 3, amount: 104.97, status: "Delivered", date: "2026-02-19", paymentStatus: "Paid", notes: "" },
];

export const mockProducts: Product[] = [
  { id: "PROD-001", name: "California Pickle Shot", image: "https://i.ibb.co/JjGQ5Y9/product-shot.png", variant: "60ml Pack (x12)", price: 29.99, stock: 142, sold: 284 },
  { id: "PROD-002", name: "California Pickle Juice", image: "https://i.ibb.co/JjGQ5Y9/product-shot.png", variant: "Half Gallon", price: 34.99, stock: 89, sold: 176 },
  { id: "PROD-003", name: "California Pickle Juice", image: "https://i.ibb.co/JjGQ5Y9/product-shot.png", variant: "1 Gallon", price: 54.99, stock: 56, sold: 98 },
];

export const mockCustomers: Customer[] = [
  { id: "CUST-001", name: "Marcus Rivera", email: "marcus@email.com", totalOrders: 3, totalSpent: 164.97, joinDate: "2025-11-10", address: "142 Sunset Blvd, Los Angeles, CA 90028", orderHistory: ["ORD-1001", "ORD-1004", "ORD-1010"] },
  { id: "CUST-002", name: "Priya Nair", email: "priya@email.com", totalOrders: 2, totalSpent: 89.98, joinDate: "2025-12-05", address: "87 Ocean Ave, Santa Monica, CA 90401", orderHistory: ["ORD-1002", "ORD-1007"] },
  { id: "CUST-003", name: "Jake Thompson", email: "jake@email.com", totalOrders: 1, totalSpent: 54.99, joinDate: "2026-01-15", address: "23 Elm St, San Diego, CA 92101", orderHistory: ["ORD-1003"] },
  { id: "CUST-004", name: "Sofia Chen", email: "sofia@email.com", totalOrders: 4, totalSpent: 324.93, joinDate: "2025-10-02", address: "500 Market St, San Francisco, CA 94105", orderHistory: ["ORD-1004", "ORD-1006", "ORD-1009", "ORD-1012"] },
  { id: "CUST-005", name: "Derek Brown", email: "derek@email.com", totalOrders: 1, totalSpent: 0, joinDate: "2026-02-01", address: "11 Pine Rd, Oakland, CA 94601", orderHistory: ["ORD-1005"] },
  { id: "CUST-006", name: "Ava Martinez", email: "ava@email.com", totalOrders: 2, totalSpent: 219.96, joinDate: "2025-09-20", address: "9 Broadway, Sacramento, CA 95814", orderHistory: ["ORD-1006", "ORD-1011"] },
  { id: "CUST-007", name: "Liam O'Brien", email: "liam@email.com", totalOrders: 2, totalSpent: 84.98, joinDate: "2025-11-30", address: "77 Harbor Dr, Long Beach, CA 90802", orderHistory: ["ORD-1007", "ORD-1008"] },
  { id: "CUST-008", name: "Emma Davis", email: "emma@email.com", totalOrders: 3, totalSpent: 274.94, joinDate: "2025-08-14", address: "62 Redwood Ln, San Jose, CA 95101", orderHistory: ["ORD-1010", "ORD-1012"] },
];

export const mockEmailTemplates: EmailTemplate[] = [
  {
    id: "EMAIL-001",
    name: "Order Confirmation",
    subject: "Your California Pickle order is confirmed! 🥒",
    body: `Hi {{customer_name}},

Thanks for your order! We're prepping your California Pickle juice and will have it out to you soon.

Order ID: {{order_id}}
Product: {{product}}
Total: {{amount}}

Stay hydrated and stay pickled.

— The California Pickle Team`,
  },
  {
    id: "EMAIL-002",
    name: "Shipping Update",
    subject: "Your order is on its way! 🚚",
    body: `Hi {{customer_name}},

Great news — your California Pickle order has shipped!

Order ID: {{order_id}}
Tracking: {{tracking_number}}
Estimated Delivery: {{delivery_date}}

Questions? Reply to this email anytime.

— The California Pickle Team`,
  },
];

export const salesChartData = [
  { date: "Feb 1", revenue: 320, orders: 6 },
  { date: "Feb 5", revenue: 580, orders: 11 },
  { date: "Feb 8", revenue: 420, orders: 8 },
  { date: "Feb 10", revenue: 750, orders: 14 },
  { date: "Feb 12", revenue: 640, orders: 12 },
  { date: "Feb 14", revenue: 920, orders: 18 },
  { date: "Feb 16", revenue: 810, orders: 15 },
  { date: "Feb 18", revenue: 1100, orders: 21 },
  { date: "Feb 20", revenue: 980, orders: 19 },
  { date: "Feb 22", revenue: 1350, orders: 26 },
  { date: "Feb 24", revenue: 1180, orders: 22 },
  { date: "Feb 26", revenue: 1520, orders: 29 },
  { date: "Feb 28", revenue: 1680, orders: 31 },
];
