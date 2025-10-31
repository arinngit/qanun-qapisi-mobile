import { api, setTokens, removeTokens } from './config';

// Types
export interface SignupRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface VerifyRequest {
  email: string;
  code: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface ConfirmResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
}

export interface PasswordStrengthRequest {
  password: string;
}

export interface PasswordStrengthResponse {
  score: number;
  level: string;
  message: string;
  suggestions: string[];
  crackTime: string;
}

export interface MeResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  verified: boolean;
}

// Auth API
export const authAPI = {
  // Signup
  signup: async (data: SignupRequest): Promise<void> => {
    await api.post("/auth/signup", data);
  },

  // Verify email
  verify: async (data: VerifyRequest): Promise<AuthResponse> => {
    const response = await api.post("/auth/verify", data);
    const { accessToken, refreshToken } = response.data;
    await setTokens(accessToken, refreshToken);
    return response.data;
  },

  // Resend verification code
  resend: async (email: string): Promise<void> => {
    await api.post("/auth/resend", { email });
  },

  // Login
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post("/auth/login", data);
    const { accessToken, refreshToken } = response.data;
    await setTokens(accessToken, refreshToken);
    return response.data;
  },

  // Refresh token
  refresh: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await api.post("/auth/refresh", { refreshToken });
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;
    await setTokens(newAccessToken, newRefreshToken);
    return response.data;
  },

  // Logout
  logout: async (): Promise<void> => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      await removeTokens();
    }
  },

  // Get current user
  me: async (): Promise<MeResponse> => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  // Request password reset
  resetPassword: async (data: ResetPasswordRequest): Promise<void> => {
    await api.post("/auth/reset-password", data);
  },

  // Confirm password reset
  confirmResetPassword: async (
    data: ConfirmResetPasswordRequest
  ): Promise<void> => {
    await api.post("/auth/confirm-reset-password", data);
  },

  checkPasswordStrength: async (
    data: PasswordStrengthRequest
  ): Promise<PasswordStrengthResponse> => {
    const response = await api.post("/auth/check-password-strength", data);
    return response.data;
  },
};