// Lean Construction App Models

export interface Project {
  id: string;
  name: string;
  description: string | null;
  client_name: string | null;
  location: string | null;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  start_date: string | null;
  end_date: string | null;
  budget: number | null;
  actual_cost: number | null;
  progress_percentage: number | null;
  created_at: string;
  updated_at: string;
}

export interface WasteCategory {
  id: string;
  code: 'D' | 'O' | 'W' | 'N' | 'T' | 'I' | 'M' | 'E';
  name: string;
  description: string | null;
  icon: string | null;
}

export interface WasteIncident {
  id: string;
  project_id: string;
  waste_category_id: string;
  title: string;
  description: string | null;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  estimated_cost_impact: number | null;
  estimated_time_impact: number | null; // in hours
  root_cause: string | null;
  corrective_action: string | null;
  reported_by: string | null;
  reported_at: string;
  resolved_at: string | null;
  created_at: string;
  // Joined fields
  waste_category?: WasteCategory;
  project?: Project;
}

export interface Recommendation {
  id: string;
  project_id: string;
  category: string;
  title: string;
  description: string | null;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'accepted' | 'rejected' | 'implemented';
  potential_savings: number | null;
  potential_time_saved: number | null; // in hours
  ai_confidence: number | null; // percentage
  created_at: string;
  implemented_at: string | null;
  // Joined fields
  project?: Project;
}

export interface Milestone {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  target_date: string | null;
  actual_date: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  progress_percentage: number | null;
  created_at: string;
  // Joined fields
  project?: Project;
}

export interface FiveSAssessment {
  id: string;
  project_id: string;
  assessment_date: string;
  sort_score: number | null;
  set_in_order_score: number | null;
  shine_score: number | null;
  standardize_score: number | null;
  sustain_score: number | null;
  overall_score: number | null;
  notes: string | null;
  assessor_name: string | null;
  created_at: string;
  // Joined fields
  project?: Project;
}

export interface ProjectHealthMetrics {
  id: string;
  project_id: string;
  metric_date: string;
  schedule_health: number | null;
  budget_health: number | null;
  quality_score: number | null;
  safety_score: number | null;
  productivity_index: number | null;
  waste_index: number | null;
  overall_health_score: number | null;
  created_at: string;
  // Joined fields
  project?: Project;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string | null;
  role: string | null;
  department: string | null;
  skills: string[] | null;
  created_at: string;
}

export interface ProjectTeam {
  id: string;
  project_id: string;
  team_member_id: string;
  role_in_project: string | null;
  assigned_at: string;
  // Joined fields
  project?: Project;
  team_member?: TeamMember;
}

// Dashboard summary types
export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  totalBudget: number;
  actualSpend: number;
  openWasteIncidents: number;
  pendingRecommendations: number;
  potentialSavings: number;
  avgHealthScore: number;
}

export interface WasteSummary {
  category: WasteCategory;
  incidentCount: number;
  totalCostImpact: number;
  totalTimeImpact: number;
}

// The 8 Wastes (DOWNTIME) constants
export const WASTE_CODES = {
  D: 'Defects',
  O: 'Overproduction',
  W: 'Waiting',
  N: 'Non-utilized Talent',
  T: 'Transportation',
  I: 'Inventory',
  M: 'Motion',
  E: 'Extra Processing',
} as const;

export const WASTE_DESCRIPTIONS = {
  D: 'Quality issues, rework requirements, errors in construction',
  O: 'Excess materials, early deliveries, producing more than needed',
  W: 'Idle time, delays, bottlenecks, waiting for materials or approvals',
  N: 'Underused skills, poor task allocation, not leveraging expertise',
  T: 'Unnecessary material movement, inefficient logistics',
  I: 'Excess materials on site, storage costs, material deterioration',
  M: 'Unnecessary worker movement, poor site layout, inefficient workflows',
  E: 'Over-engineering, unnecessary steps, redundant approvals',
} as const;

export const PROJECT_STATUS_COLORS = {
  planning: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  on_hold: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  completed: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
} as const;

export const SEVERITY_COLORS = {
  low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  critical: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
} as const;

export const PRIORITY_COLORS = SEVERITY_COLORS;

// ============================================
// NOTIFICATION & COMMUNICATION MODELS
// ============================================

export interface NotificationSettings {
  id: string;
  user_id: string | null;
  email_enabled: boolean;
  slack_enabled: boolean;
  teams_enabled: boolean;
  email_address: string | null;
  slack_channel: string | null;
  teams_channel: string | null;
  waste_incident_alerts: boolean;
  task_reminders: boolean;
  weekly_reports: boolean;
  daily_standups: boolean;
  created_at: string;
  updated_at: string;
}

export interface ScheduledReport {
  id: string;
  user_id: string | null;
  project_id: string | null;
  report_type: 'weekly_performance' | 'monthly_waste' | 'project_status' | '5s_scorecard';
  frequency: 'daily' | 'weekly' | 'monthly';
  day_of_week: number | null;
  day_of_month: number | null;
  time_of_day: string;
  email_recipients: string[] | null;
  slack_channels: string[] | null;
  last_sent_at: string | null;
  next_send_at: string | null;
  is_active: boolean;
  created_at: string;
  // Joined fields
  project?: Project;
}

export interface NotificationLog {
  id: string;
  user_id: string | null;
  notification_type: 'email' | 'slack' | 'teams';
  channel: 'waste_alert' | 'task_reminder' | 'weekly_report' | 'daily_standup' | 'custom';
  recipient: string;
  subject: string | null;
  content: string | null;
  status: 'pending' | 'sent' | 'failed';
  error_message: string | null;
  sent_at: string | null;
  created_at: string;
}

