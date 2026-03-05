"use client";

import { useState } from "react";
import { mockEmailTemplates, EmailTemplate } from "@/lib/admin-data";
import { Mail, Eye, Send, Pencil, X, Check, ChevronDown, ChevronUp } from "lucide-react";

export default function EmailsPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>(mockEmailTemplates);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ subject: string; body: string }>({ subject: "", body: "" });
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [sentId, setSentId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(mockEmailTemplates[0]?.id ?? null);

  const startEdit = (t: EmailTemplate) => {
    setEditForm({ subject: t.subject, body: t.body });
    setEditingId(t.id);
    setPreviewId(null);
  };

  const saveEdit = (id: string) => {
    setTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, subject: editForm.subject, body: editForm.body } : t))
    );
    setEditingId(null);
  };

  const sendTest = (id: string) => {
    setSentId(id);
    setTimeout(() => setSentId(null), 2500);
  };

  const preview = previewId ? templates.find((t) => t.id === previewId) : null;

  const renderPreview = (body: string) =>
    body
      .replace(/\{\{customer_name\}\}/g, "Marcus Rivera")
      .replace(/\{\{order_id\}\}/g, "ORD-1001")
      .replace(/\{\{product\}\}/g, "60ml Pack (x12)")
      .replace(/\{\{amount\}\}/g, "$59.98")
      .replace(/\{\{tracking_number\}\}/g, "1Z999AA10123456784")
      .replace(/\{\{delivery_date\}\}/g, "March 5, 2026");

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">Email Templates</h2>
        <p className="text-sm text-gray-500 mt-0.5">Edit and preview transactional email templates</p>
      </div>

      {/* Variable reference */}
      <div className="bg-[#84cc16]/10 border border-[#84cc16]/30 rounded-xl px-4 py-3">
        <p className="text-xs font-bold text-[#65a30d] mb-1.5">Available Variables</p>
        <div className="flex flex-wrap gap-2">
          {["{{customer_name}}", "{{order_id}}", "{{product}}", "{{amount}}", "{{tracking_number}}", "{{delivery_date}}"].map((v) => (
            <code key={v} className="text-[11px] bg-white/70 border border-[#84cc16]/30 px-2 py-0.5 rounded text-[#65a30d] font-mono">
              {v}
            </code>
          ))}
        </div>
      </div>

      {/* Templates */}
      <div className="space-y-3">
        {templates.map((t) => {
          const isEditing = editingId === t.id;
          const isExpanded = expandedId === t.id;

          return (
            <div key={t.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              {/* Template Header */}
              <div
                className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50/50 transition"
                onClick={() => setExpandedId(isExpanded ? null : t.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#84cc16]/10 rounded-lg flex items-center justify-center">
                    <Mail className="w-4 h-4 text-[#65a30d]" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{t.subject}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!isEditing && (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); setPreviewId(t.id); setExpandedId(t.id); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition"
                        title="Preview"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Preview</span>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); sendTest(t.id); }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                          sentId === t.id
                            ? "text-green-600 bg-green-50"
                            : "text-gray-500 hover:text-green-600 hover:bg-green-50"
                        }`}
                        title="Send test"
                      >
                        {sentId === t.id ? <Check className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                        <span className="hidden sm:inline">{sentId === t.id ? "Sent!" : "Test"}</span>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); startEdit(t); setExpandedId(t.id); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-500 hover:text-[#65a30d] hover:bg-[#84cc16]/10 transition"
                        title="Edit"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Edit</span>
                      </button>
                    </>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t border-gray-100 px-5 py-4 space-y-4">
                  {isEditing ? (
                    <>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Subject Line</label>
                        <input
                          type="text"
                          value={editForm.subject}
                          onChange={(e) => setEditForm((f) => ({ ...f, subject: e.target.value }))}
                          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#84cc16]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1.5">Email Body</label>
                        <textarea
                          value={editForm.body}
                          onChange={(e) => setEditForm((f) => ({ ...f, body: e.target.value }))}
                          rows={10}
                          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#84cc16] font-mono resize-y"
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setEditingId(null)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
                        >
                          <X className="w-3.5 h-3.5" /> Cancel
                        </button>
                        <button
                          onClick={() => saveEdit(t.id)}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold bg-[#84cc16] hover:bg-[#65a30d] text-black transition"
                        >
                          <Check className="w-3.5 h-3.5" /> Save Template
                        </button>
                      </div>
                    </>
                  ) : previewId === t.id ? (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Email Preview</p>
                        <button
                          onClick={() => setPreviewId(null)}
                          className="text-xs text-gray-400 hover:text-gray-600 transition"
                        >
                          Close preview
                        </button>
                      </div>
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                        <div className="border-b border-gray-200 pb-3 mb-4">
                          <p className="text-xs text-gray-400 mb-0.5">Subject</p>
                          <p className="text-sm font-semibold text-gray-800">{renderPreview(t.subject)}</p>
                        </div>
                        <pre className="text-sm text-gray-600 whitespace-pre-wrap font-sans leading-relaxed">
                          {renderPreview(t.body)}
                        </pre>
                      </div>
                    </div>
                  ) : (
                    <pre className="text-sm text-gray-500 whitespace-pre-wrap font-sans leading-relaxed bg-gray-50 rounded-xl p-4">
                      {t.body}
                    </pre>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
