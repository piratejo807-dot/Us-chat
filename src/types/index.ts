export interface User {
  id: string;
  number: string;
  name: string;           // Original official name
  displayName: string;    // Custom name chosen by user
  avatar?: string;        // URL to uploaded photo
  createdAt: Date;
  lastSeen: Date;
}

export interface Message {
  id: string;
  userId: string;
  content: string;
  createdAt: Date;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface LoginRequest {
  number: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface ApiError {
  message: string;
  statusCode?: number;
}

export interface CreateMessageRequest {
  content: string;
  userId: string;
}

export interface UpdateProfileRequest {
  displayName?: string;
  avatar?: string;
}