import { api } from './api';
import { Address } from '@/types';

const AddressService = {
  getAddressesByCustomerId: async (customerId: number): Promise<Address[]> => {
    const res = await api.get(`/addresses/customer/${customerId}`);
    return res.data;
  },

  createAddress: async (address: Address): Promise<Address> => {
    const res = await api.post('/addresses', address);
    return res.data;
  },
};

export { AddressService };
