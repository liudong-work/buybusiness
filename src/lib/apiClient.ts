import type { Product, Brand, Order, Inquiry, BuyerUser } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers = new Headers({
    'Content-Type': 'application/json',
  });

  if (options.headers) {
    const additionalHeaders = options.headers as Record<string, string>;
    Object.entries(additionalHeaders).forEach(([key, value]) => {
      headers.set(key, value);
    });
  }

  const token = getAuthToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('buyer_token');
}

export const apiClient = {
  products: {
    getAll: () => request<Product[]>('/api/v1/products'),
    getById: (id: string) => request<Product>(`/api/v1/products/${id}`),
    create: (product: Partial<Product>) => 
      request<Product>('/api/v1/products', {
        method: 'POST',
        body: JSON.stringify(product),
      }),
    update: (id: string, product: Partial<Product>) =>
      request<Product>(`/api/v1/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(product),
      }),
    delete: (id: string) =>
      request<void>(`/api/v1/products/${id}`, {
        method: 'DELETE',
      }),
    publish: (id: string) =>
      request<Product>(`/api/v1/products/${id}/publish`, {
        method: 'PUT',
      }),
    unpublish: (id: string) =>
      request<Product>(`/api/v1/products/${id}/unpublish`, {
        method: 'PUT',
      }),
  },

  brands: {
    getAll: () => request<Brand[]>('/api/v1/brands'),
    getById: (id: string) => request<Brand>(`/api/v1/brands/${id}`),
  },

  orders: {
    getAll: () => request<Order[]>('/api/v1/orders'),
    getById: (id: string) => request<Order>(`/api/v1/orders/${id}`),
    create: (order: Partial<Order>) =>
      request<Order>('/api/v1/orders', {
        method: 'POST',
        body: JSON.stringify(order),
      }),
    updateStatus: (id: string, status: Order['status']) =>
      request<Order>(`/api/v1/orders/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      }),
    updateShipping: (id: string, shippingInfo: any) =>
      request<Order>(`/api/v1/orders/${id}/shipping`, {
        method: 'PUT',
        body: JSON.stringify(shippingInfo),
      }),
  },

  inquiries: {
    getAll: () => request<Inquiry[]>('/api/v1/buyer/inquiries'),
    getById: (id: string) => request<Inquiry>(`/api/v1/buyer/inquiries/${id}`),
    create: (inquiry: Partial<Inquiry>) =>
      request<Inquiry>('/api/v1/buyer/inquiries', {
        method: 'POST',
        body: JSON.stringify(inquiry),
      }),
    addFollowUp: (id: string, message: string) =>
      request<Inquiry>(`/api/v1/buyer/inquiries/${id}/follow-ups`, {
        method: 'POST',
        body: JSON.stringify({ message }),
      }),
  },

  auth: {
    register: (userData: {
      contactName: string;
      email: string;
      password: string;
      businessName: string;
      businessType: string;
      phoneNumber: string;
      country: string;
    }) =>
      request<{ accessToken: string; user: BuyerUser }>('/api/v1/buyer/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      }),
    login: (credentials: { email: string; password: string }) =>
      request<{ accessToken: string; user: BuyerUser }>('/api/v1/buyer/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    me: () => request<BuyerUser>('/api/v1/buyer/auth/me'),
  },

  cart: {
    get: () => request<any[]>('/api/v1/cart'),
    addItem: (item: any) =>
      request<any>('/api/v1/cart', {
        method: 'POST',
        body: JSON.stringify(item),
      }),
    updateItem: (itemId: string, quantity: number) =>
      request<any>(`/api/v1/cart/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity }),
      }),
    removeItem: (itemId: string) =>
      request<void>(`/api/v1/cart/${itemId}`, {
        method: 'DELETE',
      }),
    clear: () =>
      request<void>('/api/v1/cart', {
        method: 'DELETE',
      }),
  },

  favorites: {
    get: () => request<any>('/api/v1/favorites'),
    addProduct: (productId: string) =>
      request<void>(`/api/v1/favorites/products/${productId}`, {
        method: 'POST',
      }),
    removeProduct: (productId: string) =>
      request<void>(`/api/v1/favorites/products/${productId}`, {
        method: 'DELETE',
      }),
    addBrand: (brandId: string) =>
      request<void>(`/api/v1/favorites/brands/${brandId}`, {
        method: 'POST',
      }),
    removeBrand: (brandId: string) =>
      request<void>(`/api/v1/favorites/brands/${brandId}`, {
        method: 'DELETE',
      }),
  },

  compare: {
    get: () => request<any>('/api/v1/compare'),
    addProduct: (productId: string) =>
      request<void>(`/api/v1/compare/products/${productId}`, {
        method: 'POST',
      }),
    removeProduct: (productId: string) =>
      request<void>(`/api/v1/compare/products/${productId}`, {
        method: 'DELETE',
      }),
    addBrand: (brandId: string) =>
      request<void>(`/api/v1/compare/brands/${brandId}`, {
        method: 'POST',
      }),
    removeBrand: (brandId: string) =>
      request<void>(`/api/v1/compare/brands/${brandId}`, {
        method: 'DELETE',
      }),
  },
};