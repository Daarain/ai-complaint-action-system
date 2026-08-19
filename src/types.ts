export type UserRole = 'citizen' | 'officer' | 'admin';

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: UserRole;
  created_at: string;
  avatar_url?: string;
  department_id?: string;
  badge_number?: string;
}

export type ComplaintPriority = 'low' | 'medium' | 'high' | 'critical';
export type ComplaintStatus = 'submitted' | 'assigned' | 'in_progress' | 'resolved';

export interface IssueType {
  id: string;
  name: string;
  category: string;
  default_priority: ComplaintPriority;
  department_id: string;
  icon?: string;
  description?: string;
}

export interface Location {
  id: string;
  latitude: number;
  longitude: number;
  address: string;
  ward: string;
  area: string;
}

export interface ComplaintMedia {
  id: string;
  complaint_id: string;
  media_type: 'image' | 'audio';
  file_url: string;
  ai_label?: string;
  ai_confidence?: number;
  uploaded_at: string;
}

export interface Department {
  id: string;
  name: string;
  contact_info: string;
  sla_hours: number;
  head_officer?: string;
  color?: string;
}

export interface Assignment {
  id: string;
  complaint_id: string;
  department_id: string;
  officer_id: string;
  assigned_at: string;
  due_at: string;
  team_name?: string;
  officer_name?: string;
}

export interface StatusUpdate {
  id: string;
  complaint_id: string;
  status: ComplaintStatus;
  remarks: string;
  updated_by: string;
  created_at: string;
  evidence_image_url?: string;
}

export interface AIEvent {
  id: string;
  complaint_id: string;
  model: string;
  task: string;
  input_ref: string;
  output_json: string;
  confidence: number;
  created_at: string;
}

export interface Feedback {
  id: string;
  complaint_id: string;
  rating: number; // 1 - 5
  comment: string;
  resolution_confirmed?: 'completely' | 'partially' | 'no';
  evidence_url?: string;
  created_at: string;
}

export interface SimilarReport {
  id: string;
  title: string;
  status: ComplaintStatus;
  distance_meters: number;
  created_at: string;
  address: string;
}

export interface AIStructuredResult {
  issue_type: string;
  issue_type_id: string;
  summary: string;
  severity: ComplaintPriority;
  confidence: number;
  needs_followup: boolean;
  followup_question?: string;
  location_hint?: string;
  category?: string;
  similar_reports?: SimilarReport[];
}

export interface Complaint {
  id: string;
  user_id: string;
  title: string;
  description: string;
  issue_type_id: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  location_id: string;
  ai_confidence: number;
  created_at: string;
  updated_at: string;
  needs_followup?: boolean;
  followup_question?: string;
  
  // Expanded relations
  user?: User;
  issue_type?: IssueType;
  location?: Location;
  media?: ComplaintMedia[];
  status_updates?: StatusUpdate[];
  assignment?: Assignment;
  ai_result?: AIStructuredResult;
  feedback?: Feedback;
}

export interface AdminStats {
  total: number;
  open: number;
  in_progress: number;
  resolved: number;
  critical: number;
  sla_breaches: number;
  avg_resolution_hours: number;
  weekly_trend?: {
    day: string;
    submitted: number;
    resolved: number;
  }[];
}

export interface HeatmapPoint {
  id: string;
  latitude: number;
  longitude: number;
  issue_type: string;
  priority: ComplaintPriority;
  title: string;
  ward: string;
  status: ComplaintStatus;
  created_at: string;
}

export interface DepartmentPerformance {
  department_id: string;
  department_name: string;
  open_cases: number;
  total_resolved: number;
  avg_resolution_time: string; // e.g. "18.4 hours"
  sla_compliance_pct: number; // e.g. 94
  active_officers: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface SubmitComplaintPayload {
  text_description: string;
  image_file?: File | string;
  audio_file?: File | string;
  latitude: number;
  longitude: number;
  address?: string;
  user_id?: string;
}
