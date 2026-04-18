export type TaskStatus = "todo" | "in_progress" | "done";
export type UserRole = "admin" | "member";
export type TaskCreatedFrom = "web" | "slack" | "api";

export interface Team {
  id: string;
  name: string;
  slack_workspace_id: string | null;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  team_id: string | null;
  slack_user_id: string | null;
  timezone: string;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  assignee_id: string | null;
  creator_id: string;
  team_id: string;
  priority_score: number;
  status: TaskStatus;
  due_date: string | null;
  created_from: TaskCreatedFrom;
  parent_task_id: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
  assignee?: User | null;
  creator?: User;
  subtasks?: Task[];
  parent_task?: Task | null;
}

export interface PriorityLog {
  id: string;
  task_id: string;
  score: number;
  factors_json: PriorityFactors;
  computed_at: string;
}

export interface PriorityFactors {
  urgency: number;
  impact: number;
  dependency_depth: number;
  staleness: number;
  override: number | null;
  reasoning: string;
}

export interface Integration {
  id: string;
  team_id: string;
  provider: "slack" | "google_calendar";
  access_token: string;
  config_json: Record<string, unknown>;
  created_at: string;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  assignee_id?: string;
  team_id: string;
  due_date?: string;
  parent_task_id?: string;
  tags?: string[];
  natural_language?: string;
}

export interface UpdateTaskInput {
  id: string;
  title?: string;
  description?: string;
  assignee_id?: string | null;
  priority_score?: number;
  status?: TaskStatus;
  due_date?: string | null;
  parent_task_id?: string | null;
  tags?: string[];
}

export interface ParsedTask {
  title: string;
  description?: string;
  assignee_name?: string;
  due_date?: string;
  tags?: string[];
  priority_hint?: "high" | "medium" | "low";
}

export interface DigestItem {
  task: Task;
  reason: string;
}

export interface DailyDigest {
  user: User;
  date: string;
  top_priorities: DigestItem[];
  blockers: Task[];
  upcoming_deadlines: Task[];
  summary: string;
}

export interface VelocityMetrics {
  user_id: string;
  user_name: string;
  tasks_completed: number;
  tasks_created: number;
  avg_completion_time_hours: number;
  on_time_rate: number;
  period: string;
}
