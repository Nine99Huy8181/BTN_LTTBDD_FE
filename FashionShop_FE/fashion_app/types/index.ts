// types/index.ts
export interface Product {
  productID: number;
  name: string;
  description?: string;
  brand: string;
  basePrice: number;
  discountPrice?: number;
  material?: string;
  createdDate?: string;
  status?: string;
  averageRating?: number;
  reviewCount?: number;
  isFeatured?: boolean;
  image?: string;
}

export interface ProductResponse {
  productID: number;
  name: string;
  brand: string;
  discountPrice: number;
  averageRating: number;
  image: string;
  soldQuantity: number;
}

export interface Account {
  accountID: number;              // Tương ứng Long
  email: string;
  password: string;
  role: string;
  registrationDate: string;       // LocalDateTime -> string (ISO format)
  accountStatus: string;
  customerID: number | null;     // Có thể null vì không phải account nào cũng là customer
  adminID: number | null;
}
