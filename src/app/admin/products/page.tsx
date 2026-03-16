"use client";

import { useState, useRef } from "react";
import {
  useGetAdminProducts,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from "@/services/products/product.hooks";
import {
  Pencil,
  X,
  Package,
  RefreshCw,
  Weight,
  Ruler,
  Save,
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
  RotateCcw,
  Archive,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "sonner";

// ─── Types matching backend model ─────────────────────────────
interface VariantImage {
  url: string;
  publicId: string;
}

interface Variant {
  _id: string;
  sizeLabel: string;
  subtitle?: string;
  price: number;
  images: VariantImage[];
  stock: number;
  stockStatus: "IN_STOCK" | "OUT_OF_STOCK" | "LOW_STOCK" | "UPCOMING";
  badge?: string;
  weight: number;
  length: number;
  width: number;
  height: number;
}

interface Product {
  _id: string;
  name: string;
  slug: string;
  flavor?: string;
  description: string;
  performanceMetrics: string[];
  isActive: boolean;
  isDeleted?: boolean;
  variants: Variant[];
  createdAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────
const stockBadge = (status: string) => {
  switch (status) {
    case "IN_STOCK": return "bg-green-100 text-green-700";
    case "LOW_STOCK": return "bg-yellow-100 text-yellow-700";
    case "OUT_OF_STOCK": return "bg-red-100 text-red-700";
    case "UPCOMING": return "bg-blue-100 text-blue-700";
    default: return "bg-gray-100 text-gray-600";
  }
};

const stockLabel = (status: string) => {
  switch (status) {
    case "IN_STOCK": return "In Stock";
    case "LOW_STOCK": return "Low Stock";
    case "OUT_OF_STOCK": return "Out of Stock";
    case "UPCOMING": return "Upcoming";
    default: return status;
  }
};

// ─── Create Product Form State ────────────────────────────────
interface CreateVariantForm {
  sizeLabel: string;
  price: string;
  images: VariantImage[];
}

interface CreateForm {
  name: string;
  slug: string;
  description: string;
  flavor: string;
  variants: [CreateVariantForm, CreateVariantForm, CreateVariantForm];
}

const emptyCreateForm: CreateForm = {
  name: "",
  slug: "",
  description: "",
  flavor: "",
  variants: [
    { sizeLabel: "", price: "", images: [] },
    { sizeLabel: "", price: "", images: [] },
    { sizeLabel: "", price: "", images: [] },
  ],
};

// ─── Edit Product Form State ──────────────────────────────────
interface EditForm {
  productId: string;
  name: string;
  slug: string;
  description: string;
  flavor: string;
  performanceMetrics: string;
  variants: {
    _id: string;
    sizeLabel: string;
    subtitle: string;
    price: string;
    stock: string;
    stockStatus: string;
    badge: string;
    weight: string;
    length: string;
    width: string;
    height: string;
    images: VariantImage[];
  }[];
}

// ─── Component ────────────────────────────────────────────────
export default function ProductsPage() {
  const { data: rawProducts = [], isLoading, isError, refetch } = useGetAdminProducts();
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();

  const products: Product[] = Array.isArray(rawProducts) ? rawProducts : (rawProducts as any).products ?? [];

  // UI state
  const [tab, setTab] = useState<"active" | "archived">("active");
  const [createOpen, setCreateOpen] = useState(false);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [createForm, setCreateForm] = useState<CreateForm>(emptyCreateForm);
  const [activating, setActivating] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTarget, setUploadTarget] = useState<{ mode: "create" | "edit"; variantIndex: number } | null>(null);

  // CHANGE 3a — field-level error state for create form
  const [createFieldErrors, setCreateFieldErrors] = useState<Record<string, boolean>>({});
  const [editFieldErrors, setEditFieldErrors] = useState<Record<string, boolean>>({});

  // Archived products
  const [archivedProducts, setArchivedProducts] = useState<Product[]>([]);
  const [archivedLoading, setArchivedLoading] = useState(false);
  const [restoring, setRestoring] = useState<string | null>(null);

  const fetchArchived = async () => {
    setArchivedLoading(true);
    try {
      const res = await axiosInstance.get("/products/archived");
      setArchivedProducts(Array.isArray(res.data) ? res.data : []);
    } catch {
      toast.error("Failed to fetch archived products");
    } finally {
      setArchivedLoading(false);
    }
  };

  // ─── Image Upload ─────────────────────────────────────────
  // CHANGE 2b — multi-file upload with 7-image cap
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length || !uploadTarget) return;

    // Determine how many slots remain
    const currentImages = uploadTarget.mode === "create"
      ? createForm.variants[uploadTarget.variantIndex].images
      : editForm?.variants[uploadTarget.variantIndex]?.images ?? [];

    const remaining = 7 - currentImages.length;
    if (remaining <= 0) {
      toast.error("Maximum 7 images per variant");
      if (fileInputRef.current) fileInputRef.current.value = "";
      setUploadTarget(null);
      return;
    }

    const files = Array.from(e.target.files).slice(0, remaining);

    // Filter out files over 10MB and warn
    const oversized = files.filter(f => f.size > 10 * 1024 * 1024);
    if (oversized.length > 0) {
      oversized.forEach(f => toast.error(`${f.name} exceeds 10MB limit and was skipped`));
    }
    const validFiles = files.filter(f => f.size <= 10 * 1024 * 1024);
    if (validFiles.length === 0) {
      setUploading((prev) => ({ ...prev, [key]: false }));
      setUploadTarget(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const key = `${uploadTarget.mode}-${uploadTarget.variantIndex}`;
    setUploading((prev) => ({ ...prev, [key]: true }));

    const uploaded: VariantImage[] = [];
    for (const file of validFiles) {
      try {
        const formData = new FormData();
        formData.append("image", file);
        const res = await axiosInstance.post("/products/upload-image", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        uploaded.push({ url: res.data.url, publicId: res.data.publicId });
      } catch {
        toast.error(`Failed to upload ${file.name}`);
      }
    }

    if (uploaded.length > 0) {
      if (uploadTarget.mode === "create") {
        setCreateForm((prev) => {
          const updated = { ...prev };
          updated.variants = [...prev.variants] as [CreateVariantForm, CreateVariantForm, CreateVariantForm];
          updated.variants[uploadTarget.variantIndex] = {
            ...updated.variants[uploadTarget.variantIndex],
            images: [...updated.variants[uploadTarget.variantIndex].images, ...uploaded],
          };
          return updated;
        });
      } else if (editForm) {
        setEditForm((prev) => {
          if (!prev) return prev;
          const updated = { ...prev, variants: [...prev.variants] };
          updated.variants[uploadTarget.variantIndex] = {
            ...updated.variants[uploadTarget.variantIndex],
            images: [...updated.variants[uploadTarget.variantIndex].images, ...uploaded],
          };
          return updated;
        });
      }
      toast.success(`${uploaded.length} image${uploaded.length > 1 ? "s" : ""} uploaded`);
    }

    setUploading((prev) => ({ ...prev, [key]: false }));
    setUploadTarget(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const triggerUpload = (mode: "create" | "edit", variantIndex: number) => {
    setUploadTarget({ mode, variantIndex });
    setTimeout(() => fileInputRef.current?.click(), 50);
  };

  const removeImage = (mode: "create" | "edit", variantIndex: number, imgIndex: number) => {
    if (mode === "create") {
      setCreateForm((prev) => {
        const updated = { ...prev };
        updated.variants = [...prev.variants] as [CreateVariantForm, CreateVariantForm, CreateVariantForm];
        updated.variants[variantIndex] = {
          ...updated.variants[variantIndex],
          images: updated.variants[variantIndex].images.filter((_, i) => i !== imgIndex),
        };
        return updated;
      });
    } else if (editForm) {
      setEditForm((prev) => {
        if (!prev) return prev;
        const updated = { ...prev, variants: [...prev.variants] };
        updated.variants[variantIndex] = {
          ...updated.variants[variantIndex],
          images: updated.variants[variantIndex].images.filter((_, i) => i !== imgIndex),
        };
        return updated;
      });
    }
  };

  // ─── Auto-slug ─────────────────────────────────────────────
  const nameToSlug = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  // ─── Create Product ────────────────────────────────────────
  // CHANGE 3b — field-level error tracking in handleCreate
  const handleCreate = async () => {
    const { name, slug, description, flavor, variants } = createForm;
    const errors: Record<string, boolean> = {};

    if (!name.trim()) errors['name'] = true;
    if (!slug.trim()) errors['slug'] = true;
    if (!description.trim()) errors['description'] = true;

    for (let i = 0; i < 3; i++) {
      if (!variants[i].sizeLabel.trim()) errors[`v${i}_sizeLabel`] = true;
      if (!variants[i].price) errors[`v${i}_price`] = true;
      if (variants[i].images.length === 0) errors[`v${i}_images`] = true;
    }

    if (Object.keys(errors).length > 0) {
      setCreateFieldErrors(errors);
      toast.error("Please fix the highlighted fields");
      return;
    }

    setCreateFieldErrors({});

    try {
      await createProductMutation.mutateAsync({
        name,
        slug,
        description,
        ...(flavor ? { flavor } : {}),
        variants: variants.map((v) => ({
          sizeLabel: v.sizeLabel,
          price: parseFloat(v.price),
          images: v.images,
        })),
      });
      toast.success("Product created! It starts as inactive — activate it when ready.");
      setCreateOpen(false);
      setCreateForm(emptyCreateForm);
      setCreateFieldErrors({});
    } catch (err: any) {
      const msg = err?.response?.data?.errors?.[0]?.message || err?.response?.data?.message || "Failed to create product";
      toast.error(msg);
    }
  };

  // ─── Open Edit ─────────────────────────────────────────────
  const openEdit = (product: Product) => {
    setEditForm({
      productId: product._id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      flavor: product.flavor || "",
      performanceMetrics: product.performanceMetrics.join(", "),
      variants: product.variants.map((v) => ({
        _id: v._id,
        sizeLabel: v.sizeLabel,
        subtitle: v.subtitle || "",
        price: v.price.toString(),
        stock: v.stock.toString(),
        stockStatus: v.stockStatus,
        badge: v.badge || "",
        weight: v.weight.toString(),
        length: v.length.toString(),
        width: v.width.toString(),
        height: v.height.toString(),
        images: v.images,
      })),
    });
  };

  // ─── Save Edit ─────────────────────────────────────────────
  const handleSaveEdit = async () => {
    if (!editForm) return;

    // Validate stock is required when status is IN_STOCK or LOW_STOCK
    const errors: Record<string, boolean> = {};
    editForm.variants.forEach((v, idx) => {
      if ((v.stockStatus === "IN_STOCK" || v.stockStatus === "LOW_STOCK") && (parseInt(v.stock) || 0) < 1) {
        errors[`v${idx}_stock`] = true;
      }
    });
    if (Object.keys(errors).length > 0) {
      setEditFieldErrors(errors);
      toast.error("Stock quantity is required for In Stock / Low Stock variants");
      return;
    }
    setEditFieldErrors({});

    const metrics = editForm.performanceMetrics
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      await updateProductMutation.mutateAsync({
        id: editForm.productId,
        data: {
          name: editForm.name,
          slug: editForm.slug,
          description: editForm.description,
          ...(editForm.flavor ? { flavor: editForm.flavor } : {}),
          performanceMetrics: metrics,
          variants: editForm.variants.map((v) => ({
            _id: v._id,
            sizeLabel: v.sizeLabel,
            ...(v.subtitle ? { subtitle: v.subtitle } : {}),
            price: parseFloat(v.price) || 0,
            images: v.images,
            stock: parseInt(v.stock) || 0,
            stockStatus: v.stockStatus,
            ...(v.badge ? { badge: v.badge } : {}),
            weight: parseFloat(v.weight) || 16,
            length: parseFloat(v.length) || 6,
            width: parseFloat(v.width) || 6,
            height: parseFloat(v.height) || 6,
          })),
        },
      });
      toast.success("Product updated");
      setEditForm(null);
      setEditFieldErrors({});
    } catch (err: any) {
      const msg = err?.response?.data?.errors?.[0]?.message || err?.response?.data?.message || "Failed to update";
      toast.error(msg);
    }
  };

  // ─── Activate ─────────────────────────────────────────────
  // Backend: one active product at a time. Activating X auto-deactivates all others.
  // There is no direct deactivate — activate a different product to swap the storefront product.
  const toggleActivate = async (productId: string, isActive: boolean) => {
    if (isActive) {
      toast("To remove this product from the storefront, activate a different product — it will auto-deactivate.", { icon: "ℹ️" });
      return;
    }
    setActivating(productId);
    try {
      await axiosInstance.put(`/products/${productId}/activate`);
      toast.success("Product is now live on the storefront");
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to activate product");
    } finally {
      setActivating(null);
    }
  };

  // ─── Delete (Soft) ─────────────────────────────────────────
  const handleDelete = async (productId: string) => {
    setDeleting(productId);
    try {
      await deleteProductMutation.mutateAsync(productId);
      toast.success("Product archived");
      setDeleteConfirm(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to archive product");
    } finally {
      setDeleting(null);
    }
  };

  // ─── Restore ───────────────────────────────────────────────
  const handleRestore = async (productId: string) => {
    setRestoring(productId);
    try {
      await axiosInstance.put(`/products/${productId}/restore`);
      toast.success("Product restored");
      setArchivedProducts((prev) => prev.filter((p) => p._id !== productId));
      refetch();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to restore");
    } finally {
      setRestoring(null);
    }
  };

  // ─── Loading / Error states ────────────────────────────────
  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400 gap-3">
        <RefreshCw className="w-6 h-6 animate-spin text-[#84cc16]" />
        <p className="text-sm font-medium">Fetching products from backend...</p>
      </div>
    );

  if (isError)
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-center px-4">
        <div className="bg-red-50 p-3 rounded-full">
          <Package className="w-6 h-6 text-red-500" />
        </div>
        <div>
          <h3 className="text-gray-900 font-bold">Connection Failed</h3>
          <p className="text-sm text-gray-500">Could not load products. Is the backend server running?</p>
        </div>
        <button onClick={() => refetch()} className="mt-2 flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-gray-900 px-4 py-2 bg-white border border-gray-200 rounded-lg">
          <RefreshCw className="w-3 h-3" /> Retry
        </button>
      </div>
    );

  // ─── Image Upload Input (hidden) ─────────────────────────
  // CHANGE 2a — multiple file support
  const imageUploadInput = (
    <input
      ref={fileInputRef}
      type="file"
      accept="image/*"
      multiple
      className="hidden"
      onChange={handleImageUpload}
    />
  );

  // ─── Image Thumbnails Component ───────────────────────────
  // CHANGE 2c — upload button shows remaining count
  const ImageThumbs = ({ images, mode, variantIndex }: { images: VariantImage[]; mode: "create" | "edit"; variantIndex: number }) => {
    const key = `${mode}-${variantIndex}`;
    return (
      <div className="flex items-center gap-2 flex-wrap">
        {images.map((img, i) => (
          <div key={i} className="relative w-14 h-14 rounded-lg overflow-hidden border border-gray-200 group">
            <img src={img.url} alt="" className="w-full h-full object-cover" />
            <button
              onClick={() => removeImage(mode, variantIndex, i)}
              className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
            >
              <X className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        ))}
        {images.length < 7 && (
          <button
            onClick={() => triggerUpload(mode, variantIndex)}
            disabled={uploading[key]}
            className="w-14 h-14 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:text-[#84cc16] hover:border-[#84cc16] transition disabled:opacity-40 gap-0.5"
          >
            {uploading[key] ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Upload className="w-3.5 h-3.5" />
                <span className="text-[9px] font-bold">{7 - images.length} left</span>
              </>
            )}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {imageUploadInput}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Products</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage inventory, pricing, images, and shipping dimensions</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800 transition px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button
            onClick={() => { setCreateOpen(true); setCreateForm(emptyCreateForm); }}
            className="flex items-center gap-1.5 text-xs font-bold text-black bg-[#84cc16] hover:bg-[#65a30d] px-4 py-2 rounded-lg transition"
          >
            <Plus className="w-3.5 h-3.5" /> Add Product
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        <button
          onClick={() => setTab("active")}
          className={cn("px-4 py-1.5 rounded-md text-xs font-semibold transition", tab === "active" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}
        >
          Products ({products.length})
        </button>
        <button
          onClick={() => { setTab("archived"); fetchArchived(); }}
          className={cn("px-4 py-1.5 rounded-md text-xs font-semibold transition flex items-center gap-1.5", tab === "archived" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700")}
        >
          <Archive className="w-3 h-3" /> Archived
        </button>
      </div>

      {/* ─── ACTIVE TAB ─── */}
      {tab === "active" && (
        <>
          {products.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 py-16 text-center text-gray-400 text-sm">
              <Package className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              No products found. Create your first product above.
            </div>
          ) : (
            <div className="space-y-4">
              {products.map((product) => {
                const expanded = expandedProduct === product._id;
                return (
                  <div key={product._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {/* Product Header */}
                    <div
                      className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50/50 transition"
                      onClick={() => setExpandedProduct(expanded ? null : product._id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0", product.isActive ? "bg-[#84cc16]/20" : "bg-gray-100")}>
                          <Package className={cn("w-5 h-5", product.isActive ? "text-[#65a30d]" : "text-gray-400")} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-gray-900">{product.name}</h3>
                            <span className={cn("text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide", product.isActive ? "bg-[#84cc16] text-black" : "bg-gray-200 text-gray-500")}>
                              {product.isActive ? "LIVE" : "INACTIVE"}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">/{product.slug}{product.flavor && ` · ${product.flavor}`} · {product.variants.length} variants</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); openEdit(product); }}
                          className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition"
                          title="Edit product"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        {/* CHANGE 1 — pill toggle switch replaces Eye/EyeOff button */}
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleActivate(product._id, product.isActive); }}
                          disabled={activating === product._id}
                          className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
                          title={product.isActive ? "Click to deactivate" : "Click to activate"}
                        >
                          <div className={cn("relative w-9 h-5 rounded-full transition-colors duration-200", product.isActive ? "bg-emerald-500" : "bg-gray-300")}>
                            <div className={cn("absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200", product.isActive ? "translate-x-4" : "translate-x-0.5")} />
                          </div>
                          <span className={cn("text-[11px] font-bold w-12", product.isActive ? "text-emerald-700" : "text-gray-400")}>
                            {activating === product._id ? "..." : product.isActive ? "Live" : "Off"}
                          </span>
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeleteConfirm(product._id); }}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                          title="Archive product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                      </div>
                    </div>

                    {/* Delete Confirmation */}
                    {deleteConfirm === product._id && (
                      <div className="mx-5 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-red-700">
                          <AlertTriangle className="w-4 h-4" />
                          <span className="font-semibold">Archive this product?</span>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setDeleteConfirm(null)} className="px-3 py-1 text-xs font-semibold text-gray-600 hover:bg-white rounded-lg transition">
                            Cancel
                          </button>
                          <button
                            onClick={() => handleDelete(product._id)}
                            disabled={deleting === product._id}
                            className="px-3 py-1 text-xs font-bold bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                          >
                            {deleting === product._id ? "Archiving..." : "Archive"}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Expanded: Variants Table */}
                    {expanded && (
                      <div className="border-t border-gray-100 overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-50 bg-gray-50/50">
                              <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-5 py-2.5">Variant</th>
                              <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-3 py-2.5">Price</th>
                              <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-3 py-2.5">Stock</th>
                              <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-3 py-2.5 hidden md:table-cell">Parcel</th>
                              <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wide px-3 py-2.5 hidden lg:table-cell">Images</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {product.variants.map((variant, vIdx) => (
                              <tr key={variant._id} className="hover:bg-gray-50/60 transition">
                                <td className="px-5 py-3">
                                  <div className="flex items-center gap-3">
                                    {variant.images?.[0]?.url ? (
                                      <img src={variant.images[0].url} alt={variant.sizeLabel} className="w-9 h-9 rounded-lg object-cover border border-gray-200" />
                                    ) : (
                                      <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                                        <ImageIcon className="w-3.5 h-3.5 text-gray-300" />
                                      </div>
                                    )}
                                    <div>
                                      <p className="font-semibold text-gray-800 text-sm">Variant {vIdx + 1}</p>
                                      <span className="text-[10px] text-gray-500">{variant.sizeLabel}</span>
                                      {variant.badge && <span className="text-[9px] font-black text-[#65a30d] uppercase tracking-wide ml-1">{variant.badge}</span>}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-3 py-3 font-bold text-gray-800">${variant.price.toFixed(2)}</td>
                                <td className="px-3 py-3">
                                  <div className="flex items-center gap-2">
                                    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight", stockBadge(variant.stockStatus))}>
                                      {stockLabel(variant.stockStatus)}
                                    </span>
                                    <span className="text-xs text-gray-400">{variant.stock}</span>
                                  </div>
                                </td>
                                <td className="px-3 py-3 text-xs text-gray-400 hidden md:table-cell">
                                  <div className="flex items-center gap-1.5">
                                    <Weight className="w-3 h-3" />{variant.weight}oz
                                    <span className="text-gray-300 mx-0.5">|</span>
                                    <Ruler className="w-3 h-3" />{variant.length}&times;{variant.width}&times;{variant.height}in
                                  </div>
                                </td>
                                <td className="px-3 py-3 hidden lg:table-cell">
                                  <div className="flex gap-1">
                                    {variant.images.slice(0, 3).map((img, i) => (
                                      <img key={i} src={img.url} alt="" className="w-7 h-7 rounded object-cover border border-gray-200" />
                                    ))}
                                    {variant.images.length > 3 && (
                                      <span className="w-7 h-7 rounded bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-400">
                                        +{variant.images.length - 3}
                                      </span>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ─── ARCHIVED TAB ─── */}
      {tab === "archived" && (
        <div>
          {archivedLoading ? (
            <div className="flex items-center justify-center py-20 text-gray-400 text-sm gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" /> Loading archived products...
            </div>
          ) : archivedProducts.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 py-16 text-center text-gray-400 text-sm">
              <Archive className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              No archived products.
            </div>
          ) : (
            <div className="space-y-3">
              {archivedProducts.map((product) => (
                <div key={product._id} className="bg-white rounded-xl border border-gray-200 px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                      <Archive className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-600">{product.name}</h3>
                      <p className="text-xs text-gray-400">/{product.slug} · {product.variants.length} variants · Archived</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRestore(product._id)}
                    disabled={restoring === product._id}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#65a30d] bg-[#84cc16]/10 rounded-lg hover:bg-[#84cc16]/20 transition disabled:opacity-50"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    {restoring === product._id ? "Restoring..." : "Restore"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── CREATE PRODUCT MODAL ─── */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px]" onClick={() => setCreateOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[90vh] z-10 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <h3 className="text-base font-bold text-gray-900">Add New Product</h3>
              <button onClick={() => setCreateOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {/* Basic Info */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Basic Info</p>
                <div className="grid grid-cols-2 gap-3">
                  {/* CHANGE 3c — Product Name with error highlight */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Product Name *</label>
                    <input
                      type="text"
                      value={createForm.name}
                      onChange={(e) => {
                        setCreateForm((f) => ({ ...f, name: e.target.value, slug: nameToSlug(e.target.value) }));
                        if (createFieldErrors.name) setCreateFieldErrors((p) => ({ ...p, name: false }));
                      }}
                      placeholder="California Pickle"
                      className={cn("w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#84cc16]",
                        createFieldErrors['name'] ? "border-red-400 bg-red-50" : "border-gray-200")}
                    />
                  </div>
                  {/* CHANGE 3c — Slug with error highlight */}
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Slug (auto)</label>
                    <input
                      type="text"
                      value={createForm.slug}
                      onChange={(e) => {
                        setCreateForm((f) => ({ ...f, slug: e.target.value }));
                        if (createFieldErrors.slug) setCreateFieldErrors((p) => ({ ...p, slug: false }));
                      }}
                      className={cn("w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#84cc16] font-mono text-gray-500",
                        createFieldErrors['slug'] ? "border-red-400 bg-red-50" : "border-gray-200")}
                    />
                  </div>
                </div>
                {/* CHANGE 3c — Description with error highlight */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Description *</label>
                  <textarea
                    value={createForm.description}
                    onChange={(e) => {
                      setCreateForm((f) => ({ ...f, description: e.target.value }));
                      if (createFieldErrors.description) setCreateFieldErrors((p) => ({ ...p, description: false }));
                    }}
                    rows={2}
                    placeholder="Fast-acting electrolyte shot powered by real pickle brine..."
                    className={cn("w-full px-3 py-2.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#84cc16] resize-none",
                      createFieldErrors['description'] ? "border-red-400 bg-red-50" : "border-gray-200")}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Flavor (optional)</label>
                  <input
                    type="text"
                    value={createForm.flavor}
                    onChange={(e) => setCreateForm((f) => ({ ...f, flavor: e.target.value }))}
                    placeholder="Original Dill"
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#84cc16]"
                  />
                </div>
              </div>

              {/* Variants */}
              <div className="space-y-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">3 Size Variants (required)</p>
                {createForm.variants.map((variant, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-xl p-4 space-y-3">
                    <p className="text-xs font-bold text-gray-700">Variant {idx + 1}</p>
                    <div className="grid grid-cols-2 gap-3">
                      {/* CHANGE 3c — Size Label with error highlight */}
                      <div>
                        <label className="block text-[10px] font-medium text-gray-500 mb-1">Size Label *</label>
                        <input
                          type="text"
                          value={variant.sizeLabel}
                          onChange={(e) => {
                            setCreateForm((f) => {
                              const v = [...f.variants] as [CreateVariantForm, CreateVariantForm, CreateVariantForm];
                              v[idx] = { ...v[idx], sizeLabel: e.target.value };
                              return { ...f, variants: v };
                            });
                            if (createFieldErrors[`v${idx}_sizeLabel`]) setCreateFieldErrors((p) => ({ ...p, [`v${idx}_sizeLabel`]: false }));
                          }}
                          placeholder="e.g. 60ml Pack"
                          className={cn("w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#84cc16]",
                            createFieldErrors[`v${idx}_sizeLabel`] ? "border-red-400 bg-red-50" : "border-gray-200")}
                        />
                      </div>
                      {/* CHANGE 3c — Price with error highlight */}
                      <div>
                        <label className="block text-[10px] font-medium text-gray-500 mb-1">Price ($) *</label>
                        <input
                          type="number"
                          step="0.01"
                          value={variant.price}
                          onChange={(e) => {
                            setCreateForm((f) => {
                              const v = [...f.variants] as [CreateVariantForm, CreateVariantForm, CreateVariantForm];
                              v[idx] = { ...v[idx], price: e.target.value };
                              return { ...f, variants: v };
                            });
                            if (createFieldErrors[`v${idx}_price`]) setCreateFieldErrors((p) => ({ ...p, [`v${idx}_price`]: false }));
                          }}
                          placeholder="22.00"
                          className={cn("w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#84cc16]",
                            createFieldErrors[`v${idx}_price`] ? "border-red-400 bg-red-50" : "border-gray-200")}
                        />
                      </div>
                    </div>
                    {/* CHANGE 3c — Image section with error highlight */}
                    <div>
                      <label className="block text-[10px] font-medium text-gray-500 mb-1.5">Images * (1-5)</label>
                      {createFieldErrors[`v${idx}_images`] ? (
                        <div className="rounded-lg ring-2 ring-red-400 p-1 inline-flex">
                          <ImageThumbs images={variant.images} mode="create" variantIndex={idx} />
                        </div>
                      ) : (
                        <ImageThumbs images={variant.images} mode="create" variantIndex={idx} />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-[10px] text-gray-400 text-center">
                Product will be created as <strong>inactive</strong>. Stock, parcel dimensions, and other details can be set via Edit after creation.
              </p>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3 flex-shrink-0">
              <button onClick={() => setCreateOpen(false)} className="flex-1 py-2.5 text-sm font-semibold text-gray-600">Cancel</button>
              <button
                onClick={handleCreate}
                disabled={createProductMutation.isPending}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-bold bg-[#84cc16] hover:bg-[#65a30d] text-black rounded-lg disabled:opacity-50 transition"
              >
                {createProductMutation.isPending ? (
                  <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Creating...</>
                ) : (
                  <><Plus className="w-3.5 h-3.5" /> Create Product</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── EDIT PRODUCT MODAL ─── */}
      {editForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px]" onClick={() => setEditForm(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] z-10 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <h3 className="text-base font-bold text-gray-900">Edit Product</h3>
              <button onClick={() => setEditForm(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {/* Basic Info */}
              <div className="space-y-3">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Product Info</p>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Name</label>
                    <input type="text" value={editForm.name} onChange={(e) => setEditForm((f) => f ? { ...f, name: e.target.value } : f)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#84cc16]" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Slug</label>
                    <input type="text" value={editForm.slug} onChange={(e) => setEditForm((f) => f ? { ...f, slug: e.target.value } : f)} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#84cc16] font-mono text-gray-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Flavor</label>
                    <input type="text" value={editForm.flavor} onChange={(e) => setEditForm((f) => f ? { ...f, flavor: e.target.value } : f)} placeholder="Optional" className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#84cc16]" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Description</label>
                  <textarea value={editForm.description} onChange={(e) => setEditForm((f) => f ? { ...f, description: e.target.value } : f)} rows={2} className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#84cc16] resize-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Performance Metrics <span className="text-gray-400 font-normal">(comma separated)</span></label>
                  <input type="text" value={editForm.performanceMetrics} onChange={(e) => setEditForm((f) => f ? { ...f, performanceMetrics: e.target.value } : f)} placeholder="Fast absorption, 0g sugar, High electrolytes" className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#84cc16]" />
                </div>
              </div>

              {/* Variants */}
              <div className="space-y-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Variants</p>
                {editForm.variants.map((variant, idx) => (
                  <div key={variant._id} className="bg-gray-50 rounded-xl p-4 space-y-3">
                    <p className="text-xs font-bold text-gray-700">Variant {idx + 1}: {variant.sizeLabel}</p>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-[10px] font-medium text-gray-500 mb-1">Size Label</label>
                        <input type="text" value={variant.sizeLabel} onChange={(e) => { const v = [...editForm.variants]; v[idx] = { ...v[idx], sizeLabel: e.target.value }; setEditForm((f) => f ? { ...f, variants: v } : f); }} className="w-full px-2 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#84cc16]" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-gray-500 mb-1">Price ($)</label>
                        <input type="number" step="0.01" value={variant.price} onChange={(e) => { const v = [...editForm.variants]; v[idx] = { ...v[idx], price: e.target.value }; setEditForm((f) => f ? { ...f, variants: v } : f); }} className="w-full px-2 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#84cc16]" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-gray-500 mb-1">
                          Stock
                          {(variant.stockStatus === "IN_STOCK" || variant.stockStatus === "LOW_STOCK") && (
                            <span className="text-red-500 ml-0.5">*</span>
                          )}
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={variant.stock}
                          onChange={(e) => {
                            const v = [...editForm.variants];
                            v[idx] = { ...v[idx], stock: e.target.value };
                            setEditForm((f) => f ? { ...f, variants: v } : f);
                            if (editFieldErrors[`v${idx}_stock`]) setEditFieldErrors((p) => ({ ...p, [`v${idx}_stock`]: false }));
                          }}
                          className={cn("w-full px-2 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#84cc16]", editFieldErrors[`v${idx}_stock`] ? "border-red-400 bg-red-50" : "border-gray-200")}
                        />
                        {editFieldErrors[`v${idx}_stock`] && (
                          <p className="text-[10px] text-red-500 mt-1">Required for this status</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-gray-500 mb-1">Status</label>
                        <select value={variant.stockStatus} onChange={(e) => { const v = [...editForm.variants]; v[idx] = { ...v[idx], stockStatus: e.target.value }; setEditForm((f) => f ? { ...f, variants: v } : f); }} className="w-full px-2 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#84cc16]">
                          <option value="IN_STOCK">In Stock</option>
                          <option value="LOW_STOCK">Low Stock</option>
                          <option value="OUT_OF_STOCK">Out of Stock</option>
                          <option value="UPCOMING">Upcoming</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-[10px] font-medium text-gray-500 mb-1">Subtitle</label>
                        <input type="text" value={variant.subtitle} onChange={(e) => { const v = [...editForm.variants]; v[idx] = { ...v[idx], subtitle: e.target.value }; setEditForm((f) => f ? { ...f, variants: v } : f); }} placeholder="Optional" className="w-full px-2 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#84cc16]" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-gray-500 mb-1">Badge</label>
                        <input type="text" value={variant.badge} onChange={(e) => { const v = [...editForm.variants]; v[idx] = { ...v[idx], badge: e.target.value }; setEditForm((f) => f ? { ...f, variants: v } : f); }} placeholder="e.g. Most Popular" className="w-full px-2 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#84cc16]" />
                      </div>
                    </div>

                    {/* Parcel specs */}
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 mb-1.5 flex items-center gap-1">
                        <Weight className="w-3 h-3" /> Parcel Dimensions (for Shippo shipping rates)
                      </p>
                      <div className="grid grid-cols-4 gap-2">
                        <div>
                          <label className="block text-[10px] font-medium text-gray-400 mb-1">Weight (oz)</label>
                          <input type="number" step="0.1" value={variant.weight} onChange={(e) => { const v = [...editForm.variants]; v[idx] = { ...v[idx], weight: e.target.value }; setEditForm((f) => f ? { ...f, variants: v } : f); }} className="w-full px-2 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#84cc16]" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-medium text-gray-400 mb-1">L (in)</label>
                          <input type="number" step="0.1" value={variant.length} onChange={(e) => { const v = [...editForm.variants]; v[idx] = { ...v[idx], length: e.target.value }; setEditForm((f) => f ? { ...f, variants: v } : f); }} className="w-full px-2 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#84cc16]" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-medium text-gray-400 mb-1">W (in)</label>
                          <input type="number" step="0.1" value={variant.width} onChange={(e) => { const v = [...editForm.variants]; v[idx] = { ...v[idx], width: e.target.value }; setEditForm((f) => f ? { ...f, variants: v } : f); }} className="w-full px-2 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#84cc16]" />
                        </div>
                        <div>
                          <label className="block text-[10px] font-medium text-gray-400 mb-1">H (in)</label>
                          <input type="number" step="0.1" value={variant.height} onChange={(e) => { const v = [...editForm.variants]; v[idx] = { ...v[idx], height: e.target.value }; setEditForm((f) => f ? { ...f, variants: v } : f); }} className="w-full px-2 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#84cc16]" />
                        </div>
                      </div>
                    </div>

                    {/* Images */}
                    <div>
                      <label className="block text-[10px] font-medium text-gray-500 mb-1.5">Images (1-5)</label>
                      <ImageThumbs images={variant.images} mode="edit" variantIndex={idx} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex gap-3 flex-shrink-0">
              <button onClick={() => setEditForm(null)} className="flex-1 py-2.5 text-sm font-semibold text-gray-600">Cancel</button>
              <button
                onClick={handleSaveEdit}
                disabled={updateProductMutation.isPending}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm font-bold bg-[#84cc16] hover:bg-[#65a30d] text-black rounded-lg disabled:opacity-50 transition"
              >
                {updateProductMutation.isPending ? (
                  <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Saving...</>
                ) : (
                  <><Save className="w-3.5 h-3.5" /> Save Changes</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
