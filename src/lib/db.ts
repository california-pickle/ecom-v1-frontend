/**
 * In-memory store for notifications and activity logs only.
 * Orders/customers/products/settings are now served from the real backend.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Seed notifications ───────────────────────────────────────────────────────

const seedNotifications: Notification[] = [
  { id: "NOTIF-001", type: "order", title: "New Order Placed", message: "New order received — check orders page", href: "/admin/orders", read: true, date: "2026-02-28" },
];

// ─── Seed activity log ────────────────────────────────────────────────────────

const seedLogs: ActivityLog[] = [
  { id: "LOG-001", action: "Order Created", detail: "New order placed by customer", date: "2026-02-28", time: "09:14" },
  { id: "LOG-002", action: "Status Changed", detail: "Order marked as Shipped", date: "2026-02-27", time: "14:22" },
];

// ─── Singleton global store ───────────────────────────────────────────────────

declare global {
  // eslint-disable-next-line no-var
  var __db:
    | {
        notifications: Notification[];
        logs: ActivityLog[];
        notifCounter: number;
        logCounter: number;
      }
    | undefined;
}

if (!global.__db) {
  global.__db = {
    notifications: [...seedNotifications],
    logs: [...seedLogs],
    notifCounter: 1,
    logCounter: 2,
  };
}

export const db = global.__db;

// ─── ID generators ────────────────────────────────────────────────────────────

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
