import { api } from './config';
import { TestDetailResponse, TestResponse } from './tests';

// Admin User Types
export interface AdminUserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  isPremium: boolean;
  verified: boolean;
  isVerified?: boolean; // Alias for backward compatibility
  dateOfBirth: string | null;
  profilePictureUrl: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive?: boolean;
  isPremium?: boolean;
  isVerified?: boolean;
}

export interface UpdateUserRequest {
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  isActive?: boolean;
  isPremium?: boolean;
  isVerified?: boolean;
}

// Dashboard Types
export interface DashboardStatsResponse {
  totalUsers: number;
  totalTests: number;
  publishedTests: number;
  draftTests: number;
  totalAttempts: number;
  recentUsers: AdminUserResponse[];
}

// Test Attempt Admin Response
export interface TestAttemptAdminResponse {
  id: string;
  userId: string;
  userEmail: string;
  userFirstName: string;
  userLastName: string;
  totalScore: number;
  maxPossibleScore: number;
  status: string;
  startedAt: string;
  submittedAt: string | null;
}

// Test Creation/Update Types
export interface CreateQuestionRequest {
  questionType: string;
  questionText: string;
  imageUrl?: string;
  score: number;
  orderIndex?: number;
  correctAnswer?: string;
  answers?: CreateAnswerRequest[];
}

export interface CreateAnswerRequest {
  answerText: string;
  isCorrect: boolean;
  orderIndex?: number;
}

export interface CreateTestRequest {
  title: string;
  description: string;
  isPremium: boolean;
  questions?: CreateQuestionRequest[];
}

export interface UpdateTestRequest {
  title?: string;
  description?: string;
  isPremium?: boolean;
  questions?: CreateQuestionRequest[];
}

export interface GetAdminTestsParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
  status?: string;
  isPremium?: boolean;
}

export interface GetUsersParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
  role?: string;
  isActive?: boolean;
  isVerified?: boolean;
  search?: string;
}

export interface GetTestResultsParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
}

// Admin API
export const adminAPI = {
  // ==================== Test Management ====================
  
  // Create new test
  createTest: async (data: CreateTestRequest): Promise<TestDetailResponse> => {
    const response = await api.post('/admin/tests', data);
    return response.data;
  },

  // Update existing test
  updateTest: async (id: string, data: UpdateTestRequest): Promise<TestDetailResponse> => {
    const response = await api.put(`/admin/tests/${id}`, data);
    return response.data;
  },

  // Delete test
  deleteTest: async (id: string): Promise<void> => {
    await api.delete(`/admin/tests/${id}`);
  },

  // Publish test
  publishTest: async (id: string): Promise<TestDetailResponse> => {
    const response = await api.post(`/admin/tests/${id}/publish`);
    return response.data;
  },

  // Get all tests (including drafts)
  getAllTests: async (params?: GetAdminTestsParams): Promise<{ content: TestResponse[]; totalPages: number; totalElements: number; number: number; size: number; last: boolean }> => {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortDir) queryParams.append('sortDir', params.sortDir);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.isPremium !== undefined) queryParams.append('isPremium', params.isPremium.toString());

    const response = await api.get(`/admin/tests?${queryParams.toString()}`);
    return response.data;
  },

  // Alias for getAllTests (for consistency)
  getAdminTests: async (params?: GetAdminTestsParams): Promise<{ content: TestResponse[]; totalPages: number; totalElements: number; number: number; size: number; last: boolean }> => {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortDir) queryParams.append('sortDir', params.sortDir);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.isPremium !== undefined) queryParams.append('isPremium', params.isPremium.toString());

    const response = await api.get(`/admin/tests?${queryParams.toString()}`);
    return response.data;
  },

  // Get test details (admin view)
  getTestById: async (id: string): Promise<TestDetailResponse> => {
    const response = await api.get(`/admin/tests/${id}`);
    return response.data;
  },

  // Alias for getTestById (for consistency)
  getAdminTestById: async (id: string): Promise<TestDetailResponse> => {
    const response = await api.get(`/admin/tests/${id}`);
    return response.data;
  },

  // Upload question image
  uploadQuestionImage: async (questionId: string, file: FormData): Promise<{ imageUrl: string }> => {
    const response = await api.post(`/admin/tests/questions/${questionId}/image`, file, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Accept': 'application/json',
      },
      timeout: 30000,
    });
    return response.data;
  },

  // Delete question image
  deleteQuestionImage: async (questionId: string): Promise<void> => {
    await api.delete(`/admin/tests/questions/${questionId}/image`);
  },

  // Get test results (all attempts for a test)
  getTestResults: async (testId: string, params?: GetTestResultsParams): Promise<{ content: TestAttemptAdminResponse[]; totalPages: number; totalElements: number; number: number; size: number; last: boolean }> => {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortDir) queryParams.append('sortDir', params.sortDir);

    const response = await api.get(`/admin/tests/${testId}/results?${queryParams.toString()}`);
    return response.data;
  },

  // ==================== User Management ====================
  
  // Get all users
  getUsers: async (params?: GetUsersParams): Promise<{ content: AdminUserResponse[]; totalPages: number; totalElements: number; number: number; size: number; last: boolean }> => {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortDir) queryParams.append('sortDir', params.sortDir);
    if (params?.role) queryParams.append('role', params.role);
    if (params?.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());
    if (params?.isVerified !== undefined) queryParams.append('isVerified', params.isVerified.toString());
    if (params?.search) queryParams.append('search', params.search);

    const response = await api.get(`/admin/users?${queryParams.toString()}`);
    return response.data;
  },

  // Get user by ID
  getUserById: async (id: string): Promise<AdminUserResponse> => {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  // Create new user
  createUser: async (data: CreateUserRequest): Promise<AdminUserResponse> => {
    const response = await api.post('/admin/users', data);
    return response.data;
  },

  // Update user
  updateUser: async (id: string, data: UpdateUserRequest): Promise<AdminUserResponse> => {
    const response = await api.put(`/admin/users/${id}`, data);
    return response.data;
  },

  // Delete user
  deleteUser: async (id: string): Promise<void> => {
    await api.delete(`/admin/users/${id}`);
  },

  // ==================== Dashboard ====================
  
  // Get dashboard statistics
  getDashboardStats: async (): Promise<DashboardStatsResponse> => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },
};

