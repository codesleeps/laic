import axios from "axios";
import useSWR, { mutate } from "swr";
import type { 
  Project, 
  DashboardStats, 
  Recommendation,
  WasteCategory,
  NotificationSettings,
  ScheduledReport,
  NotificationLog,
  CalendarEvent,
  LastPlannerTask,
  KaizenEvent,
  Subcontractor,
  ProjectSubcontractor,
} from "@/shared/models/lean-construction";

export const apiClient = axios.create({
  baseURL: "/api",
});

const fetcher = <T>(url: string) => apiClient.get<T>(url).then((res) => res.data);

// Dashboard Stats
export function useDashboardStats() {
  return useSWR<DashboardStats, Error>('/dashboard/stats', fetcher);
}

// Projects
export function useProjects() {
  return useSWR<Project[], Error>('/projects', fetcher);
}

export async function createProject(project: Partial<Project>) {
  try {
    return await apiClient.post<Project>('/projects', project).then((res) => res.data);
  } finally {
    await mutate('/projects');
    await mutate('/dashboard/stats');
  }
}

export async function updateProject(id: string, project: Partial<Project>) {
  try {
    return await apiClient.put<Project>(`/projects/${id}`, project).then((res) => res.data);
  } finally {
    await mutate('/projects');
    await mutate('/dashboard/stats');
  }
}

export async function deleteProject(id: string) {
  try {
    return await apiClient.delete(`/projects/${id}`).then((res) => res.data);
  } finally {
    await mutate('/projects');
    await mutate('/dashboard/stats');
  }
}

// Waste Incidents
export interface WasteIncidentWithDetails {
  id: string;
  project_id: string;
  waste_category_id: string;
  title: string;
  description: string | null;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  estimated_cost_impact: number | null;
  estimated_time_impact: number | null;
  root_cause: string | null;
  corrective_action: string | null;
  reported_by: string | null;
  reported_at: string;
  resolved_at: string | null;
  created_at: string;
  waste_code: string;
  waste_name: string;
  waste_icon: string;
  project_name: string;
}

export function useWasteIncidents() {
  return useSWR<WasteIncidentWithDetails[], Error>('/waste-incidents', fetcher);
}

export async function createWasteIncident(incident: {
  project_id: string;
  category_id: string;
  description: string;
  severity?: string;
  cost_impact?: number;
  time_impact_hours?: number;
  root_cause?: string;
  corrective_action?: string;
  reported_by?: string;
}) {
  try {
    return await apiClient.post('/waste-incidents', incident).then((res) => res.data);
  } finally {
    await mutate('/waste-incidents');
    await mutate('/waste-summary');
    await mutate('/dashboard/stats');
  }
}

// Waste Categories
export function useWasteCategories() {
  return useSWR<WasteCategory[], Error>('/waste-categories', fetcher);
}

// Waste Summary
export interface WasteSummaryItem {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  incident_count: number;
  total_cost_impact: number;
  total_time_impact: number;
}

export function useWasteSummary() {
  return useSWR<WasteSummaryItem[], Error>('/waste-summary', fetcher);
}

// Recommendations
export interface RecommendationWithProject extends Recommendation {
  project_name: string;
}

export function useRecommendations() {
  return useSWR<RecommendationWithProject[], Error>('/recommendations', fetcher);
}

export async function updateRecommendationStatus(id: string, status: string) {
  try {
    return await apiClient.patch('/recommendations', { id, status }).then((res) => res.data);
  } finally {
    await mutate('/recommendations');
    await mutate('/dashboard/stats');
  }
}

// Health Metrics
export interface HealthMetricWithProject {
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
  project_name: string;
}

export function useHealthMetrics(projectId?: string, days?: number) {
  const params = new URLSearchParams();
  if (projectId) params.set('projectId', projectId);
  if (days) params.set('days', days.toString());
  const queryString = params.toString();
  const url = `/health-metrics${queryString ? `?${queryString}` : ''}`;
  
  return useSWR<HealthMetricWithProject[], Error>(url, fetcher);
}

// ============================================
// NOTIFICATIONS & COMMUNICATION
// ============================================

export function useNotificationSettings(userId?: string) {
  const url = userId ? `/notifications?type=settings&userId=${userId}` : '/notifications?type=settings';
  return useSWR<NotificationSettings[], Error>(url, fetcher);
}

