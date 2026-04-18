"use client";

import { Task } from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn, formatRelativeDate, getPriorityLabel, getInitials } from "@/lib/utils";
import { Calendar, GitBranch } from "lucide-react";
import Link from "next/link";

interface TaskCardProps {
  task: Task;
  compact?: boolean;
}

export function TaskCard({ task, compact = false }: TaskCardProps) {
  const priorityLabel = getPriorityLabel(task.priority_score);
  const priorityVariant = priorityLabel === "P0" ? "p0" : priorityLabel === "P1" ? "p1" : "p2";

  return (
    <Link href={`/tasks/${task.id}`}>
      <div
        className={cn(
          "group rounded-lg border border-border bg-card p-3 transition-all hover:border-muted-foreground/30 hover:shadow-md cursor-pointer",
          compact ? "p-2" : "p-3"
        )}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <h4
            className={cn(
              "font-medium leading-tight text-foreground group-hover:text-primary",
              compact ? "text-xs" : "text-sm"
            )}
          >
            {task.title}
          </h4>
          <Badge variant={priorityVariant} className="shrink-0 text-[10px]">
            {priorityLabel}
          </Badge>
        </div>

        {!compact && task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
            {task.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {task.due_date && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span
                  className={cn(
                    new Date(task.due_date) < new Date() && task.status !== "done"
                      ? "text-red-500"
                      : ""
                  )}
                >
                  {formatRelativeDate(task.due_date)}
                </span>
              </div>
            )}
            {task.parent_task_id && (
              <GitBranch className="h-3 w-3 text-muted-foreground" />
            )}
          </div>

          <div className="flex items-center gap-1">
            {task.tags?.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
              >
                {tag}
              </span>
            ))}
            {task.assignee && (
              <Avatar className="h-5 w-5 ml-1">
                <AvatarFallback className="text-[8px] bg-accent">
                  {getInitials(task.assignee.name)}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
