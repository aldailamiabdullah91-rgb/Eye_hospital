"use client";

import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TaskCard } from "@/components/task-card";
import {
  Mail,
  Sun,
  AlertTriangle,
  Calendar,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { getInitials, formatRelativeDate } from "@/lib/utils";

export default function DigestPage() {
  const tasks = trpc.tasks.list.useQuery({ teamId: "team-1", sort: "priority" });
  const users = trpc.users.list.useQuery({ teamId: "team-1" });
  if (tasks.isLoading || users.isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const allTasks = tasks.data || [];
  const now = new Date();

  const topPriorities = allTasks
    .filter((t) => t.status !== "done")
    .slice(0, 3);

  const blockers = allTasks.filter(
    (t) =>
      t.status !== "done" &&
      allTasks.some((other) => other.parent_task_id === t.id && other.status !== "done")
  );

  const upcomingDeadlines = allTasks
    .filter((t) => {
      if (!t.due_date || t.status === "done") return false;
      const due = new Date(t.due_date);
      const diff = due.getTime() - now.getTime();
      return diff > 0 && diff < 48 * 60 * 60 * 1000;
    })
    .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime());

  const overdue = allTasks.filter(
    (t) => t.due_date && new Date(t.due_date) < now && t.status !== "done"
  );

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="rounded-lg bg-amber-500/10 p-2">
          <Sun className="h-5 w-5 text-amber-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Daily Digest</h1>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      <Card className="border-amber-500/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-amber-500" />
            Top 3 Priorities Today
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {topPriorities.map((task, i) => (
            <div key={task.id} className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-xs font-bold text-amber-500">
                {i + 1}
              </span>
              <div className="flex-1">
                <TaskCard task={task} compact />
              </div>
            </div>
          ))}
          {topPriorities.length === 0 && (
            <p className="text-sm text-muted-foreground">No active tasks. Great job!</p>
          )}
        </CardContent>
      </Card>

      {overdue.length > 0 && (
        <Card className="border-red-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2 text-red-500">
              <AlertTriangle className="h-4 w-4" />
              Overdue Tasks ({overdue.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {overdue.map((task) => (
              <TaskCard key={task.id} task={task} compact />
            ))}
          </CardContent>
        </Card>
      )}

      {upcomingDeadlines.length > 0 && (
        <Card className="border-blue-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-500" />
              Upcoming Deadlines (48h)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {upcomingDeadlines.map((task) => (
              <div key={task.id} className="flex items-center gap-2">
                <Badge variant="outline" className="shrink-0 text-xs">
                  {formatRelativeDate(task.due_date!)}
                </Badge>
                <TaskCard task={task} compact />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {blockers.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Blocking Tasks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {blockers.map((task) => (
              <TaskCard key={task.id} task={task} compact />
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Team Activity Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {users.data?.map((user) => {
              const userTasks = allTasks.filter((t) => t.assignee_id === user.id && t.status !== "done");
              const userDone = allTasks.filter((t) => t.assignee_id === user.id && t.status === "done");
              return (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-[10px]">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{user.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{userTasks.length} active</span>
                    <span className="text-green-500">{userDone.length} done</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
