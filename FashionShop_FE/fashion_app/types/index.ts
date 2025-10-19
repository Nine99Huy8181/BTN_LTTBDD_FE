export interface Product {
  averageRating: number;
  basePrice: number;
  brand: string;
  createdDate: string; // JSON trả về ngày tháng dưới dạng string (ISO 8601)
  description: string;
  discountPrice: number;
  isFeatured: boolean;
  material: string;
  name: string;
  productID: number; // Trong JSON này là number
  reviewCount: number;
  status: string;
  categoryID?: string | null; 
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
