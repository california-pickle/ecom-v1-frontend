"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-[#84cc16] rounded-lg flex items-center justify-center">
              <span className="text-black font-black text-lg">P</span>
            </div>
            <span className="text-2xl font-black text-gray-900 tracking-tight">PICKLE</span>
            <span className="text-2xl font-black text-[#84cc16] tracking-tight">ADMIN</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {!submitted ? (
            <>
              <h1 className="text-xl font-bold text-gray-900 mb-1">Reset Password</h1>
              <p className="text-gray-500 text-sm mb-6">
                Contact your system administrator to reset your admin password. Alternatively, use the Settings page if you&apos;re logged in.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Admin Username</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#84cc16] focus:border-transparent transition"
                    placeholder="Enter your username"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#84cc16] hover:bg-[#65a30d] text-black font-bold py-2.5 rounded-lg text-sm transition"
                >
                  Send Reset Request
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <CheckCircle className="w-12 h-12 text-[#84cc16] mx-auto mb-3" />
              <h2 className="text-lg font-bold text-gray-900 mb-2">Request Sent</h2>
              <p className="text-gray-500 text-sm">Your reset request has been logged. Please contact your system administrator.</p>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link href="/admin/login" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition">
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
