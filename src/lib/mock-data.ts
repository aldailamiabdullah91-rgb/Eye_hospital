import { Task, Team, User, PriorityLog, Integration } from "@/types/database";

const TEAM_ID = "team-1";

export const mockTeam: Team = {
  id: TEAM_ID,
  name: "TaskFlow Team",
  slack_workspace_id: null,
  created_at: "2025-01-01T00:00:00Z",
};

export const mockUsers: User[] = [
  {
    id: "user-1",
    email: "alex@taskflow.dev",
    name: "Alex Chen",
    team_id: TEAM_ID,
    slack_user_id: null,
    timezone: "America/New_York",
    role: "admin",
    avatar_url: null,
    created_at: "2025-01-01T00:00:00Z",
  },
  {
    id: "user-2",
    email: "sarah@taskflow.dev",
    name: "Sarah Miller",
    team_id: TEAM_ID,
    slack_user_id: null,
    timezone: "America/Los_Angeles",
    role: "member",
    avatar_url: null,
    created_at: "2025-01-02T00:00:00Z",
  },
  {
    id: "user-3",
    email: "marcus@taskflow.dev",
    name: "Marcus Johnson",
    team_id: TEAM_ID,
    slack_user_id: null,
    timezone: "Europe/Berlin",
    role: "member",
    avatar_url: null,
    created_at: "2025-01-03T00:00:00Z",
  },
  {
    id: "user-4",
    email: "priya@taskflow.dev",
    name: "Priya Patel",
    team_id: TEAM_ID,
    slack_user_id: null,
    timezone: "Asia/Kolkata",
    role: "member",
    avatar_url: null,
    created_at: "2025-01-04T00:00:00Z",
  },
];

const now = new Date();
const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
const dayAfterTomorrow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

