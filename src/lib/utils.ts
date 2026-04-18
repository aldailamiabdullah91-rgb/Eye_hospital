import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatRelativeDate(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`;
  if (diffDays === 0) return "Due today";
  if (diffDays === 1) return "Due tomorrow";
  if (diffDays <= 7) return `Due in ${diffDays}d`;
  return formatDate(date);
}

export function getPriorityColor(score: number): string {
  if (score >= 80) return "text-red-500 bg-red-500/10 border-red-500/20";
  if (score >= 50) return "text-amber-500 bg-amber-500/10 border-amber-500/20";
  return "text-blue-500 bg-blue-500/10 border-blue-500/20";
}

export function getPriorityLabel(score: number): string {
  if (score >= 80) return "P0";
  if (score >= 50) return "P1";
  return "P2";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
