"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Zap,
  Brain,
  MessageSquare,
  Mail,
  GitBranch,
  Clock,
  ArrowRight,
  CheckCircle2,
  BarChart3,
  Shield,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Priority Scoring",
    description:
      "Composite scoring based on urgency, impact, dependencies, and team capacity. Transparent reasoning so you trust the ranking.",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
  },
  {
    icon: MessageSquare,
    title: "Slack Integration",
    description:
      'Create tasks from thread replies using the /task command or lightning emoji. No more context-switching.',
    color: "text-purple-500",
    bgColor: "bg-purple-500/10",
  },
  {
    icon: Mail,
    title: "Daily AI Digest",
    description:
      "Each team member gets a personalized Slack DM at 9am local time with their top 3 priorities and blockers.",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  {
    icon: GitBranch,
    title: "Dependency Tracking",
    description:
      "DAG visualization showing task blocking relationships. Know which tasks to escalate at a glance.",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
  {
    icon: Clock,
    title: "Smart Reminders",
    description:
      "Automated Slack reminders at 24h and 2h before deadlines. Snooze with natural language.",
    color: "text-red-500",
    bgColor: "bg-red-500/10",
  },
  {
    icon: BarChart3,
    title: "Velocity Reports",
    description:
      "Weekly velocity metrics per team member without manual tracking. See completion rates and trends.",
    color: "text-cyan-500",
    bgColor: "bg-cyan-500/10",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-amber-500" />
            <span className="text-lg font-bold">TaskFlow</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                Dashboard
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="sm" className="gap-2">
                Get Started
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-24 text-center">
        <Badge variant="secondary" className="mb-4">
          AI-Powered Task Management
        </Badge>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 max-w-3xl mx-auto">
          Stop triaging.
          <br />
          <span className="text-amber-500">Start shipping.</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
          TaskFlow uses AI to automatically prioritize your team&apos;s work based on urgency,
          impact, and dependencies. Create tasks from Slack. Get daily digests. Never miss
          a deadline across timezones.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/dashboard">
            <Button size="lg" className="gap-2">
              Open Dashboard
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/digest">
            <Button size="lg" variant="outline" className="gap-2">
              <Mail className="h-4 w-4" />
              View Sample Digest
            </Button>
          </Link>
        </div>

        <div className="flex items-center justify-center gap-6 mt-8 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            Free for teams up to 5
          </span>
          <span className="flex items-center gap-1">
            <Shield className="h-4 w-4 text-blue-500" />
            SOC 2 compliant
          </span>
          <span className="flex items-center gap-1">
            <MessageSquare className="h-4 w-4 text-purple-500" />
            Slack native
          </span>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">
            Everything your remote team needs
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Built for distributed teams of 5-50 people who waste hours on manual
            task triage across timezones.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-lg border border-border bg-card p-6 transition-colors hover:border-muted-foreground/30"
            >
              <div className={`rounded-lg ${feature.bgColor} p-2 w-fit mb-4`}>
                <feature.icon className={`h-5 w-5 ${feature.color}`} />
              </div>
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16">
        <div className="rounded-2xl border border-border bg-card p-12 text-center">
          <h2 className="text-3xl font-bold mb-3">
            Ready to save 5+ hours per week?
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto mb-6">
            Join remote teams who&apos;ve automated their task triage with AI.
            Set up in under 5 minutes.
          </p>
          <Link href="/dashboard">
            <Button size="lg" className="gap-2">
              Start Free Trial
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-500" />
            <span>TaskFlow</span>
          </div>
          <p>Built for remote teams. Powered by AI.</p>
        </div>
      </footer>
    </div>
  );
}
