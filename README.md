# TaskFlow — AI-Powered Task Management

TaskFlow is a task management platform designed for distributed remote teams of 5-50 people. It integrates with Slack for seamless task creation and uses AI to automatically prioritize work based on urgency, impact, dependencies, and team capacity.

## Features

- **AI Priority Scoring** — Composite scoring based on urgency (deadline proximity) × impact (stakeholder weight) × dependency chain depth. Transparent reasoning explains why each task is ranked.
- **Natural Language Task Creation** — Type "Fix auth bug for Sarah by Friday" and AI extracts the title, assignee, due date, and tags automatically.
- **Slack Integration** — Create tasks from Slack thread replies using ⚡ emoji reaction or `/task` command. Receive daily digests and deadline reminders via Slack DM.
- **Daily AI Digest** — Each team member gets a personalized summary at 9am local time with their top 3 priorities, blockers, and upcoming deadlines.
- **Kanban Dashboard** — Priority-sorted board (To Do / In Progress / Done) with drag-and-drop, filters by assignee, project, and priority tier.
- **Dependency Visualization** — DAG view showing task blocking relationships and chains to escalate.
- **Due Date Tracking** — Automated Slack reminders at 24h and 2h before deadline.
- **Dark Mode by Default** — Built for developers who live in terminals.
- **Keyboard-First** — `Ctrl+K` for quick task creation, full keyboard navigation.

## Tech Stack

- **Frontend:** Next.js 14 (App Router) + Tailwind CSS + shadcn/ui
- **Backend:** Next.js API Routes + tRPC for type-safe API layer
- **Database:** Supabase (Postgres + Auth + Realtime) — currently uses in-memory mock data for demo
- **AI:** Claude API for task parsing, priority scoring, and digest generation
- **Integrations:** Slack API (Events API + Web API)
- **Hosting:** Vercel (frontend) + Supabase (backend/db)

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/aldailamiabdullah91-rgb/Eye_hospital.git
cd Eye_hospital

# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local

# Start development server
npm run dev
```

### Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your values:

```env
# Supabase (required for production, mock data used for demo)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI (required for natural language parsing)
ANTHROPIC_API_KEY=your-anthropic-api-key

# Slack (required for Slack integration)
SLACK_CLIENT_ID=your-slack-client-id
SLACK_CLIENT_SECRET=your-slack-client-secret
SLACK_SIGNING_SECRET=your-slack-signing-secret
SLACK_BOT_TOKEN=your-slack-bot-token
```

> **Note:** The app works without any API keys using mock data and a built-in priority scoring algorithm. AI features (natural language parsing, digest generation) require an Anthropic API key.

## Database Schema

### Core Tables

- **teams** — `id`, `name`, `slack_workspace_id`, `created_at`
- **users** — `id`, `email`, `name`, `team_id`, `slack_user_id`, `timezone`, `role`, `avatar_url`
- **tasks** — `id`, `title`, `description`, `assignee_id`, `creator_id`, `team_id`, `priority_score`, `status`, `due_date`, `created_from`, `parent_task_id`, `tags`
- **priority_logs** — `id`, `task_id`, `score`, `factors_json`, `computed_at`
- **integrations** — `id`, `team_id`, `provider`, `access_token`, `config_json`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/tasks` | Create task (accepts natural language or structured) |
| PATCH | `/api/tasks/:id` | Update task status, assignment, priority override |
| GET | `/api/tasks?team_id=&sort=priority` | List tasks with AI-sorted priority |
| POST | `/api/slack/events` | Slack event webhook (task creation, reactions) |
| GET | `/api/digest/:userId` | Generate daily priority digest |

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Authentication pages
│   ├── (dashboard)/     # Protected dashboard pages
│   │   ├── dashboard/   # Main kanban board
│   │   ├── tasks/[id]/  # Task detail view
│   │   ├── digest/      # Daily digest view
│   │   ├── dependencies/# Dependency graph
│   │   └── settings/    # Team & notification settings
│   ├── api/
│   │   ├── trpc/        # tRPC API handler
│   │   ├── slack/       # Slack webhook endpoints
│   │   └── digest/      # Digest generation API
│   └── page.tsx         # Landing page
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── kanban-board.tsx  # Drag-and-drop kanban
│   ├── task-card.tsx     # Task card component
│   ├── create-task-dialog.tsx
│   ├── command-palette.tsx  # Ctrl+K quick create
│   └── sidebar.tsx
├── lib/
│   ├── ai.ts            # Claude API integration
│   ├── supabase.ts      # Supabase client
│   ├── trpc.ts          # tRPC client
│   ├── mock-data.ts     # Demo data store
│   └── utils.ts         # Utility functions
├── server/
│   ├── trpc.ts          # tRPC server setup
│   └── routers/         # tRPC routers
└── types/
    └── database.ts      # TypeScript types
```

## License

MIT
