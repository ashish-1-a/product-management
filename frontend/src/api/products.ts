import apiClient from "./client";
import type {
  Product,
  ProductListResponse,
  ProductPayload,
} from "../types/product";

export interface ProductListParams {
  search?: string;
  status?: "active" | "inactive";
  page?: number;
  page_size?: number;
}

export const getProducts = async (
  params: ProductListParams = {},
): Promise<ProductListResponse> => {
  const response = await apiClient.get<ProductListResponse>("/products", {
    params,
  });

  return response.data;
};

export const getProduct = async (id: string): Promise<Product> => {
  const response = await apiClient.get<Product>(`/products/${id}`);

  return response.data;
};

export const createProduct = async (
  payload: ProductPayload,
): Promise<Product> => {
  const response = await apiClient.post<Product>("/products", payload);

  return response.data;
};

export const updateProduct = async (
  id: string,
  payload: Partial<ProductPayload>,
): Promise<Product> => {
  const response = await apiClient.put<Product>(
    `/products/${id}`,
    payload,
  );

  return response.data;
};

export const deleteProduct = async (id: string): Promise<void> => {
  await apiClient.delete(`/products/${id}`);
};
