import {
  AuthResponse,
  User,
  Complaint,
  SubmitComplaintPayload,
  AIEvent,
  AdminStats,
  HeatmapPoint,
  DepartmentPerformance,
  IssueType,
  Department,
  Feedback,
} from '../types';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || '';

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('civic_auth_token');
  }

  public setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('civic_auth_token', token);
    } else {
      localStorage.removeItem('civic_auth_token');
    }
  }

  public getToken(): string | null {
    if (!this.token) {
      this.token = localStorage.getItem('civic_auth_token');
    }
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...(options.headers as Record<string, string>),
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (!(options.body instanceof FormData) && options.body && typeof options.body === 'string') {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMsg = `API Error: ${response.status} ${response.statusText}`;
      try {
        const errorJson = await response.json();
        if (errorJson.error || errorJson.message) {
          errorMsg = errorJson.error || errorJson.message;
        }
      } catch {
        // ignore json parse error
      }
      throw new Error(errorMsg);
    }

    return response.json() as Promise<T>;
  }

  // ---------------------------------------------
  // AUTH
  // ---------------------------------------------
  public auth = {
    login: async (credentials: { identifier?: string; phone?: string; email?: string; password?: string }): Promise<AuthResponse> => {
      const res = await this.request<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
      if (res.token) {
        this.setToken(res.token);
      }
      return res;
    },

    register: async (data: { name: string; phone: string; email: string; role?: string }): Promise<AuthResponse> => {
      const res = await this.request<AuthResponse>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      if (res.token) {
        this.setToken(res.token);
      }
      return res;
    },

    me: async (): Promise<User> => {
      return this.request<User>('/api/auth/me');
    },

    logout: () => {
      this.setToken(null);
    },
  };

  // ---------------------------------------------
  // COMPLAINTS (Citizen Flow)
  // ---------------------------------------------
  public complaints = {
    submit: async (payload: SubmitComplaintPayload): Promise<Complaint> => {
      let image_file_data = payload.image_file;

      // If File object, convert to base64 for seamless transmission
      if (payload.image_file instanceof File) {
        image_file_data = await this.fileToBase64(payload.image_file);
      }

      let audio_file_data = payload.audio_file;
      if (payload.audio_file instanceof File) {
        audio_file_data = await this.fileToBase64(payload.audio_file);
      }

      return this.request<Complaint>('/api/complaints', {
        method: 'POST',
        body: JSON.stringify({
          text_description: payload.text_description,
          image_file: image_file_data,
          audio_file: audio_file_data,
          latitude: payload.latitude,
          longitude: payload.longitude,
          address: payload.address,
          user_id: payload.user_id,
        }),
      });
    },

    list: async (userId?: string): Promise<Complaint[]> => {
      const query = userId ? `?user_id=${encodeURIComponent(userId)}` : '';
      return this.request<Complaint[]>(`/api/complaints${query}`);
    },

    getById: async (id: string): Promise<Complaint> => {
      return this.request<Complaint>(`/api/complaints/${encodeURIComponent(id)}`);
    },

    answerFollowup: async (complaintId: string, answerText: string): Promise<Complaint> => {
      return this.request<Complaint>(`/api/complaints/${encodeURIComponent(complaintId)}/followup`, {
        method: 'POST',
        body: JSON.stringify({ answer_text: answerText }),
      });
    },

    submitFeedback: async (
      complaintId: string,
      data: { rating: number; comment: string; resolution_confirmed?: string; evidence_url?: string }
    ): Promise<{ message: string; feedback: Feedback }> => {
      return this.request<{ message: string; feedback: Feedback }>(`/api/complaints/${encodeURIComponent(complaintId)}/feedback`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
  };

  // ---------------------------------------------
  // OFFICER
  // ---------------------------------------------
  public officer = {
    getQueue: async (params?: { department_id?: string; sort?: string }): Promise<Complaint[]> => {
      const searchParams = new URLSearchParams();
      if (params?.department_id) searchParams.append('department_id', params.department_id);
      if (params?.sort) searchParams.append('sort', params.sort);
      const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
      return this.request<Complaint[]>(`/api/officer/queue${queryString}`);
    },

    updateStatus: async (
      id: string,
      data: { status: 'submitted' | 'assigned' | 'in_progress' | 'resolved'; remarks?: string; evidence_image?: string }
    ): Promise<Complaint> => {
      return this.request<Complaint>(`/api/complaints/${encodeURIComponent(id)}/status`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },

    getAIEvents: async (complaintId: string): Promise<AIEvent[]> => {
      return this.request<AIEvent[]>(`/api/complaints/${encodeURIComponent(complaintId)}/ai-events`);
    },
  };

  // ---------------------------------------------
  // ADMIN
  // ---------------------------------------------
  public admin = {
    getStats: async (): Promise<AdminStats> => {
      return this.request<AdminStats>('/api/admin/stats');
    },

    getHeatmap: async (filters?: { issue_type?: string; department?: string; date_from?: string; date_to?: string }): Promise<HeatmapPoint[]> => {
      const searchParams = new URLSearchParams();
      if (filters?.issue_type) searchParams.append('issue_type', filters.issue_type);
      if (filters?.department) searchParams.append('department', filters.department);
      if (filters?.date_from) searchParams.append('date_from', filters.date_from);
      if (filters?.date_to) searchParams.append('date_to', filters.date_to);
      const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
      return this.request<HeatmapPoint[]>(`/api/admin/complaints/heatmap${queryString}`);
    },

    getDepartmentsPerformance: async (): Promise<DepartmentPerformance[]> => {
      return this.request<DepartmentPerformance[]>('/api/admin/departments/performance');
    },
  };

  // ---------------------------------------------
  // METADATA
  // ---------------------------------------------
  public metadata = {
    getIssueTypes: async (): Promise<IssueType[]> => {
      return this.request<IssueType[]>('/api/issue-types');
    },

    getDepartments: async (): Promise<Department[]> => {
      return this.request<Department[]>('/api/departments');
    },
  };

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  }
}

export const api = new ApiService();
