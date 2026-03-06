"use client";

import { useState } from "react";
import { 
  useGetAdminProducts, 
  useCreateProduct, 
  useUpdateProduct, 
  useDeleteProduct 
} from "@/services/products/product.hooks";
import { Plus, Pencil, Trash2, X, Package, ImageIcon, RefreshCw } from "lucide-react";

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
  // ─── API Hooks ──────────────────────────────────────────────────────────────
  const { data: products = [], isLoading, isError, refetch } = useGetAdminProducts();
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();

  // ─── UI State ───────────────────────────────────────────────────────────────
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductFormData>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const openAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (p: any) => {
    setForm({
      name: p.name,
      variant: p.variant,
      price: p.price.toString(),
      stock: p.stock.toString(),
      image: p.image || "",
    });
    setEditingId(p._id); // Backend typically uses _id for MongoDB
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.stock) return;

    const payload = {
      name: form.name,
      variant: form.variant,
      price: parseFloat(form.price),
      stock: parseInt(form.stock),
      image: form.image,
    };

    try {
      if (editingId) {
        await updateProductMutation.mutateAsync({ id: editingId, data: payload });
      } else {
        await createProductMutation.mutateAsync(payload);
      }
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm);
    } catch (err) {
      console.error("Failed to save product:", err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProductMutation.mutateAsync(id);
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Failed to delete product:", err);
    }
  };

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-3">
      <RefreshCw className="w-6 h-6 animate-spin text-[#84cc16]" />
      <p className="text-sm font-medium">Fetching products from backend...</p>
    </div>
  );

  if (isError) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3 text-center px-4">
      <div className="bg-red-50 p-3 rounded-full">
        <Package className="w-6 h-6 text-red-500" />
      </div>
      <div>
        <h3 className="text-gray-900 font-bold">Connection Failed</h3>
        <p className="text-sm text-gray-500">Could not load products. Is the backend server running?</p>
      </div>
      <button 
        onClick={() => refetch()} 
        className="mt-2 flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-gray-900 px-4 py-2 bg-white border border-gray-200 rounded-lg"
      >
        <RefreshCw className="w-3 h-3" /> Retry Connection
      </button>
    </div>
  );

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
                <th className="px-3 py-3 w-24 text-right text-xs font-semibold text-gray-400 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map((p: any) => (
                <tr key={p._id} className="hover:bg-gray-50/60 transition group">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                        {p.image ? (
                           <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-50">
                            <Package className="w-4 h-4 text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{p.name}</p>
                        <p className="text-[10px] text-gray-400 font-mono">{p._id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3.5 text-sm text-gray-600 hidden sm:table-cell">{p.variant}</td>
                  <td className="px-3 py-3.5 font-bold text-gray-800">${p.price?.toFixed(2)}</td>
                  <td className="px-3 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight ${stockBadge(p.stock)}`}>
                        {stockLabel(p.stock)}
                      </span>
                      <span className="text-xs text-gray-400">{p.stock}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3.5 text-sm text-gray-500 hidden md:table-cell">{p.sold || 0}</td>
                  <td className="px-3 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEdit(p)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(p._id)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
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
            No products found in backend.
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px]" onClick={() => setShowForm(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md z-10 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">
                {editingId ? "Edit Product" : "Add New Product"}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Image URL</label>
                <input
                  type="text"
                  value={form.image}
                  onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#84cc16]"
                  placeholder="https://i.ibb.co/..."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Product Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#84cc16]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Variant *</label>
                <select
                  value={form.variant}
                  onChange={(e) => setForm((f) => ({ ...f, variant: e.target.value as Variant }))}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg bg-white"
                >
                  {VARIANTS.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Price ($)</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Stock</label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg"
                  />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3">
              <button onClick={() => setShowForm(false)} className="flex-1 py-2.5 text-sm font-semibold text-gray-600">Cancel</button>
              <button 
                onClick={handleSave} 
                disabled={createProductMutation.isPending || updateProductMutation.isPending}
                className="flex-1 py-2.5 text-sm font-bold bg-[#84cc16] hover:bg-[#65a30d] text-black rounded-lg disabled:opacity-50"
              >
                {createProductMutation.isPending || updateProductMutation.isPending ? "Saving..." : "Save Product"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm z-10 p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Product?</h3>
            <p className="text-sm text-gray-500 mb-6">Are you sure? This will remove the product permanently from the database.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 text-sm font-semibold border border-gray-200 rounded-lg">Cancel</button>
              <button 
                onClick={() => handleDelete(deleteConfirm)} 
                disabled={deleteProductMutation.isPending}
                className="flex-1 py-2.5 text-sm font-bold bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50"
              >
                {deleteProductMutation.isPending ? "Deleting..." : "Delete Now"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
