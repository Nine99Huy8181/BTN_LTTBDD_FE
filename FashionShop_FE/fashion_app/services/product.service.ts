// services/product.service.ts
import { api, ApiResponse } from './api';
import { Product, ProductResponse } from '@/types';

export const productService = {
  getAllProducts: async (): Promise<ProductResponse[]> => {
    const response = await api.get<ApiResponse<ProductResponse[]>>('/products');
    return response.data.result || [];
  },

  getProductById: async (id: number): Promise<Product> => {
    const response = await api.get<ApiResponse<Product>>(`/products/${id}`);
    if (!response.data.result) throw new Error('Product not found');
    return response.data.result;
  },

  getProductsByCategoryId: async (categoryId: number): Promise<ProductResponse[]> => {
    const response = await api.get<ApiResponse<ProductResponse[]>>(`/products/category/${categoryId}`);
    return response.data.result || [];
  },

  getProductsByBrand: async (brand: string): Promise<ProductResponse[]> => {
    const response = await api.get<ApiResponse<ProductResponse[]>>(`/products/brand/${encodeURIComponent(brand)}`);
    return response.data.result || [];
  },

  createProduct: async (product: Partial<Product>): Promise<Product> => {
    const response = await api.post<ApiResponse<Product>>('/products', product);
    return response.data.result!;
  },

  updateProduct: async (id: number, product: Partial<Product>): Promise<Product> => {
    const response = await api.put<ApiResponse<Product>>(`/products/${id}`, product);
    return response.data.result!;
  },

  deleteProduct: async (id: number): Promise<void> => {
    await api.delete(`/products/${id}`);
  },
};