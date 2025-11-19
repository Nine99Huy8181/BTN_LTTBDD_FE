// services/dashboard.service.ts
import { Config } from '@/constants/Config';
import { BestSellingProduct, DashboardStats, RecentOrder, RecentReview, RevenueChart } from '@/types';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';


const getAuthHeader = async () => {
  const token = await SecureStore.getItemAsync('jwt_token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
};

export const dashboardService = {
  /**
   * Lấy thống kê tổng quan
   */
  async getStats(): Promise<DashboardStats> {
    const config = await getAuthHeader();
    const response = await axios.get(
      `${Config.API_URL}/admin/dashboard/stats`,
      config
    );
    return response.data.result || response.data;
  },

  /**
   * Lấy dữ liệu biểu đồ doanh thu
   */
  async getRevenueChart(): Promise<RevenueChart> {
    const config = await getAuthHeader();
    const response = await axios.get(
      `${Config.API_URL}/admin/dashboard/revenue-chart`,
      config
    );
    return response.data.result || response.data;
  },

  /**
   * Lấy danh sách sản phẩm bán chạy
   */
  async getBestSellingProducts(limit: number = 10): Promise<BestSellingProduct[]> {
    const config = await getAuthHeader();
    const response = await axios.get(
      `${Config.API_URL}/admin/dashboard/best-selling-products?limit=${limit}`,
      config
    );
    return response.data.result || response.data;
  },

  /**
   * Lấy danh sách đơn hàng mới
   */
  async getRecentOrders(limit: number = 10): Promise<RecentOrder[]> {
    const config = await getAuthHeader();
    const response = await axios.get(
      `${Config.API_URL}/admin/dashboard/recent-orders?limit=${limit}`,
      config
    );
    return response.data.result || response.data;
  },

  /**
   * Lấy danh sách đánh giá mới
   */
  async getRecentReviews(limit: number = 10): Promise<RecentReview[]> {
    const config = await getAuthHeader();
    const response = await axios.get(
      `${Config.API_URL}/admin/dashboard/recent-reviews?limit=${limit}`,
      config
    );
    return response.data.result || response.data;
  },
};