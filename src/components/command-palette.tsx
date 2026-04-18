"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const router = useRouter();
  const utils = trpc.useUtils();

  const createTask = trpc.tasks.create.useMutation({
    onSuccess: (task) => {
      utils.tasks.list.invalidate();
      utils.tasks.stats.invalidate();
      setOpen(false);
      setInput("");
      router.push(`/tasks/${task.id}`);
    },
  });

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    },
    []
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;

    createTask.mutate({
      natural_language: input,
      team_id: "team-1",
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[500px] p-0 gap-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Quick Task Creation</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="flex items-center border-b border-border px-3">
            <Search className="h-4 w-4 text-muted-foreground mr-2" />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='Create task... (e.g., "Fix login bug for Sarah by Friday")'
              className="flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
              autoFocus
            />
            {createTask.isPending && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </div>
          <div className="flex items-center justify-between p-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-amber-500" />
              <span>AI will parse your task automatically</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono">Enter</kbd>
              <span>to create</span>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
