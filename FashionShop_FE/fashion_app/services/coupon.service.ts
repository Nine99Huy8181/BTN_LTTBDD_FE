import { api } from './api'; // dùng axios instance chung nếu có

export const couponService = {
  // Lấy danh sách mã giảm giá khả dụng
  getAvailableCoupons: async () => {
    const response = await api.get('/coupons/available');
    return response.data;
  },
};
