export interface User {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  full_name?: string;
  avatar_url?: string;
  role_id: number;
  is_active: boolean;
  email_verified: boolean;
  api_key?: string;
  last_login?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface UserPublic {
  id: string;
  username: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: string;
  is_active: boolean;
  email_verified: boolean;
  created_at: Date;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
}