export const mockTasks: Task[] = [
  {
    id: "task-1",
    title: "Fix authentication token refresh bug",
    description: "Users are getting logged out after 30 minutes. The refresh token logic in the auth middleware is not correctly handling expired tokens. Need to update the token refresh flow to silently refresh before expiration.",
    assignee_id: "user-2",
    creator_id: "user-1",
    team_id: TEAM_ID,
    priority_score: 92,
    status: "in_progress",
    due_date: tomorrow.toISOString(),
    created_from: "web",
    parent_task_id: null,
    tags: ["bug", "auth", "critical"],
    created_at: yesterday.toISOString(),
    updated_at: now.toISOString(),
    assignee: mockUsers[1],
    creator: mockUsers[0],
  },
  {
    id: "task-2",
    title: "Design system component library audit",
    description: "Review all existing components against the new design system spec. Document inconsistencies and create tickets for updates.",
    assignee_id: "user-4",
    creator_id: "user-1",
    team_id: TEAM_ID,
    priority_score: 65,
    status: "todo",
    due_date: nextWeek.toISOString(),
    created_from: "web",
    parent_task_id: null,
    tags: ["design", "audit"],
    created_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: now.toISOString(),
    assignee: mockUsers[3],
    creator: mockUsers[0],
  },
  {
    id: "task-3",
    title: "Implement Slack webhook handler",
    description: "Set up the webhook endpoint to receive Slack events. Handle message reactions, thread replies, and slash commands for task creation.",
    assignee_id: "user-3",
    creator_id: "user-1",
    team_id: TEAM_ID,
    priority_score: 78,
    status: "todo",
    due_date: dayAfterTomorrow.toISOString(),
    created_from: "web",
    parent_task_id: null,
    tags: ["feature", "slack", "integration"],
    created_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: now.toISOString(),
    assignee: mockUsers[2],
    creator: mockUsers[0],
  },
  {
    id: "task-4",
    title: "Database migration for priority_logs table",
    description: "Create the priority_logs table to track historical priority changes. Include task_id, score, factors_json, and computed_at columns.",
    assignee_id: "user-2",
    creator_id: "user-3",
    team_id: TEAM_ID,
    priority_score: 85,
    status: "todo",
    due_date: tomorrow.toISOString(),
    created_from: "slack",
    parent_task_id: "task-3",
    tags: ["backend", "database"],
    created_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: now.toISOString(),
    assignee: mockUsers[1],
    creator: mockUsers[2],
  },
  {
    id: "task-5",
    title: "Write E2E tests for task creation flow",
    description: "Cover the complete task creation flow including natural language parsing, priority scoring, and Slack notification.",
    assignee_id: "user-4",
    creator_id: "user-2",
    team_id: TEAM_ID,
    priority_score: 45,
    status: "todo",
    due_date: nextWeek.toISOString(),
    created_from: "web",
    parent_task_id: null,
    tags: ["testing", "e2e"],
    created_at: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: now.toISOString(),
    assignee: mockUsers[3],
    creator: mockUsers[1],
  },
  {
    id: "task-6",
    title: "Set up CI/CD pipeline",
    description: "Configure GitHub Actions for automated testing, linting, and deployment to Vercel preview environments.",
    assignee_id: "user-3",
    creator_id: "user-1",
    team_id: TEAM_ID,
    priority_score: 55,
    status: "done",
    due_date: yesterday.toISOString(),
    created_from: "web",
    parent_task_id: null,
    tags: ["devops", "ci-cd"],
    created_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: yesterday.toISOString(),
    assignee: mockUsers[2],
    creator: mockUsers[0],
  },
  {
    id: "task-7",
    title: "API rate limiting implementation",
    description: "Add rate limiting to all public API endpoints. Use sliding window algorithm with Redis for distributed rate limiting.",
    assignee_id: "user-2",
    creator_id: "user-1",
    team_id: TEAM_ID,
    priority_score: 70,
    status: "in_progress",
    due_date: dayAfterTomorrow.toISOString(),
    created_from: "web",
    parent_task_id: null,
    tags: ["backend", "security"],
    created_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: now.toISOString(),
    assignee: mockUsers[1],
    creator: mockUsers[0],
  },
  {
    id: "task-8",
    title: "User onboarding flow",
    description: "Create the step-by-step onboarding experience for new teams. Include team creation, member invites, and Slack connection.",
    assignee_id: "user-4",
    creator_id: "user-1",
    team_id: TEAM_ID,
    priority_score: 40,
    status: "todo",
    due_date: nextWeek.toISOString(),
    created_from: "web",
    parent_task_id: null,
    tags: ["feature", "onboarding", "ux"],
    created_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: now.toISOString(),
    assignee: mockUsers[3],
    creator: mockUsers[0],
  },
  {
    id: "task-9",
    title: "Performance audit - dashboard load time",
    description: "Profile and optimize the dashboard to achieve <800ms load time on 3G. Focus on bundle size, lazy loading, and data fetching.",
    assignee_id: "user-3",
    creator_id: "user-2",
    team_id: TEAM_ID,
    priority_score: 58,
    status: "done",
    due_date: yesterday.toISOString(),
    created_from: "web",
    parent_task_id: null,
    tags: ["performance", "optimization"],
    created_at: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    assignee: mockUsers[2],
    creator: mockUsers[1],
  },
  {
    id: "task-10",
    title: "Daily digest email template",
    description: "Design and implement the daily digest notification template. Should include top 3 priorities, blockers, and upcoming deadlines for each team member.",
    assignee_id: "user-4",
    creator_id: "user-1",
    team_id: TEAM_ID,
    priority_score: 72,
    status: "in_progress",
    due_date: dayAfterTomorrow.toISOString(),
    created_from: "slack",
    parent_task_id: null,
    tags: ["feature", "notifications"],
    created_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: now.toISOString(),
    assignee: mockUsers[3],
    creator: mockUsers[0],
  },
];

export const mockPriorityLogs: PriorityLog[] = mockTasks.map((task) => ({
  id: `pl-${task.id}`,
  task_id: task.id,
  score: task.priority_score,
  factors_json: {
    urgency: Math.round(Math.random() * 40 + 40),
    impact: Math.round(Math.random() * 40 + 30),
    dependency_depth: Math.floor(Math.random() * 3),
    staleness: Math.round(Math.random() * 30),
    override: null,
    reasoning: "Priority computed based on deadline proximity, impact assessment, and dependency analysis.",
  },
  computed_at: now.toISOString(),
}));

export const mockIntegrations: Integration[] = [];

// In-memory store for mutations
let taskStore = [...mockTasks];

export function getTaskStore(): Task[] {
  return taskStore;
}

export function setTaskStore(tasks: Task[]): void {
  taskStore = tasks;
}

export function addTask(task: Task): void {
  taskStore.push(task);
}

export function updateTask(id: string, updates: Partial<Task>): Task | null {
  const index = taskStore.findIndex((t) => t.id === id);
  if (index === -1) return null;
  taskStore[index] = { ...taskStore[index], ...updates, updated_at: new Date().toISOString() };
  return taskStore[index];
}

export function deleteTask(id: string): boolean {
  const index = taskStore.findIndex((t) => t.id === id);
  if (index === -1) return false;
  taskStore.splice(index, 1);
  return true;
}
