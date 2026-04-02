export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
  addresses: Address[];
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  street: string;
  apartment?: string;
  floor?: string;
  comment?: string;
  isDefault: boolean;
}

export interface Dish {
  _id: string;
  id: string;
  name: string;
  description: string;
  category: 'signature-burgers' | 'classic-burgers' | 'chicken-sides' | 'fries-snacks' | 'drinks-shakes' | 'desserts';
  price: number;
  weight: number;
  calories: number;
  images: string[];
  ingredients: string[];
  isSpicy: boolean;
  isVegetarian: boolean;
  isNewDish: boolean;
  isPopular: boolean;
  externalId?: string;
  source?: 'moysklad' | '1c';
  stock: number;
  isAvailable: boolean;
  inStock: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  dish: Dish;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  totalAmount: number;
  deliveryFee: number;
  finalAmount: number;
}

export interface OrderItem {
  dish: string | Dish;
  quantity: number;
  price: number;
}

export interface Order {
  _id: string;
  id: string;
  orderNumber: string;
  user: string | User;
  items: OrderItem[];
  totalAmount: number;
  deliveryFee: number;
  finalAmount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'on-the-way' | 'delivered' | 'cancelled';
  statusText: string;
  deliveryAddress: {
    street: string;
    apartment?: string;
    floor?: string;
    comment?: string;
  };
  deliveryTime: string;
  paymentMethod: 'cash' | 'card';
  paymentStatus: 'pending' | 'paid' | 'failed';
  customerComment?: string;
  adminComment?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  count: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: string[];
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: {
    street: string;
    apartment?: string;
    floor?: string;
    comment?: string;
  };
}

export interface AuthResponse extends ApiResponse<never> {
  user: User;
  token: string;
}

export interface CreateOrderRequest {
  deliveryAddress: {
    street: string;
    apartment?: string;
    floor?: string;
    comment?: string;
  };
  deliveryTime: string;
  paymentMethod: 'cash' | 'card';
  customerComment?: string;
}

export interface AdminStats {
  today: {
    orders: number;
    revenue: number;
  };
  total: {
    orders: number;
    revenue: number;
    dishes: number;
    users: number;
  };
  orderStatuses: {
    _id: string;
    count: number;
  }[];
}