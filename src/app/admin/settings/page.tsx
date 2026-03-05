"use client";

import { useState, useEffect, useCallback } from "react";
import { useAdminAuth } from "@/lib/admin-auth";
import { Lock, User, Check, AlertCircle, Eye, EyeOff, Bell, Mail, Package, RefreshCw, Save } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminSettings {
  adminEmail: string;
  emailNotificationsEnabled: boolean;
  lowStockAlertEnabled: boolean;
  orderNotificationsEnabled: boolean;
}

export default function SettingsPage() {
  const { changePassword } = useAdminAuth();

  // Notification settings
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // Change password form
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwShow, setPwShow] = useState({ current: false, next: false, confirm: false });
  const [pwStatus, setPwStatus] = useState<"idle" | "success" | "error">("idle");
  const [pwMsg, setPwMsg] = useState("");

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/settings", { cache: "no-store" });
      if (res.ok) setSettings(await res.json());
    } finally {
      setSettingsLoading(false);
    }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSettingsSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        const updated = await res.json();
        setSettings(updated);
        setSettingsSaved(true);
        setTimeout(() => setSettingsSaved(false), 2500);
      }
    } finally {
      setSettingsSaving(false);
    }
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPwStatus("idle");
    if (pwForm.next !== pwForm.confirm) {
      setPwStatus("error");
      setPwMsg("New passwords do not match.");
      return;
    }
    if (pwForm.next.length < 6) {
      setPwStatus("error");
      setPwMsg("New password must be at least 6 characters.");
      return;
    }
    const ok = changePassword(pwForm.current, pwForm.next);
    if (ok) {
      setPwStatus("success");
      setPwMsg("Password updated successfully.");
      setPwForm({ current: "", next: "", confirm: "" });
    } else {
      setPwStatus("error");
      setPwMsg("Current password is incorrect.");
    }
  };

  const Toggle = ({
    checked,
    onChange,
    label,
    description,
    icon: Icon,
  }: {
    checked: boolean;
    onChange: (v: boolean) => void;
    label: string;
    description: string;
    icon: React.ElementType;
  }) => (
    <div className="flex items-start justify-between gap-4 py-4">
      <div className="flex items-start gap-3">
        <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5", checked ? "bg-[#84cc16]/10" : "bg-gray-100")}>
          <Icon className={cn("w-3.5 h-3.5", checked ? "text-[#65a30d]" : "text-gray-400")} />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">{label}</p>
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#84cc16] focus:ring-offset-2",
          checked ? "bg-[#84cc16]" : "bg-gray-200"
        )}
        role="switch"
        aria-checked={checked}
      >
        <span
          className={cn(
            "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200",
            checked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </button>
    </div>
  );

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Settings</h2>
        <p className="text-sm text-gray-500 mt-0.5">Manage your admin account and notification preferences</p>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 bg-[#84cc16]/10 rounded-lg flex items-center justify-center">
            <Bell className="w-3.5 h-3.5 text-[#65a30d]" />
          </div>
          <h3 className="text-sm font-bold text-gray-900">Notification Settings</h3>
        </div>
        <p className="text-xs text-gray-500 mb-4 ml-9">Control what triggers alerts and emails</p>

        {settingsLoading || !settings ? (
          <div className="flex items-center gap-2 py-4 text-gray-400 text-sm">
            <RefreshCw className="w-4 h-4 animate-spin" /> Loading...
          </div>
        ) : (
          <form onSubmit={saveSettings}>
            <div className="space-y-0 divide-y divide-gray-50">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Admin Email (receives notifications)</label>
                <input
                  type="email"
                  value={settings.adminEmail}
                  onChange={(e) => setSettings((s) => s ? { ...s, adminEmail: e.target.value } : s)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#84cc16] transition mb-4"
                  placeholder="admin@example.com"
                />
              </div>

              <Toggle
                checked={settings.orderNotificationsEnabled}
                onChange={(v) => setSettings((s) => s ? { ...s, orderNotificationsEnabled: v } : s)}
                label="Order Notifications"
                description="Show bell alert when a new order is placed"
                icon={Bell}
              />
              <Toggle
                checked={settings.emailNotificationsEnabled}
                onChange={(v) => setSettings((s) => s ? { ...s, emailNotificationsEnabled: v } : s)}
                label="Email Notifications"
                description="Send confirmation + shipping emails to customers"
                icon={Mail}
              />
              <Toggle
                checked={settings.lowStockAlertEnabled}
                onChange={(v) => setSettings((s) => s ? { ...s, lowStockAlertEnabled: v } : s)}
                label="Low Stock Alerts"
                description="Notify when product inventory falls below threshold"
                icon={Package}
              />
            </div>

            <button
              type="submit"
              disabled={settingsSaving}
              className={cn(
                "mt-5 flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition",
                settingsSaved
                  ? "bg-green-100 text-green-700"
                  : "bg-[#84cc16] hover:bg-[#65a30d] text-black disabled:opacity-60"
              )}
            >
              {settingsSaved ? (
                <><Check className="w-4 h-4" /> Saved!</>
              ) : settingsSaving ? (
                <><RefreshCw className="w-4 h-4 animate-spin" /> Saving...</>
              ) : (
                <><Save className="w-4 h-4" /> Save Settings</>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Admin Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-7 h-7 bg-[#84cc16]/10 rounded-lg flex items-center justify-center">
            <User className="w-3.5 h-3.5 text-[#65a30d]" />
          </div>
          <h3 className="text-sm font-bold text-gray-900">Admin Account</h3>
        </div>
        <div className="bg-gray-50 rounded-lg px-4 py-3 text-sm text-gray-600">
          <p><span className="font-semibold text-gray-800">Username:</span> admin</p>
          <p className="mt-1 text-xs text-gray-400">Change your login password below.</p>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-7 h-7 bg-[#84cc16]/10 rounded-lg flex items-center justify-center">
            <Lock className="w-3.5 h-3.5 text-[#65a30d]" />
          </div>
          <h3 className="text-sm font-bold text-gray-900">Change Password</h3>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          {(["current", "next", "confirm"] as const).map((field) => {
            const labels = { current: "Current Password", next: "New Password", confirm: "Confirm New Password" };
            return (
              <div key={field}>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">{labels[field]}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={pwShow[field] ? "text" : "password"}
                    value={pwForm[field]}
                    onChange={(e) => setPwForm((f) => ({ ...f, [field]: e.target.value }))}
                    className="w-full pl-10 pr-10 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#84cc16] transition"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setPwShow((s) => ({ ...s, [field]: !s[field] }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                  >
                    {pwShow[field] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            );
          })}

          {pwStatus !== "idle" && (
            <div className={cn(
              "flex items-center gap-2 px-4 py-3 rounded-lg text-sm",
              pwStatus === "success"
                ? "bg-green-50 border border-green-200 text-green-700"
                : "bg-red-50 border border-red-200 text-red-600"
            )}>
              {pwStatus === "success" ? <Check className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
              {pwMsg}
            </div>
          )}

          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold bg-[#84cc16] hover:bg-[#65a30d] text-black transition"
          >
            <Lock className="w-4 h-4" /> Update Password
          </button>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-xl border border-red-100 p-6">
        <h3 className="text-sm font-bold text-red-600 mb-1">Danger Zone</h3>
        <p className="text-xs text-gray-500 mb-4">These actions are irreversible. Please be certain.</p>
        <button
          disabled
          className="px-4 py-2 rounded-lg text-sm font-semibold border border-red-200 text-red-400 cursor-not-allowed opacity-50"
          title="Not available in demo"
        >
          Reset All Data (disabled in demo)
        </button>
      </div>
    </div>
  );
}
