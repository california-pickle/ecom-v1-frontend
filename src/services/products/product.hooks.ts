import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchStorefrontProducts,
  fetchAdminAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "./product.api";

// Public Hook
export const useGetStorefrontProducts = () => {
  return useQuery({
    queryKey: ["products", "storefront"],
    queryFn: fetchStorefrontProducts,
  });
};

// Admin Hook
export const useGetAdminProducts = () => {
  return useQuery({
    queryKey: ["products", "admin"],
    queryFn: fetchAdminAllProducts,
  });
};

// Create Product Mutation
export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", "admin"] });
    },
  });
};

// Update Product Mutation
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", "admin"] });
    },
  });
};

// Delete Product Mutation
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", "admin"] });
    },
  });
};
