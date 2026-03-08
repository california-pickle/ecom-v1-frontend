"use client";

import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Search, ShoppingCart, Package, Activity, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogEntry {
  id: string;
  action: string;
  detail: string;
  date: string;
  time: string;
}

const actionConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  "Order Created": { icon: ShoppingCart, color: "text-green-600", bg: "bg-green-50" },
  "Status Changed": { icon: Activity, color: "text-blue-600", bg: "bg-blue-50" },
  "Order Cancelled": { icon: ShoppingCart, color: "text-red-500", bg: "bg-red-50" },
  "Refund Issued": { icon: ShoppingCart, color: "text-orange-500", bg: "bg-orange-50" },
  "Low Stock Alert": { icon: Package, color: "text-yellow-600", bg: "bg-yellow-50" },
};

const fallback = { icon: Settings, color: "text-gray-500", bg: "bg-gray-100" };

function groupByDate(logs: LogEntry[]) {
  const groups: Record<string, LogEntry[]> = {};
  for (const log of logs) {
    if (!groups[log.date]) groups[log.date] = [];
    groups[log.date].push(log);
  }
  return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
}

export default function ActivityPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch("/api/logs", { cache: "no-store" });
      const data = await res.json();
      setLogs(Array.isArray(data) ? data : []);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const filtered = logs.filter((l) => {
    const q = search.toLowerCase();
    return !q || l.action.toLowerCase().includes(q) || l.detail.toLowerCase().includes(q);
  });

  const grouped = groupByDate(filtered);

  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  function formatDateLabel(d: string) {
    if (d === today) return "Today";
    if (d === yesterday) return "Yesterday";
    return d;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm gap-2">
        <RefreshCw className="w-4 h-4 animate-spin" /> Loading activity...
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Activity Log</h2>
          <p className="text-sm text-gray-500 mt-0.5">{logs.length} total events tracked</p>
        </div>
        <button
          onClick={() => { setLoading(true); fetchLogs(); }}
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800 transition px-3 py-1.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search actions, details..."
          className="pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-[#84cc16] bg-white"
        />
      </div>

      {/* Timeline */}
      {grouped.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center text-gray-400 text-sm">
          No activity found.
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(([date, entries]) => (
            <div key={date}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-black text-gray-500 uppercase tracking-wide">
                  {formatDateLabel(date)}
                </span>
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-400">{entries.length} event{entries.length !== 1 ? "s" : ""}</span>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {entries.map((log, i) => {
                  const cfg = actionConfig[log.action] ?? fallback;
                  const Icon = cfg.icon;
                  return (
                    <div
                      key={log.id}
                      className={cn(
                        "flex items-start gap-4 px-5 py-4 transition hover:bg-gray-50/50",
                        i < entries.length - 1 && "border-b border-gray-50"
                      )}
                    >
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5", cfg.bg)}>
                        <Icon className={cn("w-3.5 h-3.5", cfg.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className={cn("text-xs font-bold", cfg.color)}>{log.action}</span>
                          <span className="text-xs text-gray-400 flex-shrink-0 font-mono">{log.time}</span>
                        </div>
                        <p className="text-sm text-gray-700 mt-0.5">{log.detail}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
