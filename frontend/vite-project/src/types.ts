export type UserRole = 'user' | 'admin';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  profilePicture?: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

