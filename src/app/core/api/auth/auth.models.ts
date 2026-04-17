// src/app/core/api/auth/auth.models.ts
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  roles: string[]; // ["ADMIN"] o ["CAJERO"]
}
