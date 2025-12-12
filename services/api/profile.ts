import { api } from './config';

// Profile Types (matches backend ProfileResponse exactly)
export interface ProfileResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string | null;
  profilePictureUrl: string | null;
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

// Profile API
export const profileAPI = {
  // Get user profile
  getProfile: async (): Promise<ProfileResponse> => {
    const response = await api.get("/profile");
    return response.data;
  },

  // Update profile
  updateProfile: async (data: UpdateProfileRequest): Promise<ProfileResponse> => {
    const response = await api.put("/profile", data);
    return response.data;
  },

  // Change password
  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await api.post("/profile/change-password", data);
  },

  // Request email change
  requestEmailChange: async (data: ChangeEmailRequest): Promise<void> => {
    await api.post("/profile/change-email", data);
  },

  // Verify email change
  verifyEmailChange: async (data: VerifyEmailChangeRequest): Promise<void> => {
    await api.post("/profile/verify-email-change", data);
  },

  // Upload profile picture
  uploadProfilePicture: async (file: FormData): Promise<{ imageUrl: string }> => {
    const response = await api.post("/profile/picture", file, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Accept': 'application/json',
      },
      timeout: 30000,
    });
    return response.data;
  },

  // Delete profile picture
  deleteProfilePicture: async (): Promise<void> => {
    await api.delete("/profile/picture");
  },

  // Delete account
  deleteAccount: async (data: DeleteAccountRequest): Promise<void> => {
    await api.delete("/profile/account", { data });
  },
};