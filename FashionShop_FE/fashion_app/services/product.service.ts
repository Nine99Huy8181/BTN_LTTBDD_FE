import { Product } from '@/types';
import { api } from './api';

export const productService = {
  // Lấy tất cả sản phẩm
  getAllProducts: async (): Promise<Product[]> => {
    const response = await api.get('/products');
    return response.data;
  },

  // Lấy sản phẩm theo ID
  getProductById: async (id: number): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Lấy sản phẩm theo danh mục
  getProductsByCategoryId: async (categoryId: number): Promise<Product[]> => {
    const response = await api.get(`/products/category/${categoryId}`);
    return response.data;
  },

  // Lấy sản phẩm theo thương hiệu
  getProductsByBrand: async (brand: string): Promise<Product[]> => {
    const response = await api.get(`/products/brand/${brand}`);
    return response.data;
  },

  // Tạo sản phẩm mới
  createProduct: async (product: Product): Promise<Product> => {
    const response = await api.post('/products', product);
    return response.data;
  },

  // Cập nhật sản phẩm
  updateProduct: async (id: number, productDetails: Product): Promise<Product> => {
    const response = await api.put(`/products/${id}`, productDetails);
    return response.data;
  },
};