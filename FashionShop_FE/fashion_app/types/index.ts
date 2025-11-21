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
  // Inventory object: frontend sends total quantity and reserved quantity
  inventory?: {
    quantity?: number;
    reservedQuantity?: number;
  };
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
  orderId?: number;
  orderID?: number;
  customerId?: number;
  customer?: { customerID: number; fullName: string };
  status?: string;
  orderStatus?: string;
  totalAmount?: number;
  createdAt?: string;
  orderDate?: string;
  updatedAt?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  address?: string;
  items?: OrderItemPayload[]; // tùy backend trả có kèm item không
  orderItems?: any[]; // từ backend trả về với variant + product info
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

export interface OrderDTO {
  orderID: number;
  customerID: number;
  customerName: string;
  orderDate: string; // ← "05/04/2025 14:30"
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  paymentDate: string | null;
  orderStatus: string;
  shippingFee: number;
  notes: string | null;
  addressID: number;
  shippingAddress: string;
  couponCode: string | null;
}

export interface NotificationDTO {
  notificationID: number;
  customerID: number;
  title: string;
  message: string;
  type: string; // "ORDER", "PROMOTION", "SYSTEM"...
  isRead: boolean;
  createdDate: string; // Tương ứng với LocalDateTime
  readDate: string | null; // Tương ứng với LocalDateTime, có thể null
  deepLink: string | null; // Có thể null
  imageUrl: string | null; // Có thể null
}

export interface PaginatedResponse<T> {
  content: T[];          // Danh sách các đối tượng (ví dụ: OrderDTO)
  totalPages: number;    // Tổng số trang
  totalElements: number; // Tổng số phần tử
  size: number;          // Kích thước của trang này
  number: number;        // Số của trang hiện tại (bắt đầu từ 0)
  last: boolean;         // Đây có phải là trang cuối không?
  first: boolean;        // Đây có phải là trang đầu không?
  numberOfElements: number; // Số phần tử thực tế trên trang này
}

//dasboard types, hung
export interface DashboardStats {
  totalRevenue: number;
  todayRevenue: number;
  monthRevenue: number;
  yearRevenue: number;
  totalOrders: number;
  newOrdersToday: number;
  pendingOrders: number;
  completedOrders: number;
  totalProducts: number;
  lowStockProducts: number;
  totalCustomers: number;
  newCustomersThisMonth: number;
  averageOrderValue: number;
  averageRating: number;
}

export interface ChartDataPoint {
  label: string;
  revenue: number;
  orderCount: number;
}

export interface RevenueChart {
  daily: ChartDataPoint[];
  weekly: ChartDataPoint[];
  monthly: ChartDataPoint[];
  yearly: ChartDataPoint[];
}

export interface BestSellingProduct {
  productId: number;
  productName: string;
  imageUrl: string;
  totalSold: number;
  totalRevenue: number;
  averageRating: number;
  stockQuantity: number;
}

export interface RecentOrder {
  orderId: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  orderDate: string;
  itemCount: number;
}

export interface RecentReview {
  reviewId: number;
  productId: number;
  productName: string;
  productImage: string;
  customerName: string;
  rating: number;
  comment: string;
  createdAt: string;
  hasResponse: boolean;
}

//hung
export type UpdateProductRequest = {
  name: string;
  basePrice: number;
  discountPrice: number;
  brand: string;
  description: string;
  material: string;
  image: string;
  status: string;
  isFeatured: boolean;
};
//hung review
export interface ReviewDTO {
  reviewID: number;
  productID: number;
  customerID: number;
  customerName: string;
  customerAvatar: string;
  rating: number;
  comment: string;
  reviewDate: string;
  images: string[];
  status: string;
}

export interface ReviewResponse {
  responseID: number;
  reviewID: number;
  adminID: number;
  responseContent: string;
  responseDate: string;
  status: string;
}

export interface ReviewWithResponse extends ReviewDTO {
  response?: ReviewResponse;
}

export interface CreateReviewResponsePayload {
  review: {
    reviewID: number;
  };
  admin: {
    adminID: number;
  };
  responseContent: string;
  responseDate: string;
  status: string;
}

export interface UpdateReviewResponsePayload {
  responseContent: string;
  responseDate: string;
  status: string;
}
export interface Account {
  accountID: number;
  email: string;
  password?: string;
  role: string;
  registrationDate: string;
  accountStatus: string;
  avatar?: string;
}

export interface Admin {
  adminID: number;
  account: Account;
  fullName: string;
  department: string;
  position: string;
  hireDate: string;
}

export interface CreateAdminRequest {
  account: {
    accountID: number;
  };
  fullName: string;
  department: string;
  position: string;
  hireDate: string;
}

export interface UpdateAdminRequest {
  account: {
    accountID: number;
  };
  fullName: string;
  department: string;
  position: string;
  hireDate: string;
}
export interface Coupon {
  couponID?: number;
  code: string;
  description: string;
  discountValue: number;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  startDate: string; // ISO date string (YYYY-MM-DD)
  endDate: string;
  maxUses?: number;
  usedCount?: number;
  conditions?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
}

export interface UpdateCustomerRequest {
  account: { accountID: number };
  fullName: string;
  phoneNumber: string;
  dateOfBirth: string; // format: "YYYY-MM-DD"
  gender: string;
  loyaltyPoints?: number;
  referralCode?: string;
}
