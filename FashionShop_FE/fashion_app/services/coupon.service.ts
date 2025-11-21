import { Coupon } from '@/types';
import { api } from './api';

export const couponService = {
  getAllCoupons: async (): Promise<Coupon[]> => {
    const response = await api.get('/coupons');
    return response.data;
  },

  getCouponById: async (id: number): Promise<Coupon> => {
    const response = await api.get(`/coupons/${id}`);
    return response.data;
  },

  getCouponByCode: async (code: string): Promise<Coupon> => {
    const response = await api.get(`/coupons/code/${code}`);
    return response.data;
  },

  getAvailableCoupons: async (): Promise<Coupon[]> => {
    const response = await api.get('/coupons/available');
    return response.data;
  },

  createCoupon: async (coupon: Omit<Coupon, 'couponID'>): Promise<Coupon> => {
    const response = await api.post('/coupons', coupon);
    return response.data;
  },

  updateCoupon: async (id: number, coupon: Partial<Coupon>): Promise<Coupon> => {
    const response = await api.put(`/coupons/${id}`, coupon);
    return response.data;
  },

  deleteCoupon: async (id: number): Promise<void> => {
    await api.delete(`/coupons/${id}`);
  },
};