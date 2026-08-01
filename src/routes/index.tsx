import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BarChart3,
  PiggyBank,
  Receipt,
  ShieldCheck,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "FinTrack — Smart Banking-Style Expense Tracker" },
      {
        name: "description",
        content:
          "Track income, expenses and savings with a banking-grade dashboard, live charts and instant CSV exports.",
      },
      { property: "og:title", content: "FinTrack — Smart Banking-Style Expense Tracker" },
      {
        property: "og:description",
        content:
          "Track income, expenses and savings with a banking-grade dashboard, live charts and instant CSV exports.",
      },
    ],
  }),
  component: Landing,
});

const FEATURES = [
  {
    icon: Receipt,
    title: "Expense Tracking",
    body: "Log every spend by category and see where your money actually goes each month.",
  },
  {
    icon: TrendingUp,
    title: "Income Management",
    body: "Salary, freelancing or bonuses — record all inflows and watch your balance grow.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    body: "Interactive income vs expense charts and category breakdowns updated in real time.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-6">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-brand text-primary-foreground">
            <Wallet className="size-5" />
          </span>
          <span className="text-base font-bold">FinTrack</span>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost">
            <Link to="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link to="/register">Get Started</Link>
          </Button>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-10 lg:grid-cols-2 lg:pt-20">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-semibold text-primary">
            <ShieldCheck className="size-3.5" /> Bank-grade personal finance
          </span>
          <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] lg:text-6xl">
            Smart Banking-Style Expense Tracker
          </h1>
          <p className="mt-5 max-w-lg text-base text-muted-foreground lg:text-lg">
            One clean dashboard for your income, spending and savings — with live charts,
            budget tracking and one-click CSV exports. No setup, everything stays on your
            device.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link to="/register">
                Get Started <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/login">Login</Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="card-surface card-hover overflow-hidden bg-gradient-brand p-6 text-primary-foreground">
            <p className="text-sm opacity-80">Available Balance</p>
            <p className="mt-2 text-4xl font-bold">₹48,500</p>
            <p className="mt-4 text-xs opacity-75">•••• •••• •••• 4829 · Premium</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="card-surface card-hover p-5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-success-soft text-success">
                <TrendingUp className="size-4.5" />
              </span>
              <p className="mt-3 text-sm text-muted-foreground">Income</p>
              <p className="text-2xl font-bold text-success">₹72,000</p>
            </div>
            <div className="card-surface card-hover p-5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-expense-soft text-expense">
                <PiggyBank className="size-4.5" />
              </span>
              <p className="mt-3 text-sm text-muted-foreground">Expenses</p>
              <p className="text-2xl font-bold text-expense">₹23,500</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-24">
        <h2 className="text-2xl font-bold lg:text-3xl">Everything your money needs</h2>
        <p className="mt-2 text-muted-foreground">
          Built for people who want clarity, not spreadsheets.
        </p>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="card-surface card-hover p-6">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                <f.icon className="size-5" />
              </span>
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-6xl px-5 py-8 text-sm text-muted-foreground">
          © {new Date().getFullYear()} FinTrack — demo app, data stored locally in your browser.
        </div>
      </footer>
    </div>
  );
}
