export interface User {
  id: string;
  email: string;
  name: string;
  github: string;
  onboardingCompleted?: boolean;
  avatar?: string;
  role?: 'user' | 'admin';
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  message: string;
}