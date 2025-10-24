// services/order.service.ts
import { api } from "./api";

// Lấy danh sách đơn hàng theo customerId
export const getOrdersByCustomer = async (customerId: number) => {
  const res = await api.get(`/orders/customer/${customerId}`);
  return res.data;
};

// Lấy chi tiết đơn hàng theo ID
export const getOrderDetail = async (orderId: number) => {
  const res = await api.get(`/orders/${orderId}`);
  return res.data;
};

// Hủy đơn hàng
export const cancelOrder = async (orderId: number) => {
  const res = await api.put(`/orders/${orderId}/cancel`);
  return res.data;
};

// Cập nhật trạng thái đơn hàng
export const updateOrderStatus = async (orderId: number, newStatus: string) => {
  const res = await api.put(`/orders/${orderId}/status`, { status: newStatus });
  return res.data;
};
