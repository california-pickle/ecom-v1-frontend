"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAdminAuth } from "@/lib/admin-auth";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  Mail,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Bell,
  Activity,
  ClipboardList,
  Tag,
} from "lucide-react";
import { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  href: string;
  read: boolean;
  date: string;
}

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/bulk-orders", label: "Bulk Orders", icon: ClipboardList, priority: true },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/activity", label: "Activity Log", icon: Activity },
  { href: "/admin/coupons", label: "Coupons", icon: Tag },
  { href: "/admin/emails", label: "Emails", icon: Mail },
];

export function AdminSidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  const pathname = usePathname();
  const { logout } = useAdminAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
  };

  const content = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#84cc16] rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-black font-black text-sm">P</span>
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-black text-gray-900 tracking-tight">PICKLE</span>
              <span className="text-sm font-black text-[#84cc16] tracking-tight">ADMIN</span>
            </div>
            <p className="text-[10px] text-gray-400 font-medium tracking-wide uppercase">Control Panel</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon, priority }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group",
                active
                  ? priority
                    ? "bg-amber-100 text-amber-800"
                    : "bg-[#84cc16]/10 text-[#65a30d]"
                  : priority
                    ? "text-amber-700 hover:bg-amber-50 bg-amber-50/50"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              )}
            >
              <Icon className={cn(
                "w-4 h-4 flex-shrink-0",
                active
                  ? priority ? "text-amber-700" : "text-[#65a30d]"
                  : priority ? "text-amber-500" : "text-gray-400 group-hover:text-gray-600"
              )} />
              <span className="flex-1">{label}</span>
              {priority && !active && (
                <span className="text-[9px] font-black bg-amber-400 text-white px-1.5 py-0.5 rounded uppercase tracking-wide">
                  PRIORITY
                </span>
              )}
              {active && <ChevronRight className={cn("w-3 h-3", priority ? "text-amber-700" : "text-[#65a30d]")} />}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all group"
        >
          <LogOut className="w-4 h-4 text-gray-400 group-hover:text-red-500" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex flex-col w-56 bg-white border-r border-gray-200 fixed left-0 top-0 h-full z-30">
        {content}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/40" onClick={onClose} />
          <aside className="relative w-56 bg-white h-full z-50 shadow-xl">
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
            {content}
          </aside>
        </div>
      )}
    </>
  );
}

export function AdminTopbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { logout } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();

  const currentPage = navItems.find((n) => pathname === n.href || pathname.startsWith(n.href + "/"))?.label ?? "Admin";

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  const fetchNotifs = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setNotifications(data.notifications ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 15000); // poll every 15s
    return () => clearInterval(interval);
  }, [fetchNotifs]);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setBellOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const markAllRead = async () => {
    await fetch("/api/notifications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleNotifClick = async (notif: Notification) => {
    if (!notif.read) {
      await fetch("/api/notifications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: notif.id }) });
      setNotifications((prev) => prev.map((n) => n.id === notif.id ? { ...n, read: true } : n));
      setUnreadCount((c) => Math.max(0, c - 1));
    }
    setBellOpen(false);
    router.push(notif.href);
  };

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
  };

  const typeIcon: Record<string, string> = {
    order: "🛒",
    bulk_order: "📦",
    status_change: "🔄",
    low_stock: "⚠️",
  };

  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-gray-400 hover:text-gray-600 transition"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-sm font-semibold text-gray-800">{currentPage}</h1>
      </div>

      <div className="flex items-center gap-2">
        {/* Notification Bell */}
        <div className="relative" ref={bellRef}>
          <button
            onClick={() => setBellOpen((o) => !o)}
            className="relative p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
            )}
          </button>

          {bellOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <Bell className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-sm font-bold text-gray-800">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">{unreadCount}</span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs font-semibold text-[#65a30d] hover:underline">
                    Mark all read
                  </button>
                )}
              </div>

              {/* List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-gray-400">No notifications yet</div>
                ) : (
                  notifications.slice(0, 15).map((notif) => (
                    <button
                      key={notif.id}
                      onClick={() => handleNotifClick(notif)}
                      className={cn(
                        "w-full text-left px-4 py-3 hover:bg-gray-50 transition flex items-start gap-3",
                        !notif.read && "bg-blue-50/50"
                      )}
                    >
                      <span className="text-base mt-0.5 flex-shrink-0">{typeIcon[notif.type] ?? "🔔"}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={cn("text-xs font-bold truncate", notif.read ? "text-gray-600" : "text-gray-900")}>
                            {notif.title}
                          </p>
                          {!notif.read && <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{notif.date}</p>
                      </div>
                    </button>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/50">
                <Link
                  href="/admin/activity"
                  onClick={() => setBellOpen(false)}
                  className="text-xs font-semibold text-[#65a30d] hover:underline"
                >
                  View activity log →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Admin badge */}
        <div className="hidden sm:flex items-center gap-2">
          <div className="w-7 h-7 bg-[#84cc16]/20 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-[#65a30d]">A</span>
          </div>
          <span className="text-sm font-medium text-gray-700">Admin</span>
        </div>

      </div>
    </header>
  );
}
