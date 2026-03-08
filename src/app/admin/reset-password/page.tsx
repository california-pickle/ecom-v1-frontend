"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axiosInstance from "@/lib/axiosInstance";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [token, setToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    if (!t) {
      router.push("/admin/forgot-password");
    } else {
      setToken(t);
    }
  }, []);

  const getStrength = (pwd: string) => {
    if (!pwd) return { level: 0, label: "", color: "" };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    const map = [
      { level: 1, label: "Weak", color: "#ef4444" },
      { level: 2, label: "Fair", color: "#f59e0b" },
      { level: 3, label: "Good", color: "#3b82f6" },
      { level: 4, label: "Strong", color: "#7dc61e" },
    ];
    return map[score - 1] || { level: 0, label: "", color: "" };
  };

  const strength = getStrength(newPassword) as any;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await axiosInstance.post("/auth/reset-password", { token, newPassword });
      setSuccess(true);
      setTimeout(() => router.push("/admin/login"), 2500);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Invalid or expired link. Please request a new one.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .rp-page {
          min-height: 100vh;
          background: #0a0f0a;
          display: flex;
          align-items: stretch;
          font-family: 'DM Sans', sans-serif;
          overflow: hidden;
        }
        .rp-left {
          width: 420px;
          flex-shrink: 0;
          background: #0d140d;
          border-right: 1px solid #1a2e1a;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 48px 40px;
          position: relative;
          overflow: hidden;
        }
        .rp-left::before {
          content: '';
          position: absolute;
          top: -120px; left: -120px;
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(125,198,30,0.15) 0%, transparent 65%);
          pointer-events: none;
        }
        .rp-left::after {
          content: '';
          position: absolute;
          bottom: -80px; right: -80px;
          width: 300px; height: 300px;
          background: radial-gradient(circle, rgba(125,198,30,0.08) 0%, transparent 65%);
          pointer-events: none;
        }
        .rp-logo { display: flex; align-items: center; gap: 12px; animation: slideRight 0.6s ease both; }
        .rp-logo-box {
          width: 46px; height: 46px;
          background: linear-gradient(135deg, #7dc61e, #4a9010);
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Bebas Neue', sans-serif;
          font-size: 22px; color: #0a0f0a;
          box-shadow: 0 0 24px rgba(125,198,30,0.4), 0 0 48px rgba(125,198,30,0.15);
        }
        .rp-logo-name { font-family: 'Bebas Neue', sans-serif; font-size: 22px; letter-spacing: 3px; color: #e8f5d0; }
        .rp-logo-name span { color: #7dc61e; }
        .rp-left-content { animation: slideRight 0.7s ease 0.1s both; }
        .rp-left-tag {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(125,198,30,0.1); border: 1px solid rgba(125,198,30,0.25);
          border-radius: 100px; padding: 6px 14px;
          font-size: 11px; font-weight: 600; color: #7dc61e;
          letter-spacing: 2px; text-transform: uppercase; margin-bottom: 24px;
        }
        .rp-left-tag::before {
          content: ''; width: 6px; height: 6px;
          background: #7dc61e; border-radius: 50%;
          box-shadow: 0 0 6px #7dc61e; animation: pulse 2s ease infinite;
        }
        .rp-left-heading {
          font-family: 'Bebas Neue', sans-serif; font-size: 64px;
          line-height: 0.9; color: #e8f5d0; letter-spacing: 2px; margin-bottom: 20px;
        }
        .rp-left-heading span { color: #7dc61e; display: block; text-shadow: 0 0 30px rgba(125,198,30,0.4); }
        .rp-left-desc { font-size: 14px; color: #4a6040; line-height: 1.7; }
        .rp-steps { display: flex; flex-direction: column; gap: 16px; animation: slideRight 0.8s ease 0.2s both; }
        .rp-step { display: flex; align-items: center; gap: 14px; }
        .rp-step-num {
          width: 32px; height: 32px; border-radius: 8px;
          background: rgba(125,198,30,0.1); border: 1px solid rgba(125,198,30,0.2);
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700; color: #7dc61e; flex-shrink: 0;
        }
        .rp-step-num.done { background: rgba(125,198,30,0.2); border-color: rgba(125,198,30,0.5); }
        .rp-step-text { font-size: 13px; color: #3a5030; font-weight: 500; }
        .rp-step-text.active { color: #8dd630; }
        .rp-step-text.done { color: #4a6040; text-decoration: line-through; }
        .rp-right {
          flex: 1; display: flex; align-items: center;
          justify-content: center; padding: 48px 40px; position: relative;
        }
        .rp-right::before {
          content: ''; position: absolute; inset: 0;
          background-image: radial-gradient(circle, rgba(125,198,30,0.08) 1px, transparent 1px);
          background-size: 28px 28px; pointer-events: none;
        }
        .rp-form-wrap { width: 100%; max-width: 420px; animation: slideUp 0.7s ease 0.15s both; }
        .rp-form-header { margin-bottom: 36px; }
        .rp-form-eyebrow { font-size: 11px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; color: #7dc61e; margin-bottom: 10px; }
        .rp-form-title { font-family: 'Bebas Neue', sans-serif; font-size: 42px; color: #e8f5d0; letter-spacing: 1px; line-height: 1; margin-bottom: 10px; }
        .rp-form-sub { font-size: 13.5px; color: #3a5030; line-height: 1.6; }
        .rp-field { margin-bottom: 20px; }
        .rp-label { display: block; font-size: 12px; font-weight: 600; letter-spacing: 1.5px; text-transform: uppercase; color: #4a6040; margin-bottom: 8px; }
        .rp-input-wrap { position: relative; }
        .rp-input {
          width: 100%; padding: 14px 46px 14px 18px;
          background: #0d140d; border: 1.5px solid #1e3018; border-radius: 10px;
          font-size: 14px; font-family: 'DM Sans', sans-serif; color: #c8e8a0;
          outline: none; transition: border-color 0.2s, box-shadow 0.2s, background 0.2s; letter-spacing: 0.5px;
        }
        .rp-input::placeholder { color: #2a3e22; }
        .rp-input:focus { border-color: #7dc61e; background: #0f1a0f; box-shadow: 0 0 0 3px rgba(125,198,30,0.1); }
        .rp-input.match { border-color: #7dc61e; }
        .rp-input.no-match { border-color: #ef4444; }
        .rp-eye {
          position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer; font-size: 15px;
          color: #2a3e22; transition: color 0.2s; display: flex; align-items: center;
        }
        .rp-eye:hover { color: #7dc61e; }
        .rp-strength { margin-top: 10px; }
        .rp-strength-bars { display: flex; gap: 5px; margin-bottom: 6px; }
        .rp-strength-bar { height: 3px; flex: 1; border-radius: 100px; background: #1a2e1a; transition: background 0.3s; }
        .rp-strength-label { font-size: 11px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; }
        .rp-match-row { display: flex; align-items: center; gap: 6px; margin-top: 8px; font-size: 12px; font-weight: 500; }
        .rp-error {
          background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.25);
          color: #f87171; font-size: 13px; padding: 12px 16px; border-radius: 8px;
          margin-bottom: 20px; display: flex; align-items: center; gap: 8px;
        }
        .rp-btn {
          width: 100%; padding: 15px;
          background: linear-gradient(135deg, #7dc61e, #5aa012);
          border: none; border-radius: 10px;
          font-family: 'Bebas Neue', sans-serif; font-size: 18px; letter-spacing: 3px;
          color: #0a0f0a; cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
          box-shadow: 0 4px 20px rgba(125,198,30,0.3);
          display: flex; align-items: center; justify-content: center; gap: 10px;
          margin-top: 8px; position: relative; overflow: hidden;
        }
        .rp-btn::before {
          content: ''; position: absolute; top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          transition: left 0.5s ease;
        }
        .rp-btn:hover::before { left: 100%; }
        .rp-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(125,198,30,0.4); }
        .rp-btn:active:not(:disabled) { transform: translateY(0); }
        .rp-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .rp-back {
          display: flex; align-items: center; justify-content: center; gap: 6px;
          margin-top: 20px; font-size: 13px; color: #2a3e22;
          background: none; border: none; cursor: pointer;
          font-family: 'DM Sans', sans-serif; font-weight: 500;
          transition: color 0.2s; width: 100%;
        }
        .rp-back:hover { color: #7dc61e; }
        .spinner {
          width: 18px; height: 18px;
          border: 2px solid rgba(10,15,10,0.3); border-top-color: #0a0f0a;
          border-radius: 50%; animation: spin 0.7s linear infinite;
        }
        .rp-success { text-align: center; animation: slideUp 0.5s ease both; }
        .rp-success-ring {
          width: 90px; height: 90px; border-radius: 50%;
          background: radial-gradient(circle, rgba(125,198,30,0.2), transparent);
          border: 2px solid rgba(125,198,30,0.4);
          display: flex; align-items: center; justify-content: center;
          font-size: 38px; margin: 0 auto 24px;
          box-shadow: 0 0 40px rgba(125,198,30,0.3);
          animation: popIn 0.6s cubic-bezier(0.34,1.56,0.64,1) both;
        }
        .rp-success-title { font-family: 'Bebas Neue', sans-serif; font-size: 48px; color: #e8f5d0; letter-spacing: 2px; margin-bottom: 12px; line-height: 1; }
        .rp-success-title span { color: #7dc61e; }
        .rp-success-text { font-size: 14px; color: #3a5030; line-height: 1.7; }
        .rp-success-bar { height: 2px; background: #1a2e1a; border-radius: 100px; margin-top: 24px; overflow: hidden; }
        .rp-success-bar-fill { height: 100%; background: linear-gradient(90deg, #7dc61e, #b5f03c); border-radius: 100px; animation: fillProgress 2.5s linear both; }
        @media (max-width: 768px) { .rp-left { display: none; } .rp-right { padding: 32px 20px; } }
        @keyframes slideRight { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(0.8); } }
        @keyframes popIn { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes fillProgress { from { width: 0%; } to { width: 100%; } }
      `}</style>

      <div className="rp-page">
        {/* LEFT PANEL */}
        <div className="rp-left">
          <div className="rp-logo">
            <div className="rp-logo-box">P</div>
            <div className="rp-logo-name">
              PICKLE <span>ADMIN</span>
            </div>
          </div>
          <div className="rp-left-content">
            <div className="rp-left-tag">Security Reset</div>
            <h2 className="rp-left-heading">
              NEW<span>PASSWORD.</span>
            </h2>
            <p className="rp-left-desc">
              Create a strong, unique password to secure your admin dashboard
              access.
            </p>
          </div>
          <div className="rp-steps">
            <div className="rp-step">
              <div className="rp-step-num done">✓</div>
              <div className="rp-step-text done">Request sent</div>
            </div>
            <div className="rp-step">
              <div className="rp-step-num done">✓</div>
              <div className="rp-step-text done">Link verified</div>
            </div>
            <div className="rp-step">
              <div
                className="rp-step-num"
                style={{
                  background: "rgba(125,198,30,0.2)",
                  borderColor: "#7dc61e",
                  color: "#7dc61e",
                }}
              >
                3
              </div>
              <div className="rp-step-text active">Set new password</div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="rp-right">
          <div className="rp-form-wrap">
            {!success ? (
              <>
                <div className="rp-form-header">
                  <div className="rp-form-eyebrow">Step 3 of 3</div>
                  <h1 className="rp-form-title">Reset Password</h1>
                  <p className="rp-form-sub">
                    Choose a strong password. Min 8 chars, uppercase, number &
                    symbol recommended.
                  </p>
                </div>

                {error && (
                  <div className="rp-error">
                    <span>⚠</span> {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="rp-field">
                    <label className="rp-label">New Password</label>
                    <div className="rp-input-wrap">
                      <input
                        type={showNew ? "text" : "password"}
                        className="rp-input"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="rp-eye"
                        onClick={() => setShowNew(!showNew)}
                      >
                        {showNew ? "🙈" : "👁"}
                      </button>
                    </div>
                    {newPassword && (
                      <div className="rp-strength">
                        <div className="rp-strength-bars">
                          {[1, 2, 3, 4].map((i) => (
                            <div
                              key={i}
                              className="rp-strength-bar"
                              style={{
                                background:
                                  i <= strength.level
                                    ? strength.color
                                    : "#1a2e1a",
                              }}
                            />
                          ))}
                        </div>
                        <span
                          className="rp-strength-label"
                          style={{ color: strength.color || "#2a3e22" }}
                        >
                          {strength.label || "—"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="rp-field">
                    <label className="rp-label">Confirm Password</label>
                    <div className="rp-input-wrap">
                      <input
                        type={showConfirm ? "text" : "password"}
                        className={`rp-input${confirmPassword ? (confirmPassword === newPassword ? " match" : " no-match") : ""}`}
                        placeholder="Re-enter password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="rp-eye"
                        onClick={() => setShowConfirm(!showConfirm)}
                      >
                        {showConfirm ? "🙈" : "👁"}
                      </button>
                    </div>
                    {confirmPassword && (
                      <div
                        className="rp-match-row"
                        style={{
                          color:
                            confirmPassword === newPassword
                              ? "#7dc61e"
                              : "#ef4444",
                        }}
                      >
                        <span>
                          {confirmPassword === newPassword ? "✓" : "✗"}
                        </span>
                        <span>
                          {confirmPassword === newPassword
                            ? "Passwords match"
                            : "Passwords don't match"}
                        </span>
                      </div>
                    )}
                  </div>

                  <button type="submit" className="rp-btn" disabled={loading}>
                    {loading ? (
                      <>
                        <div className="spinner" /> Updating...
                      </>
                    ) : (
                      "Set New Password"
                    )}
                  </button>
                </form>

                <button
                  className="rp-back"
                  onClick={() => router.push("/admin/login")}
                >
                  ← Back to Sign In
                </button>
              </>
            ) : (
              <div className="rp-success">
                <div className="rp-success-ring">🎉</div>
                <div className="rp-success-title">
                  ALL
                  <br />
                  <span>DONE!</span>
                </div>
                <p className="rp-success-text">
                  Your password has been reset successfully.
                  <br />
                  Redirecting to login...
                </p>
                <div className="rp-success-bar">
                  <div className="rp-success-bar-fill" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
