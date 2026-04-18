"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Settings,
  Users,
  MessageSquare,
  Bell,
  Globe,
  Shield,
  ExternalLink,
  Check,
} from "lucide-react";
import { getInitials } from "@/lib/utils";

export default function SettingsPage() {
  const users = trpc.users.list.useQuery({ teamId: "team-1" });
  const [slackConnected, setSlackConnected] = useState(false);
  const [digestTime, setDigestTime] = useState("09:00");
  const [digestEnabled, setDigestEnabled] = useState(true);
  const [reminderBefore24h, setReminderBefore24h] = useState(true);
  const [reminderBefore2h, setReminderBefore2h] = useState(true);

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="rounded-lg bg-muted p-2">
          <Settings className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your team, integrations, and notification preferences
          </p>
        </div>
      </div>

      {/* Team Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" />
            Team Members
          </CardTitle>
          <CardDescription>Manage your team and their roles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {users.data?.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                    {user.role}
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    {user.timezone.split("/").pop()?.replace("_", " ")}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" className="mt-4">
            <Users className="h-4 w-4 mr-2" />
            Invite Team Member
          </Button>
        </CardContent>
      </Card>

      {/* Slack Integration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Slack Integration
          </CardTitle>
          <CardDescription>
            Connect Slack to create tasks from threads and receive daily digests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {slackConnected ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-500 font-medium">Connected to Slack workspace</span>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Features enabled:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-green-500" />
                    Task creation via /task command
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-green-500" />
                    Task creation via lightning emoji reaction
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-green-500" />
                    Daily digest delivery to DMs
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3 w-3 text-green-500" />
                    Due date reminders (24h and 2h before)
                  </li>
                </ul>
              </div>
              <Button variant="outline" size="sm" onClick={() => setSlackConnected(false)}>
                Disconnect
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Connect your Slack workspace to enable task creation from threads,
                daily digests, and deadline reminders.
              </p>
              <Button onClick={() => setSlackConnected(true)} className="gap-2">
                <MessageSquare className="h-4 w-4" />
                Connect Slack Workspace
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notification Preferences
          </CardTitle>
          <CardDescription>Configure when and how you receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg border border-border">
            <div>
              <p className="text-sm font-medium">Daily Digest</p>
              <p className="text-xs text-muted-foreground">
                AI-generated summary of your top priorities
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="time"
                value={digestTime}
                onChange={(e) => setDigestTime(e.target.value)}
                className="w-[120px] h-8 text-xs"
              />
              <Button
                variant={digestEnabled ? "default" : "outline"}
                size="sm"
                onClick={() => setDigestEnabled(!digestEnabled)}
              >
                {digestEnabled ? "Enabled" : "Disabled"}
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border border-border">
            <div>
              <p className="text-sm font-medium">24h Deadline Reminder</p>
              <p className="text-xs text-muted-foreground">
                Slack DM 24 hours before task deadline
              </p>
            </div>
            <Button
              variant={reminderBefore24h ? "default" : "outline"}
              size="sm"
              onClick={() => setReminderBefore24h(!reminderBefore24h)}
            >
              {reminderBefore24h ? "Enabled" : "Disabled"}
            </Button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border border-border">
            <div>
              <p className="text-sm font-medium">2h Deadline Reminder</p>
              <p className="text-xs text-muted-foreground">
                Slack DM 2 hours before task deadline
              </p>
            </div>
            <Button
              variant={reminderBefore2h ? "default" : "outline"}
              size="sm"
              onClick={() => setReminderBefore2h(!reminderBefore2h)}
            >
              {reminderBefore2h ? "Enabled" : "Disabled"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </CardTitle>
          <CardDescription>Data encryption and compliance settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">Data encryption at rest</span>
            <Badge variant="secondary">AES-256</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Data encryption in transit</span>
            <Badge variant="secondary">TLS 1.3</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">SOC 2 Type II</span>
            <Badge variant="outline">In progress</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