export function useNotificationLogs(userId?: string) {
  const url = userId ? `/notifications?type=logs&userId=${userId}` : '/notifications?type=logs';
  return useSWR<NotificationLog[], Error>(url, fetcher);
}

export function useScheduledReports(userId?: string) {
  const url = userId ? `/notifications?type=scheduled&userId=${userId}` : '/notifications?type=scheduled';
  return useSWR<(ScheduledReport & { project_name?: string })[], Error>(url, fetcher);
}

export async function saveNotificationSettings(settings: Partial<NotificationSettings>) {
  try {
    return await apiClient.post('/notifications', { type: 'settings', ...settings }).then((res) => res.data);
  } finally {
    await mutate((key: string) => key.startsWith('/notifications'));
  }
}

export async function createScheduledReport(report: Partial<ScheduledReport>) {
  try {
    return await apiClient.post('/notifications', { type: 'scheduled_report', ...report }).then((res) => res.data);
  } finally {
    await mutate((key: string) => key.startsWith('/notifications'));
  }
}

export async function deleteScheduledReport(id: string) {
  try {
    return await apiClient.delete(`/notifications?id=${id}`).then((res) => res.data);
  } finally {
    await mutate((key: string) => key.startsWith('/notifications'));
  }
}

export async function sendNotification(notification: {
  type: 'email' | 'slack' | 'teams';
  channel?: string;
  recipients: string[];
  subject?: string;
  content?: string;
  html_content?: string;
  user_id?: string;
  project_id?: string;
  metadata?: Record<string, unknown>;
}) {
  return await apiClient.post('/send-notification', notification).then((res) => res.data);
}

// ============================================
// CALENDAR & EVENTS
// ============================================

export function useCalendarEvents(projectId?: string, startDate?: string, endDate?: string) {
  const params = new URLSearchParams();
  if (projectId) params.set('projectId', projectId);
  if (startDate) params.set('startDate', startDate);
  if (endDate) params.set('endDate', endDate);
  const queryString = params.toString();
  const url = `/calendar${queryString ? `?${queryString}` : ''}`;
  
  return useSWR<(CalendarEvent & { project_name?: string })[], Error>(url, fetcher);
}

export async function createCalendarEvent(event: Partial<CalendarEvent>) {
  try {
    return await apiClient.post<CalendarEvent>('/calendar', event).then((res) => res.data);
  } finally {
    await mutate((key: string) => key.startsWith('/calendar'));
  }
}

export async function updateCalendarEvent(id: string, updates: Partial<CalendarEvent>) {
  try {
    return await apiClient.put<CalendarEvent>('/calendar', { id, ...updates }).then((res) => res.data);
  } finally {
    await mutate((key: string) => key.startsWith('/calendar'));
  }
}

export async function deleteCalendarEvent(id: string) {
  try {
    return await apiClient.delete(`/calendar?id=${id}`).then((res) => res.data);
  } finally {
    await mutate((key: string) => key.startsWith('/calendar'));
  }
}

// ============================================
// LAST PLANNER TASKS
// ============================================

export interface TaskWithDetails extends LastPlannerTask {
  project_name?: string;
  milestone_name?: string;
  assignee_name?: string;
  assignee_email?: string;
}

export function useTasks(projectId?: string, status?: string, assignedTo?: string) {
  const params = new URLSearchParams();
  if (projectId) params.set('projectId', projectId);
  if (status) params.set('status', status);
  if (assignedTo) params.set('assignedTo', assignedTo);
  const queryString = params.toString();
  const url = `/tasks${queryString ? `?${queryString}` : ''}`;
  
  return useSWR<TaskWithDetails[], Error>(url, fetcher);
}

export async function createTask(task: Partial<LastPlannerTask>) {
  try {
    return await apiClient.post<LastPlannerTask>('/tasks', task).then((res) => res.data);
  } finally {
    await mutate((key: string) => key.startsWith('/tasks'));
  }
}

export async function updateTask(id: string, updates: Partial<LastPlannerTask>) {
  try {
    return await apiClient.put<LastPlannerTask>('/tasks', { id, ...updates }).then((res) => res.data);
  } finally {
    await mutate((key: string) => key.startsWith('/tasks'));
  }
}

