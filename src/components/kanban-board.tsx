"use client";

import { Task, TaskStatus } from "@/types/database";
import { TaskCard } from "@/components/task-card";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";

const columns: { id: TaskStatus; label: string; color: string }[] = [
  { id: "todo", label: "To Do", color: "border-t-blue-500" },
  { id: "in_progress", label: "In Progress", color: "border-t-amber-500" },
  { id: "done", label: "Done", color: "border-t-green-500" },
];

interface KanbanBoardProps {
  tasks: Task[];
  filters?: {
    assigneeId?: string;
  };
}

export function KanbanBoard({ tasks, filters }: KanbanBoardProps) {
  const utils = trpc.useUtils();
  const updateTask = trpc.tasks.update.useMutation({
    onSuccess: () => {
      utils.tasks.list.invalidate();
      utils.tasks.stats.invalidate();
    },
  });

  let filteredTasks = tasks;
  if (filters?.assigneeId) {
    filteredTasks = tasks.filter((t) => t.assignee_id === filters.assigneeId);
  }

  function handleDrop(taskId: string, newStatus: TaskStatus) {
    updateTask.mutate({ id: taskId, status: newStatus });
  }

  return (
    <div className="grid grid-cols-3 gap-4 h-full">
      {columns.map((column) => {
        const columnTasks = filteredTasks
          .filter((t) => t.status === column.id)
          .sort((a, b) => b.priority_score - a.priority_score);

        return (
          <div
            key={column.id}
            className={cn(
              "flex flex-col rounded-lg border border-border bg-card/50 border-t-2",
              column.color
            )}
            onDragOver={(e) => {
              e.preventDefault();
              e.currentTarget.classList.add("bg-accent/30");
            }}
            onDragLeave={(e) => {
              e.currentTarget.classList.remove("bg-accent/30");
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.classList.remove("bg-accent/30");
              const taskId = e.dataTransfer.getData("taskId");
              if (taskId) handleDrop(taskId, column.id);
            }}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <h3 className="text-sm font-semibold">{column.label}</h3>
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs text-muted-foreground">
                {columnTasks.length}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-thin">
              {columnTasks.map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("taskId", task.id);
                    e.currentTarget.classList.add("opacity-50");
                  }}
                  onDragEnd={(e) => {
                    e.currentTarget.classList.remove("opacity-50");
                  }}
                >
                  <TaskCard task={task} />
                </div>
              ))}

              {columnTasks.length === 0 && (
                <div className="flex items-center justify-center h-24 text-sm text-muted-foreground">
                  No tasks
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
