// types.ts
export interface ProductResponse {
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

// types/index.ts (hoặc file tương tự trong @/types)
export interface Category {
  categoryID: number;
  name: string;
  description: string;
  image: string;
  parentID?: number | null;
}

export interface ProductVariantResponse {
  variantID: number;
  sku: string;
  size: string;
  color: string;
  priceAdjustment: number;
  images: string[];
  status: string;
  validQuantity: number | 0;
  productID: number; // ID của Product cha
}

export interface ProductVariantPayload {
  product: {
    productID: number; // Khi tạo/cập nhật, chỉ cần gửi ID của product cha
  };
  sku: string;
  size: string;
  color: string;
  priceAdjustment: number;
  images: string[];
  status: string;
}

export interface ProductSearchParams {
  keyword?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  maxRating?: number;
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

//hung
// Cấu trúc đơn hàng trả về từ backend
export interface Order {
  orderId: number;
  customerId: number;
  status: string;
  totalAmount: number;
  createdAt: string;
  updatedAt?: string;
  paymentMethod: string;
  address?: string;
  items?: OrderItemPayload[]; // tùy backend trả có kèm item không
}

export interface User {
  userName: string;
  role: string;
  accountId?: number;
  customerId?: number;
}

export interface Customer {
  customerID: number;
  fullName: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  loyaltyPoints: number;
}

export interface WishlistItem {
  wishlistItemID: number;
  wishlist: {
    wishlistID: number;
  };
  product: {
    productID: number;
    name: string;
    brand: string;
    discountPrice: number;
    averageRating: number;
    image: string;
  };
  addedDate: string;
}

export interface Wishlist {
  wishlistID: number;
  customer: {
    customerID: number;
  };
  createdDate: string;
  items?: WishlistItem[];
}

