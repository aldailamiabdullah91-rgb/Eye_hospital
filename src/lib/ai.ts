import { ParsedTask, PriorityFactors, Task, DigestItem } from "@/types/database";

const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";

async function callClaude(systemPrompt: string, userPrompt: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }

  const response = await fetch(CLAUDE_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

export async function parseNaturalLanguageTask(input: string): Promise<ParsedTask> {
  const systemPrompt = `You are a task parser. Extract structured task data from natural language input.
Return ONLY valid JSON with these fields:
- title (string, required): concise task title
- description (string, optional): additional details
- assignee_name (string, optional): person assigned to the task
- due_date (string, optional): ISO 8601 date string (YYYY-MM-DD)
- tags (string[], optional): relevant tags
- priority_hint (string, optional): "high", "medium", or "low"

Today's date is ${new Date().toISOString().split("T")[0]}.
Interpret relative dates like "Friday", "next week", "tomorrow" relative to today.`;

  const result = await callClaude(systemPrompt, input);

  try {
    const cleaned = result.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return { title: input };
  }
}

export async function computePriorityScore(task: Task, teamTasks: Task[]): Promise<PriorityFactors> {
  const now = new Date();

  // Urgency: based on deadline proximity (0-100)
  let urgency = 30; // default for no deadline
  if (task.due_date) {
    const dueDate = new Date(task.due_date);
    const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (hoursUntilDue < 0) urgency = 100; // overdue
    else if (hoursUntilDue < 4) urgency = 95;
    else if (hoursUntilDue < 24) urgency = 85;
    else if (hoursUntilDue < 48) urgency = 70;
    else if (hoursUntilDue < 168) urgency = 50; // within a week
    else urgency = 25;
  }

  // Impact: based on how many tasks depend on this one
  const dependentTasks = teamTasks.filter((t) => t.parent_task_id === task.id);
  const dependencyDepth = calculateDependencyDepth(task.id, teamTasks);
  const impact = Math.min(100, 30 + dependentTasks.length * 15 + dependencyDepth * 10);

  // Staleness: how long since creation without progress
  const hoursOld = (now.getTime() - new Date(task.created_at).getTime()) / (1000 * 60 * 60);
  const staleness = task.status === "todo" ? Math.min(100, hoursOld * 2) : 0;

  // Composite score
  const score = Math.round(urgency * 0.4 + impact * 0.3 + staleness * 0.2 + dependencyDepth * 10 * 0.1);
  const clampedScore = Math.min(100, Math.max(0, score));

  const reasoning = generatePriorityReasoning(clampedScore, urgency, impact, staleness, dependencyDepth, task);

  return {
    urgency,
    impact,
    dependency_depth: dependencyDepth,
    staleness,
    override: null,
    reasoning,
  };
}

function calculateDependencyDepth(taskId: string, tasks: Task[]): number {
  const children = tasks.filter((t) => t.parent_task_id === taskId);
  if (children.length === 0) return 0;
  return 1 + Math.max(...children.map((c) => calculateDependencyDepth(c.id, tasks)));
}

function generatePriorityReasoning(
  score: number,
  urgency: number,
  impact: number,
  staleness: number,
  depthValue: number,
  task: Task
): string {
  const reasons: string[] = [];

  if (urgency >= 85) {
    reasons.push(task.due_date ? `Deadline is imminent (${new Date(task.due_date).toLocaleDateString()})` : "High urgency detected");
  } else if (urgency >= 50) {
    reasons.push("Deadline approaching within the week");
  }

  if (impact >= 60) {
    reasons.push("Multiple tasks depend on this being completed");
  }

  if (staleness >= 50) {
    reasons.push("Task has been in backlog without progress");
  }

  if (depthValue >= 2) {
    reasons.push(`Deep dependency chain (${depthValue} levels)`);
  }

  if (reasons.length === 0) {
    if (score >= 80) reasons.push("Multiple high-priority factors combined");
    else if (score >= 50) reasons.push("Moderate priority based on deadline and impact");
    else reasons.push("Standard priority — no urgent factors detected");
  }

  return reasons.join(". ") + ".";
}

export async function generateDigestSummary(
  userName: string,
  priorities: DigestItem[],
  blockers: Task[],
  upcomingDeadlines: Task[]
): Promise<string> {
  const systemPrompt = `You are a helpful productivity assistant. Generate a brief, actionable daily digest summary for a team member. Be concise and direct. Use bullet points. Max 150 words.`;

  const userPrompt = `Generate a morning digest for ${userName}.

Top priorities today:
${priorities.map((p, i) => `${i + 1}. ${p.task.title} (Priority: ${p.task.priority_score}/100) - ${p.reason}`).join("\n")}

${blockers.length > 0 ? `Blocked tasks:\n${blockers.map((b) => `- ${b.title}`).join("\n")}` : "No blockers."}

${upcomingDeadlines.length > 0 ? `Upcoming deadlines:\n${upcomingDeadlines.map((d) => `- ${d.title} (due ${d.due_date})`).join("\n")}` : "No upcoming deadlines."}`;

  try {
    return await callClaude(systemPrompt, userPrompt);
  } catch {
    // Fallback if AI is unavailable
    return `Good morning, ${userName}! You have ${priorities.length} priority tasks today${blockers.length > 0 ? ` and ${blockers.length} blocked tasks` : ""}. Focus on your top priority first.`;
  }
}
