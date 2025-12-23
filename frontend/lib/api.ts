import { User, LoginCredentials, AuthResponse } from '../types/user';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Debug: check if cookies exist
    console.log('[API Request] Current cookies:', document.cookie);
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      credentials: 'include',
    };

    console.log(`[API] ${options?.method || 'GET'} ${url}`);
    
    const response = await fetch(url, config);

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'An error occurred',
      }));
      console.error(`[API Error] ${response.status}:`, error);
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth endpoints
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async logout(): Promise<{ message: string }> {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async getMe(): Promise<User> {
    return this.request<User>('/user/me');
  }

  async refreshToken(): Promise<{ message: string }> {
    return this.request('/auth/refresh', {
      method: 'POST',
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);