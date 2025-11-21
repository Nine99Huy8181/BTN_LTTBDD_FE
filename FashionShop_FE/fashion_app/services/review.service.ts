// services/review.service.ts
import {
    CreateReviewResponsePayload,
    ReviewDTO,
    ReviewResponse,
    UpdateReviewResponsePayload
} from '@/types';
import { api } from './api';

// Review Service
export const reviewService = {
  // Lấy tất cả reviews
  getAllReviews: async (): Promise<ReviewDTO[]> => {
    const response = await api.get('/reviews');
    return response.data;
  },

  // Lấy review theo ID
  getReviewById: async (id: number): Promise<ReviewDTO> => {
    const response = await api.get(`/reviews/${id}`);
    return response.data;
  },

  // Lấy reviews theo product ID
  getReviewsByProductId: async (productId: number): Promise<ReviewDTO[]> => {
    const response = await api.get(`/reviews/product/${productId}`);
    return response.data;
  },

  // Cập nhật review (ví dụ: thay đổi status)
  updateReview: async (id: number, data: Partial<ReviewDTO>): Promise<ReviewDTO> => {
    const response = await api.put(`/reviews/${id}`, data);
    return response.data;
  },
};

// Review Response Service
export const reviewResponseService = {
  // Lấy response theo ID
  getResponseById: async (id: number): Promise<ReviewResponse> => {
    const response = await api.get(`/review-responses/${id}`);
    return response.data;
  },

  // Lấy response theo review ID
  getResponseByReviewId: async (reviewId: number): Promise<ReviewResponse> => {
    const response = await api.get(`/review-responses/review/${reviewId}`);
    return response.data;
  },

  // Tạo response mới
  createResponse: async (payload: CreateReviewResponsePayload): Promise<ReviewResponse> => {
    const response = await api.post('/review-responses', payload);
    return response.data;
  },

  // Cập nhật response
  updateResponse: async (id: number, payload: UpdateReviewResponsePayload): Promise<ReviewResponse> => {
    const response = await api.put(`/review-responses/${id}`, payload);
    return response.data;
  },
  // Xóa response
  deleteResponse: async (id: number): Promise<void> => {
    const response = await api.delete(`/review-responses/${id}`);
    return response.data;
  },
};

// Helper function để lấy review kèm response
export const getReviewWithResponse = async (reviewId: number): Promise<ReviewDTO & { response?: ReviewResponse }> => {
  const review = await reviewService.getReviewById(reviewId);
  try {
    const response = await reviewResponseService.getResponseByReviewId(reviewId);
    return { ...review, response };
  } catch (error) {
    // Nếu chưa có response, trả về review không có response
    return review;
  }
};