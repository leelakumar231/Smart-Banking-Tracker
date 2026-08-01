import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Bell,
  LayoutDashboard,
  LogOut,
  PieChart,
  Receipt,
  Wallet,
} from "lucide-react";
import type { ReactNode } from "react";
import { useSession } from "@/hooks/use-finance";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/transactions", label: "Transactions", icon: Receipt },
  { to: "/analytics", label: "Analytics", icon: PieChart },
] as const;

export function AppShell({
  title,
  subtitle,
  actions,
  children,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const { user, logout } = useSession();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const displayName = user?.name ?? "User";
  const initials = displayName
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar px-4 py-6 lg:flex">
        <Link to="/" className="flex items-center gap-2 px-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-brand text-primary-foreground">
            <Wallet className="size-5" />
          </span>
          <span className="text-base font-bold">FinTrack</span>
        </Link>

        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {NAV.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <item.icon className="size-4.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="rounded-2xl bg-gradient-brand p-4 text-primary-foreground">
          <p className="text-xs opacity-80">Account tier</p>
          <p className="text-lg font-semibold">Premium</p>
          <p className="mt-1 text-xs opacity-80">Unlimited insights & exports</p>
        </div>

        <button
          onClick={() => {
            logout();
            navigate({ to: "/" });
          }}
          className="mt-4 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          <LogOut className="size-4.5" />
          Sign out
        </button>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-border bg-card/80 backdrop-blur">
          <div className="flex items-center justify-between gap-4 px-5 py-4 lg:px-8">
            <div>
              <h1 className="text-lg font-bold lg:text-xl">{title}</h1>
              {subtitle ? (
                <p className="text-sm text-muted-foreground">{subtitle}</p>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              {actions}
              <Button variant="ghost" size="icon" className="relative rounded-full">
                <Bell className="size-5" />
                <span className="absolute right-2 top-2 size-2 rounded-full bg-expense" />
              </Button>
              <span className="flex size-10 items-center justify-center rounded-full bg-gradient-brand text-sm font-semibold text-primary-foreground">
                {initials || "U"}
              </span>
            </div>
          </div>
        </header>

        <main className="px-5 pb-28 pt-6 lg:px-8 lg:pb-12">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 backdrop-blur lg:hidden">
        <div className="grid grid-cols-3">
          {NAV.map((item) => {
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <item.icon className="size-5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export function TypeBadge({ type }: { type: "income" | "expense" }) {
  const income = type === "income";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
        income ? "bg-success-soft text-success" : "bg-expense-soft text-expense"
      }`}
    >
      {income ? <ArrowDownLeft className="size-3" /> : <ArrowUpRight className="size-3" />}
      {income ? "Income" : "Expense"}
    </span>
  );
}
