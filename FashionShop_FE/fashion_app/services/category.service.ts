import { api } from './api';
import { Category } from '@/types';

export const categoryService = {
  // Lấy tất cả danh mục
  getAllCategories: async (): Promise<Category[]> => {
    const response = await api.get('/categories');
    return response.data;
  },

  // Lấy danh mục theo ID
  getCategoryById: async (id: number): Promise<Category> => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  // Lấy danh mục con theo parentId
  getSubCategoriesByParentId: async (parentId: number): Promise<Category[]> => {
    const response = await api.get(`/categories/parent/${parentId}`);
    return response.data;
  },

  // Tìm kiếm danh mục theo tên
  searchCategoriesByName: async (name: string): Promise<Category[]> => {
    const response = await api.get('/categories/search', { params: { name } });
    return response.data;
  },

  // Tạo mới danh mục
  createCategory: async (category: Category): Promise<Category> => {
    const response = await api.post('/categories', category);
    return response.data;
  },

  // Cập nhật danh mục
  updateCategory: async (id: number, category: Category): Promise<Category> => {
    const response = await api.put(`/categories/${id}`, category);
    return response.data;
  },
};