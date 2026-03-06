import axiosInstance from "@/lib/axiosInstance";

// 1. Storefront (Public) - Main Shop Page er jonno
export const fetchStorefrontProducts = async () => {
  const response = await axiosInstance.get("/products/storefront");
  return response.data; // Eta public route, so login charai cholbe
};

// 2. Admin (Private) - Admin Dashboard er product list er jonno
export const fetchAdminAllProducts = async () => {
  const response = await axiosInstance.get("/products/admin/all");
  return response.data; // Eta 'requireAuth' tai auto token niye nibe
};

// 3. Create Product (Admin Only)
export const createProduct = async (productData: any) => {
  const response = await axiosInstance.post("/products", productData);
  return response.data;
};

// 4. Update Product (Admin Only)
export const updateProduct = async (id: string, productData: any) => {
  const response = await axiosInstance.put(`/products/${id}`, productData);
  return response.data;
};

// 5. Delete Product (Admin Only)
export const deleteProduct = async (id: string) => {
  const response = await axiosInstance.delete(`/products/${id}`);
  return response.data;
};