// ============================================
// CALENDAR & SCHEDULING MODELS
// ============================================

export interface CalendarEvent {
  id: string;
  project_id: string | null;
  title: string;
  description: string | null;
  event_type: 'task' | 'milestone' | 'kaizen' | '5s_assessment' | 'meeting';
  start_datetime: string;
  end_datetime: string | null;
  all_day: boolean;
  location: string | null;
  attendees: string[] | null;
  external_calendar_id: string | null;
  sync_status: 'local' | 'synced' | 'error';
  reminder_minutes: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  project?: Project;
}

export interface LastPlannerTask {
  id: string;
  project_id: string;
  milestone_id: string | null;
  title: string;
  description: string | null;
  assigned_to: string | null;
  status: 'planned' | 'committed' | 'in_progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'critical';
  planned_start: string | null;
  planned_end: string | null;
  actual_start: string | null;
  actual_end: string | null;
  percent_complete: number;
  blockers: string | null;
  dependencies: string[] | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  project?: Project;
  milestone?: Milestone;
  assignee?: TeamMember;
}

export interface KaizenEvent {
  id: string;
  project_id: string | null;
  title: string;
  description: string | null;
  problem_statement: string | null;
  root_cause: string | null;
  proposed_solution: string | null;
  expected_outcome: string | null;
  status: 'proposed' | 'approved' | 'in_progress' | 'completed' | 'cancelled';
  scheduled_date: string | null;
  completion_date: string | null;
  participants: string[] | null;
  before_metrics: Record<string, unknown> | null;
  after_metrics: Record<string, unknown> | null;
  lessons_learned: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined fields
  project?: Project;
}

// ============================================
// SUBCONTRACTOR MODELS
// ============================================

export interface Subcontractor {
  id: string;
  name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  specialty: string | null;
  rating: number | null;
  compliance_status: 'pending' | 'compliant' | 'non_compliant';
  insurance_expiry: string | null;
  license_number: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProjectSubcontractor {
  id: string;
  project_id: string;
  subcontractor_id: string;
  role: string | null;
  contract_value: number | null;
  start_date: string | null;
  end_date: string | null;
  performance_rating: number | null;
  waste_incidents_count: number;
  created_at: string;
  // Joined fields
  project?: Project;
  subcontractor?: Subcontractor;
}

// ============================================
// PHOTO DOCUMENTATION MODELS
// ============================================

export interface PhotoDocument {
  id: string;
  project_id: string;
  entity_type: 'waste_incident' | 'kaizen_event' | '5s_assessment';
  entity_id: string;
  photo_url: string;
  thumbnail_url: string | null;
  caption: string | null;
  photo_type: 'before' | 'after' | 'evidence' | 'progress' | null;
  taken_at: string | null;
  uploaded_by: string | null;
  created_at: string;
}

// ============================================
// USER ROLES & PERMISSIONS MODELS
// ============================================

export interface UserPermission {
  id: string;
  user_id: string;
  project_id: string;
  role: 'admin' | 'project_manager' | 'team_member' | 'viewer';
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
  can_approve: boolean;
  granted_by: string | null;
  granted_at: string;
  // Joined fields
  user?: User;
  project?: Project;
}

export interface AuditTrail {
  id: string;
  user_id: string | null;
  action: 'create' | 'update' | 'delete' | 'approve' | 'reject';
  entity_type: string;
  entity_id: string;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  // Joined fields
  user?: User;
}

// ============================================
// CONSTANTS FOR NEW FEATURES
// ============================================

export const TASK_STATUS_COLORS = {
  planned: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  committed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  blocked: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
} as const;

export const KAIZEN_STATUS_COLORS = {
  proposed: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  approved: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
} as const;

export const COMPLIANCE_STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  compliant: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  non_compliant: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
} as const;

export const EVENT_TYPE_COLORS = {
  task: 'bg-blue-500',
  milestone: 'bg-purple-500',
  kaizen: 'bg-green-500',
  '5s_assessment': 'bg-orange-500',
  meeting: 'bg-gray-500',
} as const;

export const REPORT_TYPE_LABELS = {
  weekly_performance: 'Weekly Performance Report',
  monthly_waste: 'Monthly Waste Analysis',
  project_status: 'Project Status Summary',
  '5s_scorecard': '5S Assessment Scorecard',
} as const;

// User and Authentication types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'project_manager' | 'field_engineer' | 'viewer';
  company: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface AIAnalysisSession {
  id: string;
  user_id: string | null;
  project_id: string | null;
  analysis_type: string;
  prompt: string;
  response: string | null;
  model_provider: 'openai' | 'google';
  reasoning_effort: 'low' | 'medium' | 'high';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  created_at: string;
  completed_at: string | null;
}

export interface AIGeneratedInsight {
  id: string;
  session_id: string | null;
  project_id: string | null;
  insight_type: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical' | null;
  potential_savings: number | null;
  confidence_score: number | null;
  action_items: { item: string; priority: string }[] | null;
  status: 'new' | 'acknowledged' | 'in_progress' | 'resolved' | 'dismissed';
  created_at: string;
}

export interface AIChatMessage {
  id: string;
  user_id: string | null;
  project_id: string | null;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
}

export const USER_ROLE_LABELS = {
  admin: 'Administrator',
  project_manager: 'Project Manager',
  field_engineer: 'Field Engineer',
  viewer: 'Viewer',
} as const;

export const USER_ROLE_COLORS = {
  admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  project_manager: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  field_engineer: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  viewer: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
} as const;