export async function deleteTask(id: string) {
  try {
    return await apiClient.delete(`/tasks?id=${id}`).then((res) => res.data);
  } finally {
    await mutate((key: string) => key.startsWith('/tasks'));
  }
}

// ============================================
// KAIZEN EVENTS
// ============================================

export interface KaizenEventWithProject extends KaizenEvent {
  project_name?: string;
}

export function useKaizenEvents(projectId?: string, status?: string) {
  const params = new URLSearchParams();
  if (projectId) params.set('projectId', projectId);
  if (status) params.set('status', status);
  const queryString = params.toString();
  const url = `/kaizen${queryString ? `?${queryString}` : ''}`;
  
  return useSWR<KaizenEventWithProject[], Error>(url, fetcher);
}

export async function createKaizenEvent(event: Partial<KaizenEvent>) {
  try {
    return await apiClient.post<KaizenEvent>('/kaizen', event).then((res) => res.data);
  } finally {
    await mutate((key: string) => key.startsWith('/kaizen'));
  }
}

export async function updateKaizenEvent(id: string, updates: Partial<KaizenEvent>) {
  try {
    return await apiClient.put<KaizenEvent>('/kaizen', { id, ...updates }).then((res) => res.data);
  } finally {
    await mutate((key: string) => key.startsWith('/kaizen'));
  }
}

export async function deleteKaizenEvent(id: string) {
  try {
    return await apiClient.delete(`/kaizen?id=${id}`).then((res) => res.data);
  } finally {
    await mutate((key: string) => key.startsWith('/kaizen'));
  }
}

// ============================================
// SUBCONTRACTORS
// ============================================

export interface SubcontractorWithProject extends Subcontractor {
  role?: string;
  contract_value?: number;
  start_date?: string;
  end_date?: string;
  performance_rating?: number;
  waste_incidents_count?: number;
  project_name?: string;
}

export function useSubcontractors(projectId?: string) {
  const url = projectId ? `/subcontractors?projectId=${projectId}` : '/subcontractors';
  return useSWR<SubcontractorWithProject[], Error>(url, fetcher);
}

export async function createSubcontractor(subcontractor: Partial<Subcontractor>) {
  try {
    return await apiClient.post<Subcontractor>('/subcontractors', subcontractor).then((res) => res.data);
  } finally {
    await mutate((key: string) => key.startsWith('/subcontractors'));
  }
}

export async function assignSubcontractorToProject(data: Partial<ProjectSubcontractor>) {
  try {
    return await apiClient.post('/subcontractors', { type: 'assign', ...data }).then((res) => res.data);
  } finally {
    await mutate((key: string) => key.startsWith('/subcontractors'));
  }
}

export async function updateSubcontractor(id: string, updates: Partial<Subcontractor>) {
  try {
    return await apiClient.put<Subcontractor>('/subcontractors', { id, ...updates }).then((res) => res.data);
  } finally {
    await mutate((key: string) => key.startsWith('/subcontractors'));
  }
}

export async function deleteSubcontractor(id: string, projectId?: string) {
  try {
    const url = projectId ? `/subcontractors?id=${id}&projectId=${projectId}` : `/subcontractors?id=${id}`;
    return await apiClient.delete(url).then((res) => res.data);
  } finally {
    await mutate((key: string) => key.startsWith('/subcontractors'));
  }
}

// ============================================
// TEAM MEMBERS
// ============================================

export interface TeamMemberData {
  id: string;
  name: string;
  email: string | null;
  role: string | null;
  department: string | null;
  skills: string[] | null;
  created_at: string;
}

export function useTeamMembers() {
  return useSWR<TeamMemberData[], Error>('/team', fetcher);
}

export async function createTeamMember(member: Partial<TeamMemberData>) {
  try {
    return await apiClient.post<TeamMemberData>('/team', member).then((res) => res.data);
  } finally {
    await mutate('/team');
  }
}

export async function updateTeamMember(id: string, updates: Partial<TeamMemberData>) {
  try {
    return await apiClient.put<TeamMemberData>('/team', { id, ...updates }).then((res) => res.data);
  } finally {
    await mutate('/team');
  }
}

export async function deleteTeamMember(id: string) {
  try {
    return await apiClient.delete(`/team?id=${id}`).then((res) => res.data);
  } finally {
    await mutate('/team');
  }
}