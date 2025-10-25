// types.ts
export interface ProductResponse {
  productID: number;
  name: string;
  brand: string;
  discountPrice: number;
  averageRating: number;
  image: string;
  soldQuantity: number;
}

export interface Product {
  productID: number;
  name: string;
  description: string;
  brand: string;
  basePrice: number;
  discountPrice: number;
  material: string;
  createdDate: string;
  status: string;
  averageRating: number;
  reviewCount: number;
  isFeatured: boolean;
  image: string;
}
export interface Account {
  accountID: number;              // Tương ứng Long
  email: string;
  role: string;
  registrationDate: string;       // LocalDateTime -> string (ISO format)
  accountStatus: string;
  customerID: number | null;     // Có thể null vì không phải account nào cũng là customer
  adminID: number | null;
}

export interface Address {
  addressID?: number;
  recipientName?: string;
  recipientPhone?: string;
  streetAddress?: string;
  district?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  isDefault?: boolean;
  customer?: { customerID: number };
}

export interface OrderPayload {
  customer: { customerID: number };
  totalAmount?: number;
  paymentMethod?: string;
  paymentStatus?: string;
  orderStatus?: string;
  shippingFee?: number;
  notes?: string;
}

export interface OrderItemPayload {
  order: { orderID: number };
  variant: { variantID: number };
  quantity: number;
  unitPrice: number;
  subTotal: number;
}

export interface OrderItemRequest {
  variantID: number;
  quantity: number;
}

export interface OrderCreateRequest {
  items: OrderItemRequest[];
  addressID?: number;
  paymentMethod?: string;
  notes?: string;
}
