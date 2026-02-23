import {api} from './config';

export interface ProfileResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  isPremium: boolean;
  verified: boolean;
  role: string;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ChangeEmailRequest {
  newEmail: string;
}

export interface VerifyEmailChangeRequest {
  code: number;
}

export interface DeleteAccountRequest {
  password: string;
}

export const profileAPI = {
  getProfile: async (): Promise<ProfileResponse> => {
    const response = await api.get("/profile");
    return response.data;
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<ProfileResponse> => {
    const response = await api.put("/profile", data);
    return response.data;
  },

  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await api.post("/profile/change-password", data);
  },

  requestEmailChange: async (data: ChangeEmailRequest): Promise<void> => {
    await api.post("/profile/change-email", data);
  },

  verifyEmailChange: async (data: VerifyEmailChangeRequest): Promise<void> => {
    await api.post("/profile/verify-email-change", data);
  },

  deleteAccount: async (data: DeleteAccountRequest): Promise<void> => {
    await api.delete("/profile/account", {data});
  },
};
