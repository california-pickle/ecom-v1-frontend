"use client";

import { useState, useEffect, useCallback } from "react";
import { MapPin, Check, RefreshCw, Save, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import axiosInstance from "@/lib/axiosInstance";

interface ShipFrom {
  name: string;
  company: string;
  street1: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  phone: string;
  email: string;
}

const emptyShipFrom: ShipFrom = {
  name: "",
  company: "",
  street1: "",
  city: "",
  state: "",
  zip: "",
  country: "US",
  phone: "",
  email: "",
};

export default function SettingsPage() {
  const [shipFrom, setShipFrom] = useState<ShipFrom>(emptyShipFrom);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const fetchSettings = useCallback(async () => {
    try {
      const res = await axiosInstance.get("/settings");
      if (res.data?.shipFrom) {
        setShipFrom(res.data.shipFrom);
      }
    } catch {
      setError("Failed to load settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await axiosInstance.put("/settings", { shipFrom });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      const issues = err?.response?.data?.errors;
      if (issues && Array.isArray(issues)) {
        setError(issues.map((i: any) => i.message).join(", "));
      } else {
        setError("Failed to save settings. Please check your inputs.");
      }
    } finally {
      setSaving(false);
    }
  };

  const field = (
    key: keyof ShipFrom,
    label: string,
    placeholder: string,
    opts?: { half?: boolean; maxLength?: number }
  ) => (
    <div className={opts?.half ? "" : "col-span-2"}>
      <label className="block text-xs font-semibold text-gray-600 mb-1.5">{label}</label>
      <input
        type="text"
        value={shipFrom[key]}
        onChange={(e) => setShipFrom((s) => ({ ...s, [key]: e.target.value }))}
        placeholder={placeholder}
        maxLength={opts?.maxLength}
        className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#84cc16] transition"
        required
      />
    </div>
  );

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Settings</h2>
        <p className="text-sm text-gray-500 mt-0.5">Configure your shipping origin address used for rate calculations</p>
      </div>

      {/* Ship From Settings */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 bg-[#84cc16]/10 rounded-lg flex items-center justify-center">
            <MapPin className="w-3.5 h-3.5 text-[#65a30d]" />
          </div>
          <h3 className="text-sm font-bold text-gray-900">Ship From Address</h3>
        </div>
        <p className="text-xs text-gray-500 mb-5 ml-9">
          This address is used by Shippo to calculate real-time shipping rates at checkout.
        </p>

        {loading ? (
          <div className="flex items-center gap-2 py-4 text-gray-400 text-sm">
            <RefreshCw className="w-4 h-4 animate-spin" /> Loading settings...
          </div>
        ) : (
          <form onSubmit={handleSave}>
            <div className="grid grid-cols-2 gap-4">
              {field("name", "Sender Name", "John Smith", { half: true })}
              {field("company", "Company Name", "California Pickle Co.", { half: true })}
              {field("street1", "Street Address", "123 Main St", {})}
              {field("city", "City", "Los Angeles", { half: true })}
              {field("state", "State (2-letter)", "CA", { half: true, maxLength: 2 })}
              {field("zip", "ZIP Code", "90001", { half: true })}
              {field("country", "Country Code", "US", { half: true, maxLength: 2 })}
              {field("phone", "Phone (10 digits)", "3105550000", { half: true })}
              {field("email", "Email", "shipping@example.com", { half: true })}
            </div>

            {error && (
              <div className="mt-4 flex items-start gap-2 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className={cn(
                "mt-5 flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition",
                saved
                  ? "bg-green-100 text-green-700"
                  : "bg-[#84cc16] hover:bg-[#65a30d] text-black disabled:opacity-60"
              )}
            >
              {saved ? (
                <><Check className="w-4 h-4" /> Saved!</>
              ) : saving ? (
                <><RefreshCw className="w-4 h-4 animate-spin" /> Saving...</>
              ) : (
                <><Save className="w-4 h-4" /> Save Settings</>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
        <p className="font-semibold mb-1">Why is this needed?</p>
        <p className="text-xs leading-relaxed">
          Shippo needs your ship-from address to calculate accurate carrier rates (USPS, FedEx, UPS) at checkout.
          Make sure the address matches your actual shipping location for accurate rate quotes.
        </p>
      </div>
    </div>
  );
}
