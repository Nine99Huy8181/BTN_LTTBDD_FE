// services/order_service.ts
import { Order, OrderCreateRequest, OrderItemPayload } from '@/types';
import { api } from './api';

export const OrderService = {
  // 🧾 Tạo đơn hàng mới (kèm danh sách item)
  async createOrder(order: OrderCreateRequest): Promise<Order> {
    const res = await api.post('/orders', order);
    return res.data;
  },

  // 📦 Tạo riêng từng OrderItem (nếu dùng API tách)
  async createOrderItem(item: OrderItemPayload): Promise<OrderItemPayload> {
    const res = await api.post('/order-items', item);
    return res.data;
  },

  // 👤 Lấy danh sách đơn hàng theo customerId
  async getOrdersByCustomer(customerId: number): Promise<Order[]> {
    const res = await api.get(`/orders/customer/${customerId}`);
    return res.data;
  },

  // 🔍 Lấy chi tiết 1 đơn hàng
  async getOrderDetail(orderId: number): Promise<Order> {
    const res = await api.get(`/orders/${orderId}`);
    return res.data;
  },

  // ❌ Hủy đơn hàng
  async cancelOrder(orderId: number): Promise<Order> {
    const res = await api.put(`/orders/${orderId}/cancel`);
    return res.data;
  },

  // 🔄 Cập nhật trạng thái đơn hàng
  async updateOrderStatus(orderId: number, newStatus: string): Promise<Order> {
    const res = await api.put(`/orders/${orderId}/status`, { status: newStatus });
    return res.data;
  },
};
