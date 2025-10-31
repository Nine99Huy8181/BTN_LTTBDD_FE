
import { api } from './api';
import { OrderCreateRequest, OrderItemPayload } from '@/types';

export const OrderService = {
  // New single endpoint to create order with items
  createOrder: async (order: OrderCreateRequest) => {
    const res = await api.post('/orders', order);
    return res.data;
  },

  // keep for backward compatibility if needed
  createOrderItem: async (item: OrderItemPayload) => {
    const res = await api.post('/order-items', item);
    return res.data;
  },
};


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
