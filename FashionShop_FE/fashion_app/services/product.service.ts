// services/product.service.ts
import { Product, ProductResponse, ProductSearchParams, UpdateProductRequest } from '@/types';
import { api } from './api';

export const productService = {
  // Lấy tất cả sản phẩm
  getAllProducts: async (): Promise<ProductResponse[]> => {
    const response = await api.get('/products');
    return response.data;
  },

  // Lấy sản phẩm theo ID
  getProductById: async (id: number): Promise<ProductResponse> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Lấy sản phẩm theo danh mục
  getProductsByCategoryId: async (categoryId: number): Promise<ProductResponse[]> => {
    const response = await api.get(`/products/category/${categoryId}`);
    return response.data;
  },

  // Lấy sản phẩm theo thương hiệu
  getProductsByBrand: async (brand: string): Promise<ProductResponse[]> => {
    const response = await api.get(`/products/brand/${brand}`);
    return response.data;
  },

  // Tạo sản phẩm mới
  createProduct: async (product: Product): Promise<ProductResponse> => {
    const response = await api.post('/products', product);
    return response.data;
  },

  // Cập nhật sản phẩm
  updateProduct: async (id: number, payload: UpdateProductRequest): Promise<ProductResponse> => {
    const response = await api.put(`/products/${id}`, payload);
    return response.data;
},


  // // Xóa sản phẩm
  deleteProduct: async (id: number): Promise<void> => {
    await api.delete(`/products/${id}`);
  },

  searchProducts: async (params: ProductSearchParams): Promise<ProductResponse[]> => {
    // Axios sẽ tự động chuyển đối tượng `params` thành query string
    // ví dụ: /products/search?keyword=áo&minPrice=100000
    // Nếu một giá trị trong `params` là undefined, Axios sẽ tự động bỏ qua nó.
    const response = await api.get('/products/search', { params: params });
    return response.data;
  },
};