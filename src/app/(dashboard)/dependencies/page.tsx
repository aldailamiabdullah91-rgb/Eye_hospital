"use client";

import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TaskCard } from "@/components/task-card";
import { GitBranch, Loader2, Network } from "lucide-react";
import { cn, getPriorityLabel } from "@/lib/utils";
import { Task } from "@/types/database";

function DependencyNode({ task, allTasks, depth = 0 }: { task: Task; allTasks: Task[]; depth?: number }) {
  const children = allTasks.filter((t) => t.parent_task_id === task.id);
  const priorityLabel = getPriorityLabel(task.priority_score);
  const priorityVariant = priorityLabel === "P0" ? "p0" : priorityLabel === "P1" ? "p1" : "p2";

  return (
    <div className={cn("relative", depth > 0 && "ml-8")}>
      {depth > 0 && (
        <div className="absolute -left-6 top-4 w-4 border-l-2 border-b-2 border-border h-4 rounded-bl" />
      )}
      <div className="flex items-center gap-2 p-2 rounded-lg border border-border bg-card hover:border-muted-foreground/30 transition-colors mb-2">
        <Badge variant={priorityVariant} className="text-[10px] shrink-0">
          {priorityLabel}
        </Badge>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{task.title}</p>
          <p className="text-xs text-muted-foreground">
            {task.status.replace("_", " ")}
            {task.assignee && ` — ${task.assignee.name}`}
          </p>
        </div>
        {children.length > 0 && (
          <span className="text-xs text-muted-foreground shrink-0">
            {children.length} dep{children.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>
      {children.map((child) => (
        <DependencyNode key={child.id} task={child} allTasks={allTasks} depth={depth + 1} />
      ))}
    </div>
  );
}

export default function DependenciesPage() {
  const tasks = trpc.tasks.list.useQuery({ teamId: "team-1", sort: "priority" });

  if (tasks.isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const allTasks = tasks.data || [];

  const rootTasks = allTasks.filter(
    (t) => !t.parent_task_id && allTasks.some((other) => other.parent_task_id === t.id)
  );

  const standaloneTasks = allTasks.filter(
    (t) =>
      !t.parent_task_id &&
      !allTasks.some((other) => other.parent_task_id === t.id)
  );

  const blockedChains = rootTasks.filter((t) => {
    const children = allTasks.filter((c) => c.parent_task_id === t.id);
    return t.status !== "done" && children.some((c) => c.status !== "done");
  });

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="rounded-lg bg-purple-500/10 p-2">
          <Network className="h-5 w-5 text-purple-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Dependency Graph</h1>
          <p className="text-sm text-muted-foreground">
            Visualize task relationships and blocking chains
          </p>
        </div>
      </div>

      {blockedChains.length > 0 && (
        <Card className="border-amber-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2 text-amber-500">
              <GitBranch className="h-4 w-4" />
              Blocked Chains ({blockedChains.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-4">
              These parent tasks have incomplete subtasks that may be blocking progress.
            </p>
            <div className="space-y-4">
              {blockedChains.map((task) => (
                <DependencyNode key={task.id} task={task} allTasks={allTasks} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {rootTasks.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Network className="h-4 w-4 text-purple-500" />
              All Dependency Trees
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {rootTasks.map((task) => (
              <DependencyNode key={task.id} task={task} allTasks={allTasks} />
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Standalone Tasks ({standaloneTasks.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {standaloneTasks.map((task) => (
              <TaskCard key={task.id} task={task} compact />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
