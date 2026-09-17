import axios from "axios";
import type {
  AuthResponse,
  User,
  Conference,
  Track,
  Manuscript,
  Reviewer,
  Conflict,
  SimulationResponse,
  AssignmentExplanation,
  BenchmarkComparisonResponse,
  ScalabilitySweepResponse,
  DashboardStats,
  AuditLog,
  AlgorithmType,
} from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api/v1";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to attach JWT token and user role
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("allocflow_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const savedUser = localStorage.getItem("allocflow_user");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed?.role) {
          config.headers["x-user-role"] = parsed.role;
        }
      } catch (e) {}
    }
  }
  return config;
});

// Response interceptor to catch 401s
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      // Clear token if expired or unauthorized
      if (!window.location.pathname.startsWith("/login")) {
        localStorage.removeItem("allocflow_token");
        localStorage.removeItem("allocflow_user");
      }
    }
    return Promise.reject(error);
  }
);

export const api = {
  // Auth
  login: async (email: string, password: string):Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>("/auth/login", { email, password });
    return res.data;
  },
  register: async (payload: { email: string; password: string; fullName: string; affiliation?: string; role?: string }): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>("/auth/register", payload);
    return res.data;
  },
  getCurrentUser: async (): Promise<User> => {
    const res = await apiClient.get<User>("/auth/me");
    return res.data;
  },

  // Conferences
  getConferences: async (): Promise<Conference[]> => {
    const res = await apiClient.get<Conference[]>("/conferences");
    return res.data;
  },
  getConference: async (id: string): Promise<Conference> => {
    const res = await apiClient.get<Conference>(`/conferences/${id}`);
    return res.data;
  },
  createConference: async (payload: any): Promise<Conference> => {
    const res = await apiClient.post<Conference>("/conferences", payload);
    return res.data;
  },
  getTracks: async (conferenceId: string): Promise<Track[]> => {
    const res = await apiClient.get<Track[]>(`/conferences/${conferenceId}/tracks`);
    return res.data;
  },

  // Manuscripts
  getManuscripts: async (conferenceId?: string): Promise<Manuscript[]> => {
    const res = await apiClient.get<Manuscript[]>("/manuscripts", {
      params: conferenceId ? { conferenceId } : {},
    });
    return res.data;
  },
  getManuscript: async (id: string): Promise<Manuscript> => {
    const res = await apiClient.get<Manuscript>(`/manuscripts/${id}`);
    return res.data;
  },
  createManuscript: async (payload: any): Promise<Manuscript> => {
    const res = await apiClient.post<Manuscript>("/manuscripts", payload);
    return res.data;
  },
  updateManuscriptStatus: async (id: string, status: string): Promise<Manuscript> => {
    const res = await apiClient.patch<Manuscript>(`/manuscripts/${id}/status`, { status });
    return res.data;
  },

  // Reviewers
  getReviewers: async (conferenceId?: string): Promise<Reviewer[]> => {
    const res = await apiClient.get<Reviewer[]>("/reviewers", {
      params: conferenceId ? { conferenceId } : {},
    });
    return res.data;
  },
  getReviewer: async (id: string): Promise<Reviewer> => {
    const res = await apiClient.get<Reviewer>(`/reviewers/${id}`);
    return res.data;
  },
  createReviewer: async (payload: any): Promise<Reviewer> => {
    const res = await apiClient.post<Reviewer>("/reviewers", payload);
    return res.data;
  },

  // Conflicts
  getConflicts: async (conferenceId?: string): Promise<Conflict[]> => {
    const res = await apiClient.get<Conflict[]>("/conflicts", {
      params: conferenceId ? { conferenceId } : {},
    });
    return res.data;
  },
  createConflict: async (payload: any): Promise<Conflict> => {
    const res = await apiClient.post<Conflict>("/conflicts", payload);
    return res.data;
  },
  deleteConflict: async (id: string): Promise<void> => {
    await apiClient.delete(`/conflicts/${id}`);
  },

  // Matching Engine
  simulateMatching: async (payload: {
    conferenceId: string;
    algorithm: AlgorithmType;
    requiredReviewsPerPaper?: number;
    defaultReviewerCapacity?: number;
    excludeConflicts?: boolean;
  }): Promise<SimulationResponse> => {
    const res = await apiClient.post<SimulationResponse>("/matching/simulate", payload);
    return res.data;
  },
  commitMatching: async (runId: string, notes?: string): Promise<any> => {
    const res = await apiClient.post(`/matching/commit/${runId}`, { notes });
    return res.data;
  },
  overrideMatching: async (payload: {
    conferenceId: string;
    manuscriptId: string;
    reviewerId: string;
    overrideReason?: string;
  }): Promise<any> => {
    const res = await apiClient.post("/matching/override", payload);
    return res.data;
  },
  explainAssignment: async (manuscriptId: string, reviewerId: string, runId?: string): Promise<AssignmentExplanation> => {
    const res = await apiClient.get<AssignmentExplanation>("/matching/explain", {
      params: { manuscriptId, reviewerId, runId },
    });
    return res.data;
  },

  // Benchmarks & Research
  runComparison: async (payload: {
    manuscriptCount: number;
    reviewerCount: number;
    requiredReviewsPerPaper?: number;
    reviewerCapacity?: number;
    eligibilityProbability?: number;
    conflictProbability?: number;
    topicCount?: number;
    randomSeed?: number;
    warmupTrials?: number;
    measuredTrials?: number;
  }): Promise<BenchmarkComparisonResponse> => {
    const res = await apiClient.post<BenchmarkComparisonResponse>("/benchmarks/compare", payload);
    return res.data;
  },
  runScalability: async (payload: {
    startManuscripts?: number;
    endManuscripts?: number;
    stepSize?: number;
    reviewerRatio?: number;
    warmupTrials?: number;
    measuredTrials?: number;
    seed?: number;
  }): Promise<ScalabilitySweepResponse> => {
    const res = await apiClient.post<ScalabilitySweepResponse>("/benchmarks/scalability", payload);
    return res.data;
  },
  getBenchmarkHistory: async (): Promise<any[]> => {
    const res = await apiClient.get<any[]>("/benchmarks/history");
    return res.data;
  },

  // Analytics & Audit
  getDashboardStats: async (conferenceId?: string): Promise<DashboardStats> => {
    const res = await apiClient.get<DashboardStats>("/analytics/dashboard", {
      params: conferenceId ? { conferenceId } : {},
    });
    return res.data;
  },
  getAuditLogs: async (page = 0, size = 20): Promise<{ content: AuditLog[]; totalElements: number; totalPages: number }> => {
    const res = await apiClient.get("/audit-logs", { params: { page, size } });
    return res.data;
  },
  getRecentAuditLogs: async (): Promise<AuditLog[]> => {
    const res = await apiClient.get<AuditLog[]>("/audit-logs/recent");
    return res.data;
  },
};
