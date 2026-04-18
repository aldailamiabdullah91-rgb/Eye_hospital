"use client";

import { useState } from "react";
import { KanbanBoard } from "@/components/kanban-board";
import { StatsCards } from "@/components/stats-cards";
import { CreateTaskDialog } from "@/components/create-task-dialog";
import { trpc } from "@/lib/trpc";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Keyboard } from "lucide-react";

export default function DashboardPage() {
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"priority" | "due_date" | "created_at">("priority");

  const tasks = trpc.tasks.list.useQuery({ teamId: "team-1", sort: sortBy });
  const stats = trpc.tasks.stats.useQuery({ teamId: "team-1" });
  const users = trpc.users.list.useQuery({ teamId: "team-1" });

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-sm text-muted-foreground">
              AI-prioritized tasks for your team
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-md">
              <Keyboard className="h-3 w-3" />
              <kbd className="font-mono">Ctrl+K</kbd>
              <span>quick create</span>
            </div>
            <CreateTaskDialog />
          </div>
        </div>

        <StatsCards stats={stats.data} isLoading={stats.isLoading} />
      </div>

      <div className="flex items-center gap-3 px-6 py-3 border-b border-border">
        <Select
          value={assigneeFilter}
          onValueChange={setAssigneeFilter}
        >
          <SelectTrigger className="w-[180px] h-8 text-xs">
            <SelectValue placeholder="Filter by assignee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Members</SelectItem>
            {users.data?.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={sortBy}
          onValueChange={(v) => setSortBy(v as typeof sortBy)}
        >
          <SelectTrigger className="w-[160px] h-8 text-xs">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="priority">Priority (AI)</SelectItem>
            <SelectItem value="due_date">Due Date</SelectItem>
            <SelectItem value="created_at">Newest First</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 p-6 min-h-0">
        {tasks.isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : tasks.data ? (
          <KanbanBoard
            tasks={tasks.data}
            filters={{
              assigneeId: assigneeFilter === "all" ? undefined : assigneeFilter,
            }}
          />
        ) : null}
      </div>
    </div>
  );
}
