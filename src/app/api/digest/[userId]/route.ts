import { NextRequest, NextResponse } from "next/server";
import { getTaskStore, mockUsers } from "@/lib/mock-data";
import { generateDigestSummary } from "@/lib/ai";
import { DailyDigest, DigestItem } from "@/types/database";

export async function GET(
  req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const userId = params.userId;
  const user = mockUsers.find((u) => u.id === userId);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const allTasks = getTaskStore().filter((t) => t.team_id === user.team_id);
  const now = new Date();

  // Top priorities: highest priority tasks assigned to this user
  const userTasks = allTasks
    .filter((t) => t.assignee_id === userId && t.status !== "done")
    .sort((a, b) => b.priority_score - a.priority_score);

  const topPriorities: DigestItem[] = userTasks.slice(0, 3).map((task) => ({
    task: {
      ...task,
      assignee: mockUsers.find((u) => u.id === task.assignee_id) || null,
      creator: mockUsers.find((u) => u.id === task.creator_id),
    },
    reason:
      task.priority_score >= 80
        ? "Critical priority — requires immediate attention"
        : task.priority_score >= 50
          ? "High priority — due this week"
          : "Standard priority — scheduled for completion",
  }));

  // Blockers: tasks that block other tasks
  const blockers = allTasks.filter(
    (t) =>
      t.assignee_id === userId &&
      t.status !== "done" &&
      allTasks.some((other) => other.parent_task_id === t.id && other.status !== "done")
  );

  // Upcoming deadlines within 48h
  const upcomingDeadlines = userTasks.filter((t) => {
    if (!t.due_date) return false;
    const due = new Date(t.due_date);
    const diff = due.getTime() - now.getTime();
    return diff > 0 && diff < 48 * 60 * 60 * 1000;
  });

  // Generate AI summary
  let summary: string;
  try {
    summary = await generateDigestSummary(
      user.name,
      topPriorities,
      blockers,
      upcomingDeadlines
    );
  } catch {
    summary = `Good morning, ${user.name}! You have ${topPriorities.length} priority tasks today. Focus on your highest priority item first.`;
  }

  const digest: DailyDigest = {
    user,
    date: now.toISOString(),
    top_priorities: topPriorities,
    blockers: blockers.map((t) => ({
      ...t,
      assignee: mockUsers.find((u) => u.id === t.assignee_id) || null,
      creator: mockUsers.find((u) => u.id === t.creator_id),
    })),
    upcoming_deadlines: upcomingDeadlines.map((t) => ({
      ...t,
      assignee: mockUsers.find((u) => u.id === t.assignee_id) || null,
      creator: mockUsers.find((u) => u.id === t.creator_id),
    })),
    summary,
  };

  return NextResponse.json(digest);
}
