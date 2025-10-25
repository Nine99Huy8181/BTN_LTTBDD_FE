import { api } from './api';
import { OrderCreateRequest, OrderItemPayload } from '@/types';

const OrderService = {
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

export { OrderService };
