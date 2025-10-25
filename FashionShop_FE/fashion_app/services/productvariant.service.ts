import { api } from './api'; // Import axios instance của bạn
import { ProductVariantResponse, ProductVariantPayload } from '@/types'; // (Điều chỉnh đường dẫn nếu cần)

export const productVariantService = {

  getAllVariants: async (): Promise<ProductVariantResponse[]> => {
    const response = await api.get('/variants');
    return response.data;
  },

  getVariantById: async (id: number): Promise<ProductVariantResponse> => {
    const response = await api.get(`/variants/${id}`);
    return response.data;
  },

  getVariantsByProductId: async (productId: number): Promise<ProductVariantResponse[]> => {
    const response = await api.get(`/variants/product/${productId}`);
    return response.data;
  },

  createVariant: async (variantData: ProductVariantPayload): Promise<ProductVariantResponse> => {
    const response = await api.post('/variants', variantData);
    return response.data;
  },

  updateVariant: async (id: number, variantData: ProductVariantPayload): Promise<ProductVariantResponse> => {
    const response = await api.put(`/variants/${id}`, variantData);
    return response.data;
  },

  deleteVariant: async (id: number): Promise<void> => {
    await api.delete(`/variants/${id}`);
  },
};