export type ProductStatus = "active" | "inactive";

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: string;
  status: ProductStatus;
  created_at: string;
  updated_at: string;
}

export interface ProductListResponse {
  items: Product[];
  total: number;
  page: number;
  page_size: number;
}

export interface ProductPayload {
  name: string;
  sku: string;
  price: number;
  status: ProductStatus;
}
