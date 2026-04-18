"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Clock,
  GitBranch,
  Loader2,
  Save,
  Trash2,
  Brain,
  TrendingUp,
  AlertTriangle,
  Timer,
  Network,
} from "lucide-react";
import { cn, formatDate, formatRelativeDate, getPriorityLabel, getInitials } from "@/lib/utils";
import { TaskCard } from "@/components/task-card";

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = params.id as string;

  const task = trpc.tasks.getById.useQuery(taskId);
  const users = trpc.users.list.useQuery({ teamId: "team-1" });
  const utils = trpc.useUtils();

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const updateTask = trpc.tasks.update.useMutation({
    onSuccess: () => {
      utils.tasks.getById.invalidate(taskId);
      utils.tasks.list.invalidate();
      utils.tasks.stats.invalidate();
      setIsEditing(false);
    },
  });

  const deleteTask = trpc.tasks.delete.useMutation({
    onSuccess: () => {
      utils.tasks.list.invalidate();
      utils.tasks.stats.invalidate();
      router.push("/dashboard");
    },
  });

  if (task.isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!task.data) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-muted-foreground">Task not found</p>
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const t = task.data;
  const priorityLabel = getPriorityLabel(t.priority_score);
  const priorityVariant = priorityLabel === "P0" ? "p0" : priorityLabel === "P1" ? "p1" : "p2";

  function startEdit() {
    setEditTitle(t.title);
    setEditDescription(t.description || "");
    setIsEditing(true);
  }

  function saveEdit() {
    updateTask.mutate({
      id: taskId,
      title: editTitle,
      description: editDescription,
    });
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1" />
        <Button
          variant="destructive"
          size="sm"
          onClick={() => deleteTask.mutate(taskId)}
          disabled={deleteTask.isPending}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Delete
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-3 mb-4">
                <Badge variant={priorityVariant} className="mt-1">
                  {priorityLabel} — {t.priority_score}/100
                </Badge>
                <Badge
                  variant="outline"
                  className={cn(
                    t.status === "done"
                      ? "border-green-500/30 text-green-500"
                      : t.status === "in_progress"
                        ? "border-amber-500/30 text-amber-500"
                        : "border-blue-500/30 text-blue-500"
                  )}
                >
                  {t.status.replace("_", " ")}
                </Badge>
                {t.created_from === "slack" && (
                  <Badge variant="outline" className="border-purple-500/30 text-purple-500">
                    from Slack
                  </Badge>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-3">
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="text-xl font-bold"
                  />
                  <Textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="min-h-[120px]"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={saveEdit} disabled={updateTask.isPending}>
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div onClick={startEdit} className="cursor-pointer">
                  <h1 className="text-xl font-bold mb-3">{t.title}</h1>
                  {t.description && (
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {t.description}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2 italic">
                    Click to edit
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-2 mt-4">
                {t.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-xs text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Priority Explanation */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Brain className="h-4 w-4 text-amber-500" />
                AI Priority Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                  <TrendingUp className="h-4 w-4 text-red-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Urgency</p>
                    <p className="text-sm font-semibold">
                      {t.due_date
                        ? new Date(t.due_date) < new Date()
                          ? "Critical — Overdue"
                          : new Date(t.due_date).getTime() - new Date().getTime() < 48 * 60 * 60 * 1000
                            ? "High — Due soon"
                            : "Moderate"
                        : "Low — No deadline"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Impact</p>
                    <p className="text-sm font-semibold">
                      {t.subtasks && t.subtasks.length > 0
                        ? `Blocks ${t.subtasks.length} task(s)`
                        : "Standard impact"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                  <Timer className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Staleness</p>
                    <p className="text-sm font-semibold">
                      Created {formatDate(t.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
                  <Network className="h-4 w-4 text-purple-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Dependencies</p>
                    <p className="text-sm font-semibold">
                      {t.parent_task ? "Has parent task" : "No dependencies"}
                    </p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                This task has been scored <strong>{t.priority_score}/100</strong> based on
                deadline proximity, downstream impact, time in backlog, and dependency chain depth.
                {t.priority_score >= 80
                  ? " This is a critical priority item requiring immediate attention."
                  : t.priority_score >= 50
                    ? " This is a moderate priority item that should be addressed this week."
                    : " This is a standard priority item for regular scheduling."}
              </p>
            </CardContent>
          </Card>

          {/* Subtasks */}
          {t.subtasks && t.subtasks.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <GitBranch className="h-4 w-4" />
                  Subtasks ({t.subtasks.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {t.subtasks.map((subtask) => (
                  <TaskCard key={subtask.id} task={subtask} compact />
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Status</p>
                <Select
                  value={t.status}
                  onValueChange={(v) =>
                    updateTask.mutate({ id: taskId, status: v as "todo" | "in_progress" | "done" })
                  }
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">Assignee</p>
                <Select
                  value={t.assignee_id || "unassigned"}
                  onValueChange={(v) =>
                    updateTask.mutate({
                      id: taskId,
                      assignee_id: v === "unassigned" ? null : v,
                    })
                  }
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {users.data?.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <p className="text-xs text-muted-foreground mb-1">Due Date</p>
                {t.due_date && (
                  <p
                    className={cn(
                      "text-sm font-medium",
                      new Date(t.due_date) < new Date() && t.status !== "done"
                        ? "text-red-500"
                        : ""
                    )}
                  >
                    {formatRelativeDate(t.due_date)}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {t.due_date ? formatDate(t.due_date) : "No due date"}
                </p>
              </div>

              {t.assignee && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Assigned to</p>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-[10px]">
                        {getInitials(t.assignee.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{t.assignee.name}</span>
                  </div>
                </div>
              )}

              {t.creator && (
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Created by</p>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-[10px]">
                        {getInitials(t.creator.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{t.creator.name}</span>
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs text-muted-foreground mb-1">Created</p>
                <div className="flex items-center gap-1 text-sm">
                  <Clock className="h-3 w-3" />
                  {formatDate(t.created_at)}
                </div>
              </div>

              {t.parent_task && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Parent Task</p>
                  <TaskCard task={t.parent_task} compact />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
