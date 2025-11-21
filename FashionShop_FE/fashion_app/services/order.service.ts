// services/order_service.ts
import { Order, OrderCreateRequest, OrderDTO, OrderItemPayload, PaginatedResponse } from '@/types';
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

  // 🔄 Cập nhật trạng thái đơn hàng (Admin/Super)
  async updateOrderStatus(orderId: number, status: string): Promise<OrderDTO> {
    // Backend mong đợi một đối tượng Map<String, String> với key là "status"
    const body = { status: status };
    const res = await api.put(`/orders/${orderId}/status`, body);
    return res.data;
  },

  async getAllOrdersPaginated(page: number, size: number, status: string | null): Promise<PaginatedResponse<OrderDTO>> {

    const params: any = {
      page: page,
      size: size,
    };

    if (status) {
      params.status = status;
    }
    const res = await api.get('/page-orders', { params });
    return res.data;
  },

    async getOrderDTODetail(orderId: number): Promise<OrderDTO> {
    const res = await api.get(`/orders-dto/${orderId}`);
    return res.data;
  },
};
