import {api} from './config';

export interface TestResponse {
  id: string;
  title: string;
  description: string;
  isPremium: boolean;
  status: string;
  questionCount: number;
  totalPossibleScore: number;
  estimatedMinutes: number;
  publishedAt: string;
  questionTypeCounts: QuestionTypeCount[];
  createdAt: string;
  updatedAt: string;
}

export interface QuestionTypeCount {
  questionType: string;
  count: number;
}

export interface TestDetailResponse {
  id: string;
  title: string;
  description: string;
  isPremium: boolean;
  status: string;
  questionCount: number;
  totalPossibleScore: number;
  estimatedMinutes: number;
  publishedAt: string;
  questions: QuestionResponse[];
  questionTypeCounts: QuestionTypeCount[];
  createdAt: string;
  updatedAt: string;
}

export interface QuestionResponse {
  id: string;
  questionType: string;
  questionText: string;
  score: number;
  orderIndex: number;
  correctAnswer: string | null;
  answers: AnswerResponse[];
}

export interface AnswerResponse {
  id: string;
  answerText: string;
  isCorrect: boolean;
  orderIndex: number;
}

export interface TestAttemptResponse {
  id: string;
  testId: string;
  testTitle: string;
  totalScore: number;
  maxPossibleScore: number;
  status: string;
  startedAt: string;
  submittedAt: string | null;
}

export interface TestResultResponse {
  attemptId: string;
  testId: string;
  testTitle: string;
  totalScore: number;
  maxPossibleScore: number;
  startedAt: string;
  submittedAt: string;
  questionResults: QuestionResultResponse[];
}

export interface QuestionResultResponse {
  questionId: string;
  questionType: string;
  questionText: string;
  score: number;
  orderIndex: number;
  isCorrect: boolean;
  scoreEarned: number;
  selectedAnswerIds: string[] | null;
  openTextAnswer: string | null;
  correctAnswerIds: string[] | null;
  correctAnswer: string | null;
  allAnswers: AnswerResponse[];
}

export interface TestStatisticsResponse {
  id: string;
  title: string;
  totalParticipants: number;
}

export interface SubmitAnswerRequest {
  questionId: string;
  selectedAnswerIds?: string[];
  openTextAnswer?: string;
}

export interface SubmitTestRequest {
  answers: SubmitAnswerRequest[];
}

export interface GetTestsParams {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: string;
  status?: string;
  isPremium?: boolean;
}

export const testsAPI = {
  getTests: async (params?: GetTestsParams): Promise<{
    content: TestResponse[];
    totalPages: number;
    totalElements: number;
    number: number;
    size: number
  }> => {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortDir) queryParams.append('sortDir', params.sortDir);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.isPremium !== undefined) queryParams.append('isPremium', params.isPremium.toString());

    const response = await api.get(`/tests?${queryParams.toString()}`);
    return response.data;
  },

  getTestById: async (id: string): Promise<TestDetailResponse> => {
    const response = await api.get(`/tests/${id}`);
    return response.data;
  },

  startTest: async (id: string): Promise<TestAttemptResponse> => {
    const response = await api.post(`/tests/${id}/start`);
    return response.data;
  },

  submitTest: async (id: string, data: SubmitTestRequest): Promise<TestResultResponse> => {
    const response = await api.post(`/tests/${id}/submit`, data);
    return response.data;
  },

  getTestAttempts: async (id: string): Promise<TestAttemptResponse[]> => {
    const response = await api.get(`/tests/${id}/attempts`);
    return response.data;
  },

  getAttemptResults: async (attemptId: string): Promise<TestResultResponse> => {
    const response = await api.get(`/tests/attempts/${attemptId}`);
    return response.data;
  },

  getTestStatistics: async (id: string): Promise<TestStatisticsResponse> => {
    const response = await api.get(`/tests/${id}/statistics`);
    return response.data;
  },
};
