"use client";

import { useState } from "react";
import { mockProducts, Product } from "@/lib/admin-data";
import { Plus, Pencil, Trash2, X, Package, ImageIcon } from "lucide-react";

const VARIANTS = ["60ml Pack (x12)", "Half Gallon", "1 Gallon"] as const;
type Variant = typeof VARIANTS[number];

const stockBadge = (stock: number) => {
  if (stock === 0) return "bg-red-100 text-red-700";
  if (stock < 20) return "bg-yellow-100 text-yellow-700";
  return "bg-green-100 text-green-700";
};
const stockLabel = (stock: number) => {
  if (stock === 0) return "Out of Stock";
  if (stock < 20) return "Low Stock";
  return "In Stock";
};

interface ProductFormData {
  name: string;
  variant: Variant;
  price: string;
  stock: string;
  image: string;
}

const emptyForm: ProductFormData = {
  name: "",
  variant: "60ml Pack (x12)",
  price: "",
  stock: "",
  image: "",
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductFormData>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const openAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setForm({
      name: p.name,
      variant: p.variant,
      price: p.price.toString(),
      stock: p.stock.toString(),
      image: p.image,
    });
    setEditingId(p.id);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.name || !form.price || !form.stock) return;
    if (editingId) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingId
            ? { ...p, name: form.name, variant: form.variant, price: parseFloat(form.price), stock: parseInt(form.stock), image: form.image || p.image }
            : p
        )
      );
    } else {
      const newProduct: Product = {
        id: `PROD-${String(products.length + 1).padStart(3, "0")}`,
        name: form.name,
        variant: form.variant,
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
        sold: 0,
        image: form.image || "https://i.ibb.co/JjGQ5Y9/product-shot.png",
      };
      setProducts((prev) => [...prev, newProduct]);
    }
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleDelete = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setDeleteConfirm(null);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Products</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage your product catalog and inventory</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-[#84cc16] hover:bg-[#65a30d] text-black text-sm font-bold px-4 py-2.5 rounded-lg transition shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-3">Product</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-3 py-3 hidden sm:table-cell">Variant</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-3 py-3">Price</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-3 py-3">Stock</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-3 py-3 hidden md:table-cell">Sold</th>
                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-3 py-3 hidden md:table-cell">Revenue</th>
                <th className="px-3 py-3 w-24 text-right text-xs font-semibold text-gray-400 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/60 transition group">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{p.name}</p>
                        <p className="text-xs text-gray-400 font-mono">{p.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3.5 text-sm text-gray-600 hidden sm:table-cell">{p.variant}</td>
                  <td className="px-3 py-3.5 font-bold text-gray-800">${p.price.toFixed(2)}</td>
                  <td className="px-3 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${stockBadge(p.stock)}`}>
                        {stockLabel(p.stock)}
                      </span>
                      <span className="text-xs text-gray-400">{p.stock}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3.5 text-sm text-gray-500 hidden md:table-cell">{p.sold}</td>
                  <td className="px-3 py-3.5 font-semibold text-gray-700 hidden md:table-cell">
                    ${(p.sold * p.price).toFixed(0)}
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openEdit(p)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition"
                        title="Edit"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(p.id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {products.length === 0 && (
          <div className="text-center py-16 text-gray-400 text-sm">
            <Package className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            No products yet. Add your first product.
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px]" onClick={() => setShowForm(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md z-10">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">
                {editingId ? "Edit Product" : "Add New Product"}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              {/* Image preview */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-gray-100 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden">
                  {form.image ? (
                    <img src={form.image} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-gray-300" />
                  )}
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Image URL (mock)</label>
                  <input
                    type="text"
                    value={form.image}
                    onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#84cc16]"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Product Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#84cc16]"
                  placeholder="e.g. California Pickle Juice"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Variant *</label>
                <select
                  value={form.variant}
                  onChange={(e) => setForm((f) => ({ ...f, variant: e.target.value as Variant }))}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#84cc16] bg-white"
                >
                  {VARIANTS.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#84cc16]"
                    placeholder="29.99"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Stock *</label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#84cc16]"
                    placeholder="100"
                  />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!form.name || !form.price || !form.stock}
                className="flex-1 py-2.5 rounded-lg text-sm font-bold bg-[#84cc16] hover:bg-[#65a30d] text-black transition disabled:opacity-40"
              >
                {editingId ? "Save Changes" : "Add Product"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/30" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm z-10 p-6">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="text-base font-bold text-gray-900 text-center mb-1.5">Delete Product?</h3>
            <p className="text-sm text-gray-500 text-center mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2.5 rounded-lg text-sm font-bold bg-red-600 hover:bg-red-700 text-white transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
