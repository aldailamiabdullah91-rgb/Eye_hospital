import { NextRequest, NextResponse } from "next/server";
import { addTask, mockUsers, getTaskStore } from "@/lib/mock-data";
import { parseNaturalLanguageTask, computePriorityScore } from "@/lib/ai";
import { Task } from "@/types/database";

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Handle Slack URL verification challenge
  if (body.type === "url_verification") {
    return NextResponse.json({ challenge: body.challenge });
  }

  // Handle Slack events
  if (body.type === "event_callback") {
    const event = body.event;

    // Handle reaction_added (lightning emoji for task creation)
    if (event.type === "reaction_added" && event.reaction === "zap") {
      try {
        const slackUserId = event.user;
        const user = mockUsers.find((u) => u.slack_user_id === slackUserId);

        const newTask: Task = {
          id: `task-${Date.now()}`,
          title: `Task from Slack reaction`,
          description: `Created from Slack thread via lightning emoji reaction.`,
          assignee_id: user?.id || null,
          creator_id: user?.id || "user-1",
          team_id: "team-1",
          priority_score: 50,
          status: "todo",
          due_date: null,
          created_from: "slack",
          parent_task_id: null,
          tags: ["slack"],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        addTask(newTask);
        return NextResponse.json({ ok: true });
      } catch (error) {
        console.error("Error processing Slack reaction:", error);
        return NextResponse.json({ error: "Processing failed" }, { status: 500 });
      }
    }

    // Handle app_mention or message events (slash command simulation)
    if (event.type === "app_mention" || event.type === "message") {
      try {
        const text = event.text?.replace(/<@[^>]+>/g, "").trim();
        if (!text) {
          return NextResponse.json({ ok: true });
        }

        let parsedTask;
        try {
          parsedTask = await parseNaturalLanguageTask(text);
        } catch {
          parsedTask = { title: text };
        }

        const slackUserId = event.user;
        const user = mockUsers.find((u) => u.slack_user_id === slackUserId);

        let assigneeId: string | null = null;
        if (parsedTask.assignee_name) {
          const matchedUser = mockUsers.find((u) =>
            u.name.toLowerCase().includes(parsedTask.assignee_name!.toLowerCase())
          );
          if (matchedUser) assigneeId = matchedUser.id;
        }

        const newTask: Task = {
          id: `task-${Date.now()}`,
          title: parsedTask.title,
          description: parsedTask.description || null,
          assignee_id: assigneeId,
          creator_id: user?.id || "user-1",
          team_id: "team-1",
          priority_score: 50,
          status: "todo",
          due_date: parsedTask.due_date || null,
          created_from: "slack",
          parent_task_id: null,
          tags: parsedTask.tags || ["slack"],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

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
          // Keep default score
        }

        addTask(newTask);
        return NextResponse.json({ ok: true, task: newTask });
      } catch (error) {
        console.error("Error processing Slack message:", error);
        return NextResponse.json({ error: "Processing failed" }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ ok: true });
}
