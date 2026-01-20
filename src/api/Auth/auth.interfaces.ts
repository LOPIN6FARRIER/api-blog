export interface RegisterInput {
  username: string;
  email: string;
  password: string;
  full_name?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    username: string;
    email: string;
    full_name?: string;
    role: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export interface RefreshTokenInput {
  refreshToken: string;
}