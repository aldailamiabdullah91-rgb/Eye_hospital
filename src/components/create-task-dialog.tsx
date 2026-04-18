"use client";

import { useState } from "react";
import { Plus, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/lib/trpc";

export function CreateTaskDialog() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"natural" | "structured">("natural");
  const [naturalInput, setNaturalInput] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [tags, setTags] = useState("");

  const utils = trpc.useUtils();
  const users = trpc.users.list.useQuery({ teamId: "team-1" });

  const createTask = trpc.tasks.create.useMutation({
    onSuccess: () => {
      utils.tasks.list.invalidate();
      utils.tasks.stats.invalidate();
      setOpen(false);
      resetForm();
    },
  });

  function resetForm() {
    setNaturalInput("");
    setTitle("");
    setDescription("");
    setAssigneeId("");
    setDueDate("");
    setTags("");
  }

  function handleSubmit() {
    if (mode === "natural") {
      createTask.mutate({
        natural_language: naturalInput,
        team_id: "team-1",
      });
    } else {
      createTask.mutate({
        title,
        description: description || undefined,
        assignee_id: assigneeId || undefined,
        due_date: dueDate || undefined,
        tags: tags ? tags.split(",").map((t) => t.trim()) : undefined,
        team_id: "team-1",
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          New Task
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
          <DialogDescription>
            Use natural language or fill in the form to create a new task.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <Button
            variant={mode === "natural" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("natural")}
            className="gap-2"
          >
            <Sparkles className="h-3 w-3" />
            AI Parse
          </Button>
          <Button
            variant={mode === "structured" ? "default" : "outline"}
            size="sm"
            onClick={() => setMode("structured")}
          >
            Manual
          </Button>
        </div>

        {mode === "natural" ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="natural">Describe the task</Label>
              <Textarea
                id="natural"
                placeholder='e.g., "Fix auth bug for Sarah by Friday" or "Schedule design review with Marcus next Tuesday"'
                value={naturalInput}
                onChange={(e) => setNaturalInput(e.target.value)}
                className="min-h-[100px]"
              />
              <p className="text-xs text-muted-foreground">
                AI will extract the title, assignee, due date, and tags automatically.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Task title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Task description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="assignee">Assignee</Label>
                <Select value={assigneeId} onValueChange={setAssigneeId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.data?.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                placeholder="bug, feature, urgent (comma separated)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              createTask.isPending ||
              (mode === "natural" ? !naturalInput : !title)
            }
          >
            {createTask.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Task"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
