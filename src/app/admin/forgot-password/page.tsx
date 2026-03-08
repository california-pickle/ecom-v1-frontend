"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axiosInstance"; // tomar existing axios instance

// ============================================================
// FORGOT PASSWORD PAGE — Backend connected
// Copy this to: src/app/admin/forgot-password/page.tsx
// ============================================================
export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // ✅ BACKEND: POST /auth/forgot-password { email }
      // Backend silently return kore jodi email na thake, tai always success dekhao
      await axiosInstance.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err: any) {
      // Network error ba server error
      setError(
        err?.response?.data?.message ||
          "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&display=swap');
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes popIn {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="min-h-screen bg-[#f4f6f3] flex flex-col items-center justify-center px-4 relative overflow-hidden">
        {/* Background grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(100,170,40,0.06) 1px, transparent 1px),
              linear-gradient(90deg, rgba(100,170,40,0.06) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Green blob top-right */}
        <div
          className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(100,190,30,0.12) 0%, transparent 70%)",
          }}
        />

        {/* Logo */}
        <div
          className="flex items-center gap-2.5 mb-8 z-10"
          style={{ animation: "fadeDown 0.6s ease both" }}
        >
          <div
            className="w-[42px] h-[42px] rounded-[10px] flex items-center justify-center font-extrabold text-lg text-[#1a2a0a]"
            style={{
              background: "linear-gradient(135deg, #7dc61e, #5aa012)",
              boxShadow: "0 4px 14px rgba(100,190,30,0.35)",
              fontFamily: "'Syne', sans-serif",
            }}
          >
            P
          </div>
          <span
            className="font-bold text-xl tracking-wide text-[#1a2a0a]"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            PICKLE <span className="text-[#7dc61e]">ADMIN</span>
          </span>
        </div>

        {/* Card */}
        <div
          className="bg-white rounded-[18px] w-full max-w-[440px] z-10 relative"
          style={{
            padding: "40px 44px",
            boxShadow:
              "0 1px 3px rgba(0,0,0,0.06), 0 8px 32px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)",
            animation: "fadeUp 0.7s ease both",
          }}
        >
          {/* Top accent bar */}
          <div
            className="absolute top-0 left-6 right-6 h-[3px] rounded-b-[4px]"
            style={{ background: "linear-gradient(90deg, #7dc61e, #b5f03c)" }}
          />

          {!sent ? (
            <>
              <h1
                className="text-[22px] font-bold text-[#0f1f05] mb-2"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                Forgot Password?
              </h1>
              <p className="text-[13.5px] text-[#7a8a6a] leading-relaxed mb-7">
                Enter your admin email and we'll send you a link to reset your
                password.
              </p>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-[13px] px-4 py-3 rounded-[8px] mb-4">
                  ⚠️ {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <label className="block text-[13px] font-medium text-[#3a4a2a] mb-2">
                  Admin Email
                </label>
                <div className="relative mb-5">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#aabba0] pointer-events-none">
                    ✉
                  </span>
                  <input
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 border-[1.5px] border-[#dde8d5] rounded-[10px] text-[14px] text-[#1a2a0a] bg-[#fafcf8] outline-none transition-all focus:border-[#7dc61e] focus:bg-white focus:shadow-[0_0_0_3px_rgba(125,198,30,0.12)] placeholder:text-[#b0c4a0]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 rounded-[10px] font-bold text-[15px] text-[#0f1f05] border-none cursor-pointer transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed hover:-translate-y-[1px]"
                  style={{
                    background: "linear-gradient(135deg, #7dc61e, #6ab518)",
                    boxShadow: "0 4px 14px rgba(100,190,30,0.3)",
                    fontFamily: "'Syne', sans-serif",
                  }}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[rgba(15,31,5,0.2)] border-t-[#0f1f05] rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Reset Link →"
                  )}
                </button>
              </form>

              <button
                onClick={() => router.push("/admin/login")}
                className="flex items-center justify-center gap-1.5 mx-auto mt-5 text-[13.5px] text-[#8a9a7a] bg-transparent border-none cursor-pointer hover:text-[#5aa012] transition-colors w-full"
              >
                ← Back to Sign In
              </button>
            </>
          ) : (
            /* Success — email sent */
            <div
              className="text-center py-2"
              style={{ animation: "fadeUp 0.5s ease both" }}
            >
              <div
                className="w-[60px] h-[60px] rounded-full flex items-center justify-center text-[28px] mx-auto mb-4"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(125,198,30,0.15), rgba(125,198,30,0.3))",
                  animation: "popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both",
                }}
              >
                📬
              </div>
              <h2
                className="text-[20px] font-bold text-[#0f1f05] mb-2"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                Check Your Email!
              </h2>
              <p className="text-[13.5px] text-[#7a8a6a] leading-relaxed mb-6">
                If <span className="text-[#5aa012] font-medium">{email}</span>{" "}
                is registered, you'll receive a password reset link shortly.
              </p>

              {/* Helpful tips */}
              <div className="bg-[#f8fdf0] border border-[#dde8d5] rounded-[10px] px-4 py-3 text-left mb-6">
                <p className="text-[12.5px] text-[#5a7a3a] font-medium mb-1">
                  💡 Didn't get the email?
                </p>
                <ul className="text-[12px] text-[#7a8a6a] space-y-1 list-none">
                  <li>• Check your spam/junk folder</li>
                  <li>• Link expires in 15 minutes</li>
                </ul>
              </div>

              <button
                onClick={() => router.push("/admin/login")}
                className="flex items-center justify-center gap-1.5 mx-auto text-[13.5px] text-[#8a9a7a] bg-transparent border-none cursor-pointer hover:text-[#5aa012] transition-colors"
              >
                ← Back to Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
