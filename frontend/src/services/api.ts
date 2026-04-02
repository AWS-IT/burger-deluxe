import {
  ApiResponse,
  PaginatedResponse,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
  Dish,
  Cart,
  Order,
  CreateOrderRequest,
  Category,
  AdminStats
} from '@/types';

const API_BASE_URL = (import.meta as unknown as { env: { VITE_API_URL?: string } }).env?.VITE_API_URL || 'http://localhost:5000/api';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Для отправки cookies
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth API
  async login(data: LoginRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async logout(): Promise<ApiResponse<never>> {
    return this.request<ApiResponse<never>>('/auth/logout', {
      method: 'POST',
    });
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request<ApiResponse<User>>('/auth/me');
  }

  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<ApiResponse<User>>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Dishes API
  async getDishes(params?: {
    category?: string;
    search?: string;
    isPopular?: boolean;
    isNew?: boolean;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Dish>> {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    return this.request<PaginatedResponse<Dish>>(
      `/dishes?${searchParams.toString()}`
    );
  }

  async getDishById(id: string): Promise<ApiResponse<Dish>> {
    return this.request<ApiResponse<Dish>>(`/dishes/${id}`);
  }

  async getPopularDishes(): Promise<ApiResponse<Dish[]>> {
    return this.request<ApiResponse<Dish[]>>('/dishes/popular');
  }

  async getNewDishes(): Promise<ApiResponse<Dish[]>> {
    return this.request<ApiResponse<Dish[]>>('/dishes/new');
  }

  async getCategories(): Promise<ApiResponse<Category[]>> {
    return this.request<ApiResponse<Category[]>>('/dishes/categories');
  }

  // Cart API
  async getCart(): Promise<ApiResponse<Cart>> {
    return this.request<ApiResponse<Cart>>('/cart');
  }

  async addToCart(dishId: string, quantity: number): Promise<ApiResponse<Cart>> {
    return this.request<ApiResponse<Cart>>('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ dishId, quantity }),
    });
  }

  async updateCartItem(dishId: string, quantity: number): Promise<ApiResponse<Cart>> {
    return this.request<ApiResponse<Cart>>(`/cart/item/${dishId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  }

  async removeFromCart(dishId: string): Promise<ApiResponse<Cart>> {
    return this.request<ApiResponse<Cart>>(`/cart/item/${dishId}`, {
      method: 'DELETE',
    });
  }

  async clearCart(): Promise<ApiResponse<never>> {
    return this.request<ApiResponse<never>>('/cart/clear', {
      method: 'DELETE',
    });
  }

  // Orders API
  async createOrder(data: CreateOrderRequest): Promise<ApiResponse<Order>> {
    return this.request<ApiResponse<Order>>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getUserOrders(params?: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Order>> {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    return this.request<PaginatedResponse<Order>>(
      `/orders?${searchParams.toString()}`
    );
  }

  async getOrderById(id: string): Promise<ApiResponse<Order>> {
    return this.request<ApiResponse<Order>>(`/orders/${id}`);
  }

  async cancelOrder(id: string): Promise<ApiResponse<Order>> {
    return this.request<ApiResponse<Order>>(`/orders/${id}/cancel`, {
      method: 'PUT',
    });
  }

  // Admin API
  async getAllDishesAdmin(params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
  }): Promise<PaginatedResponse<Dish>> {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    return this.request<PaginatedResponse<Dish>>(
      `/admin/dishes?${searchParams.toString()}`
    );
  }

  async createDish(formData: FormData): Promise<ApiResponse<Dish>> {
    return this.request<ApiResponse<Dish>>('/admin/dishes', {
      method: 'POST',
      headers: {}, // Не устанавливаем Content-Type для FormData
      body: formData,
    });
  }

  async updateDish(id: string, formData: FormData): Promise<ApiResponse<Dish>> {
    return this.request<ApiResponse<Dish>>(`/admin/dishes/${id}`, {
      method: 'PUT',
      headers: {}, // Не устанавливаем Content-Type для FormData
      body: formData,
    });
  }

  async deleteDish(id: string): Promise<ApiResponse<never>> {
    return this.request<ApiResponse<never>>(`/admin/dishes/${id}`, {
      method: 'DELETE',
    });
  }

  async getAllOrdersAdmin(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
  }): Promise<PaginatedResponse<Order>> {
    const searchParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, value.toString());
        }
      });
    }

    return this.request<PaginatedResponse<Order>>(
      `/admin/orders?${searchParams.toString()}`
    );
  }

  async updateOrderStatus(
    id: string,
    status: string,
    adminComment?: string
  ): Promise<ApiResponse<Order>> {
    return this.request<ApiResponse<Order>>(`/admin/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, adminComment }),
    });
  }

  async getAdminStats(): Promise<ApiResponse<AdminStats>> {
    return this.request<ApiResponse<AdminStats>>('/admin/stats');
  }

  // Sync API
  async syncWithMoySklad(): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/sync/moysklad', {
      method: 'POST',
    });
  }

  async syncWith1C(): Promise<ApiResponse<any>> {
    return this.request<ApiResponse<any>>('/sync/1c', {
      method: 'POST',
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
export default apiClient;