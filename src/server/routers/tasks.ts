import { z } from "zod";
import { router, publicProcedure } from "../trpc";
import {
  getTaskStore,
  addTask,
  updateTask,
  deleteTask,
  mockUsers,
} from "@/lib/mock-data";
import { Task } from "@/types/database";
import { parseNaturalLanguageTask, computePriorityScore } from "@/lib/ai";

export const tasksRouter = router({
  list: publicProcedure
    .input(
      z.object({
        teamId: z.string().optional(),
        status: z.enum(["todo", "in_progress", "done"]).optional(),
        assigneeId: z.string().optional(),
        sort: z.enum(["priority", "due_date", "created_at"]).default("priority"),
      })
    )
    .query(({ input }) => {
      let tasks = getTaskStore();

      if (input.teamId) {
        tasks = tasks.filter((t) => t.team_id === input.teamId);
      }
      if (input.status) {
        tasks = tasks.filter((t) => t.status === input.status);
      }
      if (input.assigneeId) {
        tasks = tasks.filter((t) => t.assignee_id === input.assigneeId);
      }

      tasks = tasks.map((t) => ({
        ...t,
        assignee: mockUsers.find((u) => u.id === t.assignee_id) || null,
        creator: mockUsers.find((u) => u.id === t.creator_id),
      }));

      switch (input.sort) {
        case "priority":
          tasks.sort((a, b) => b.priority_score - a.priority_score);
          break;
        case "due_date":
          tasks.sort((a, b) => {
            if (!a.due_date) return 1;
            if (!b.due_date) return -1;
            return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
          });
          break;
        case "created_at":
          tasks.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          break;
      }

      return tasks;
    }),

  getById: publicProcedure.input(z.string()).query(({ input }) => {
    const task = getTaskStore().find((t) => t.id === input);
    if (!task) return null;

    const allTasks = getTaskStore();
    return {
      ...task,
      assignee: mockUsers.find((u) => u.id === task.assignee_id) || null,
      creator: mockUsers.find((u) => u.id === task.creator_id),
      subtasks: allTasks
        .filter((t) => t.parent_task_id === task.id)
        .map((t) => ({
          ...t,
          assignee: mockUsers.find((u) => u.id === t.assignee_id) || null,
          creator: mockUsers.find((u) => u.id === t.creator_id),
        })),
      parent_task: task.parent_task_id
        ? allTasks.find((t) => t.id === task.parent_task_id) || null
        : null,
    };
  }),

  create: publicProcedure
    .input(
      z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        assignee_id: z.string().optional(),
        team_id: z.string().default("team-1"),
        due_date: z.string().optional(),
        parent_task_id: z.string().optional(),
        tags: z.array(z.string()).optional(),
        natural_language: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      let title = input.title || "";
      let description = input.description;
      let dueDate = input.due_date;
      let tags = input.tags || [];
      let assigneeId = input.assignee_id;

      if (input.natural_language) {
        try {
          const parsed = await parseNaturalLanguageTask(input.natural_language);
          title = parsed.title;
          description = parsed.description || description;
          dueDate = parsed.due_date || dueDate;
          tags = parsed.tags || tags;

          if (parsed.assignee_name) {
            const matchedUser = mockUsers.find((u) =>
              u.name.toLowerCase().includes(parsed.assignee_name!.toLowerCase())
            );
            if (matchedUser) assigneeId = matchedUser.id;
          }
        } catch {
          title = input.natural_language;
        }
      }

      const newTask: Task = {
        id: `task-${Date.now()}`,
        title,
        description: description || null,
        assignee_id: assigneeId || null,
        creator_id: "user-1",
        team_id: input.team_id,
        priority_score: 50,
        status: "todo",
        due_date: dueDate || null,
        created_from: "web",
        parent_task_id: input.parent_task_id || null,
        tags,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Compute AI priority
      try {
        const factors = await computePriorityScore(newTask, getTaskStore());
        newTask.priority_score = Math.round(
          factors.urgency * 0.4 +
            factors.impact * 0.3 +
            factors.staleness * 0.2 +
            factors.dependency_depth * 10 * 0.1
        );
        newTask.priority_score = Math.min(100, Math.max(0, newTask.priority_score));
      } catch {
        // Use default score if AI fails
      }

      addTask(newTask);

      return {
        ...newTask,
        assignee: mockUsers.find((u) => u.id === newTask.assignee_id) || null,
        creator: mockUsers.find((u) => u.id === newTask.creator_id),
      };
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        description: z.string().optional(),
        assignee_id: z.string().nullable().optional(),
        priority_score: z.number().min(0).max(100).optional(),
        status: z.enum(["todo", "in_progress", "done"]).optional(),
        due_date: z.string().nullable().optional(),
        parent_task_id: z.string().nullable().optional(),
        tags: z.array(z.string()).optional(),
      })
    )
    .mutation(({ input }) => {
      const { id, ...updates } = input;
      const task = updateTask(id, updates);
      if (!task) throw new Error("Task not found");

      return {
        ...task,
        assignee: mockUsers.find((u) => u.id === task.assignee_id) || null,
        creator: mockUsers.find((u) => u.id === task.creator_id),
      };
    }),

  delete: publicProcedure.input(z.string()).mutation(({ input }) => {
    const success = deleteTask(input);
    if (!success) throw new Error("Task not found");
    return { success: true };
  }),

  stats: publicProcedure
    .input(z.object({ teamId: z.string().default("team-1") }))
    .query(({ input }) => {
      const tasks = getTaskStore().filter((t) => t.team_id === input.teamId);
      const now = new Date();

      const totalTasks = tasks.length;
      const completedTasks = tasks.filter((t) => t.status === "done").length;
      const inProgressTasks = tasks.filter((t) => t.status === "in_progress").length;
      const todoTasks = tasks.filter((t) => t.status === "todo").length;
      const overdueTasks = tasks.filter(
        (t) => t.due_date && new Date(t.due_date) < now && t.status !== "done"
      ).length;
      const highPriorityTasks = tasks.filter(
        (t) => t.priority_score >= 80 && t.status !== "done"
      ).length;

      return {
        totalTasks,
        completedTasks,
        inProgressTasks,
        todoTasks,
        overdueTasks,
        highPriorityTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      };
    }),
});
