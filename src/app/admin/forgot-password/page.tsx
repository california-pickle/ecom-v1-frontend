"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // API Route: Apnar backend-er exact route ekhane boshaben
      const response = await fetch(
        "http://localhost:5000/api/auth/forgot-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          // Zod validation er jonno email pathaccho
          body: JSON.stringify({ email }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        setSubmitted(true);
        // Backend theke asha message ta state a save korchi
        setSuccessMessage(data.message);
      } else {
        // Zod theke validation error ashle ba backend theke error ashle
        if (data.errors) {
          setError("Please provide a valid email address.");
        } else {
          setError(data.message || "Something went wrong. Please try again.");
        }
      }
    } catch (err) {
      setError("Server error. Cannot connect to the backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 bg-[#84cc16] rounded-lg flex items-center justify-center">
              <span className="text-black font-black text-lg">P</span>
            </div>
            <span className="text-2xl font-black text-gray-900 tracking-tight">
              PICKLE
            </span>
            <span className="text-2xl font-black text-[#84cc16] tracking-tight">
              ADMIN
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {!submitted ? (
            <>
              <h1 className="text-xl font-bold text-gray-900 mb-1">
                Reset Password
              </h1>
              <p className="text-gray-500 text-sm mb-6">
                Enter your admin email address and we&apos;ll send you
                instructions to reset your password.
              </p>

              {/* Error Message Alert */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Admin Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#84cc16] focus:border-transparent transition"
                    placeholder="admin@example.com"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full bg-[#84cc16] hover:bg-[#65a30d] text-black font-bold py-2.5 rounded-lg text-sm transition flex justify-center items-center ${
                    loading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {loading ? (
                    <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></span>
                  ) : null}
                  {loading ? "Sending..." : "Send Reset Request"}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <CheckCircle className="w-12 h-12 text-[#84cc16] mx-auto mb-3" />
              <h2 className="text-lg font-bold text-gray-900 mb-2">
                Request Sent Successfully
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                {/* Ekhane backend theke pathano message ta dekhano hobe */}
                {successMessage}
              </p>

              {/* Reset korar por ba link check korar por login e back korar option */}
              <Link
                href="/admin/login"
                className="block w-full bg-gray-900 hover:bg-black text-white font-bold py-2.5 rounded-lg text-sm transition text-center"
              >
                Return to Login
              </Link>
            </div>
          )}

          {!submitted && (
            <div className="mt-6 text-center">
              <Link
                href="/admin/login"
                className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
