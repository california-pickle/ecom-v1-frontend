// src/services/auth/auth.types.ts

export interface LoginPayload {
  email: string;
  password: string;
}

// Tomar backend theke shudhu message ar user ashbe (token asbe na, token cookie te jabe)
export interface AuthResponse {
  message: string;
  user: {
    id: string;
    email: string;
  };
}
