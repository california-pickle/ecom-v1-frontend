/**
 * In-memory store for bulk orders, notifications, and activity logs.
 * Orders/customers/products/settings are served from the real backend.
 * Data is persisted to ./data/db.json on every mutation so restarts don't wipe it.
 */
import fs from "fs";
import path from "path";

const DATA_FILE = path.join(process.cwd(), "data", "db.json");

function loadFromDisk(): Record<string, any> | null {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    }
  } catch {
    // Corrupt file — start fresh
  }
  return null;
}

export function persistDb(): void {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(global.__db, null, 2), "utf8");
  } catch (err) {
    console.error("[db] Failed to persist to disk:", err);
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface EmailTemplate {
  id: string;
  name: string;
  type: "order_confirmation" | "shipping_update" | "custom";
  subject: string;
  /** For pre-designed templates: editable fields only */
  fields: Record<string, string>;
  /** For custom template: full body */
  body: string;
  locked: boolean; // true = pre-designed, admin can only edit fields
}

export interface SentEmail {
  id: string;
  to: string;
  toName: string;
  subject: string;
  body: string;
  sentAt: string;
}

export interface BulkOrder {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  quantity: string;
  message: string;
  status: "New" | "Contacted" | "Closed" | "Cancelled";
  date: string;
  time: string;
}

export interface Notification {
  id: string;
  type: "order" | "status_change" | "low_stock";
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

// ─── Seed email templates ─────────────────────────────────────────────────────

const seedEmailTemplates: EmailTemplate[] = [
  {
    id: "TPL-001",
    name: "Order Confirmation",
    type: "order_confirmation",
    subject: "Your California Pickle order is confirmed!",
    fields: {
      greeting: "Thanks for your order! We're prepping your California Pickle juice and will have it out to you soon.",
      closing: "Stay hydrated and stay pickled.\n\n— The California Pickle Team",
    },
    body: "",
    locked: true,
  },
  {
    id: "TPL-002",
    name: "Shipping Update",
    type: "shipping_update",
    subject: "Your order is on its way!",
    fields: {
      message: "Great news — your California Pickle order has shipped! You can track your package using the link below.",
      closing: "Questions? Reply to this email anytime.\n\n— The California Pickle Team",
    },
    body: "",
    locked: true,
  },
  {
    id: "TPL-003",
    name: "Custom Email",
    type: "custom",
    subject: "",
    fields: {},
    body: "",
    locked: false,
  },
];

// ─── Seed sent emails ─────────────────────────────────────────────────────────

const seedSentEmails: SentEmail[] = [];

// ─── Seed notifications ───────────────────────────────────────────────────────

const seedNotifications: Notification[] = [
  { id: "NOTIF-001", type: "order", title: "New Order Placed", message: "New order received — check orders page", href: "/admin/orders", read: true, date: "2026-02-28" },
];

// ─── Seed activity log ────────────────────────────────────────────────────────

const seedLogs: ActivityLog[] = [
  { id: "LOG-001", action: "Order Created", detail: "New order placed by customer", date: "2026-02-28", time: "09:14" },
  { id: "LOG-002", action: "Status Changed", detail: "Order marked as Shipped", date: "2026-02-27", time: "14:22" },
];

// ─── Seed bulk orders ─────────────────────────────────────────────────────────

const seedBulkOrders: BulkOrder[] = [];

// ─── Singleton global store ───────────────────────────────────────────────────

declare global {
  // eslint-disable-next-line no-var
  var __db:
    | {
        bulkOrders: BulkOrder[];
        notifications: Notification[];
        logs: ActivityLog[];
        emailTemplates: EmailTemplate[];
        sentEmails: SentEmail[];
        bulkCounter: number;
        notifCounter: number;
        logCounter: number;
        sentEmailCounter: number;
      }
    | undefined;
}

if (!global.__db) {
  const saved = loadFromDisk();
  global.__db = {
    bulkOrders:     saved?.bulkOrders     ?? [...seedBulkOrders],
    notifications:  saved?.notifications  ?? [...seedNotifications],
    logs:           saved?.logs           ?? [...seedLogs],
    emailTemplates: saved?.emailTemplates ?? [...seedEmailTemplates],
    sentEmails:     saved?.sentEmails     ?? [...seedSentEmails],
    bulkCounter:        saved?.bulkCounter        ?? 0,
    notifCounter:       saved?.notifCounter       ?? 1,
    logCounter:         saved?.logCounter         ?? 2,
    sentEmailCounter:   saved?.sentEmailCounter   ?? 0,
  };
}

export const db = global.__db;

// ─── ID generators ────────────────────────────────────────────────────────────

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

/** Generate sent email ID */
export function generateSentEmailId(): string {
  db.sentEmailCounter += 1;
  return `SENT-${String(db.sentEmailCounter).padStart(3, "0")}`;
}

