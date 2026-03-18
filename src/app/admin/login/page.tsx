"use client";

import { useEffect, useState } from "react";
// 1. ASOL BACKEND ENGINE IMPORT KORCHI EKHAANE:
import { useLogin } from "@/services/auth/auth.hooks";
import { useAdminAuth } from "@/lib/admin-auth";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import Link from "next/link";
import logo from "../../../../public/logo.webp";

export default function AdminLoginPage() {
  const { isAuthenticated } = useAdminAuth();
  const router = useRouter();

  // Redirect authenticated admins to dashboard
  useEffect(() => {
    if (isAuthenticated) router.replace("/admin/dashboard");
  }, [isAuthenticated, router]);

  // 2. AMADER TANSTACK QUERY HOOK NEYA HOLO
  const { mutate: loginAdmin, isPending, isError, error } = useLogin();

  // 3. BACKEND ER JONNO EMAIL AR PASSWORD STATE
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  // 4. EI FUNCTION TA ASOL BACKEND-E REQUEST PATHABE
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginAdmin({ email, password }); // Payload pathacchi
  };

  // Don't render login form while redirecting authenticated users
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#84cc16] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center">
              <img src="/logo.webp" alt="logo" width={40} height={40} />
            </div>
            <span className="text-2xl font-black text-gray-900 tracking-tight">The California</span>
            <span className="text-2xl font-black text-[#84cc16] tracking-tight">PICKLE</span>
          </div>
          <p className="text-gray-500 text-sm mt-1">Management Dashboard</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h1 className="text-xl font-bold text-gray-900 mb-1">Sign in</h1>
          <p className="text-gray-500 text-sm mb-6">Enter your admin email to continue</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#84cc16] focus:border-transparent transition"
                  placeholder="admin@example.com"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#84cc16] focus:border-transparent transition"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Asol Backend theke asha Error Message */}
            {isError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 font-medium">
                {(error as any)?.response?.data?.message || "Invalid credentials. Please try again."}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-[#84cc16] hover:bg-[#65a30d] text-black font-bold py-2.5 rounded-lg text-sm transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPending ? "Signing in to Server..." : "Sign In"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link
              href="/admin/forgot-password"
              className="text-sm text-[#84cc16] hover:text-[#65a30d] font-medium transition"
            >
              Forgot password?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
// -----
