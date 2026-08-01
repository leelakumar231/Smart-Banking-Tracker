import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowUpRight,
  Download,
  FileText,
  Lightbulb,
  Minus,
  PiggyBank,
  Plus,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell, TypeBadge } from "@/components/app-shell";
import { TransactionDialog } from "@/components/transaction-dialog";
import { Button } from "@/components/ui/button";
import { useSession, useTransactions } from "@/hooks/use-finance";
import {
  MONTHLY_BUDGET,
  categoryBreakdown,
  currentMonthExpense,
  downloadCSV,
  formatINR,
  monthlySeries,
  summarize,
  type TxType,
} from "@/lib/finance";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — FinTrack Expense Tracker" },
      { name: "description", content: "Your balance, income, expenses, savings, budget usage and live financial charts in one view." },
      { property: "og:title", content: "Dashboard — FinTrack Expense Tracker" },
      { property: "og:description", content: "Your balance, income, expenses, savings, budget usage and live financial charts in one view." },
    ],
  }),
  component: Dashboard,
});

const PIE_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--muted-foreground)",
];

const TIPS = [
  "Track every expense daily — small leaks sink big budgets.",
  "Save at least 20% of your monthly income before spending.",
  "Keep fixed costs like rent under 30% of income.",
  "Review your top spending category every weekend.",
];

function Dashboard() {
  const navigate = useNavigate();
  const { user, hydrated: sessionReady } = useSession();
  const { transactions, addTransaction } = useTransactions();
  const [dialogType, setDialogType] = useState<TxType | null>(null);

  useEffect(() => {
    if (sessionReady && !user) navigate({ to: "/login" });
  }, [sessionReady, user, navigate]);

  const totals = useMemo(() => summarize(transactions), [transactions]);
  const series = useMemo(() => monthlySeries(transactions), [transactions]);
  const byCategory = useMemo(() => categoryBreakdown(transactions).slice(0, 6), [transactions]);
  const monthSpend = useMemo(() => currentMonthExpense(transactions), [transactions]);
  const budgetPct = Math.min(100, Math.round((monthSpend / MONTHLY_BUDGET) * 100));
  const recent = transactions.slice(0, 6);

  const metrics = [
    { label: "Total Balance", value: totals.balance, icon: Wallet, tone: "primary" },
    { label: "Total Income", value: totals.income, icon: TrendingUp, tone: "success" },
    { label: "Total Expense", value: totals.expense, icon: TrendingDown, tone: "expense" },
    { label: "Savings", value: totals.savings, icon: PiggyBank, tone: "primary" },
  ] as const;

  return (
    <AppShell
      title={`Welcome back, ${user?.name ?? "User"} 👋`}
      subtitle="Here's how your money is doing today."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((m) => (
          <div key={m.label} className="card-surface card-hover p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{m.label}</p>
              <span
                className={`flex size-9 items-center justify-center rounded-xl ${
                  m.tone === "success"
                    ? "bg-success-soft text-success"
                    : m.tone === "expense"
                      ? "bg-expense-soft text-expense"
                      : "bg-primary-soft text-primary"
                }`}
              >
                <m.icon className="size-4.5" />
              </span>
            </div>
            <p className="mt-3 text-2xl font-bold lg:text-3xl">{formatINR(m.value)}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 card-surface flex flex-wrap items-center gap-3 p-4">
        <Button onClick={() => setDialogType("income")}>
          <Plus className="size-4" /> Add Income
        </Button>
        <Button variant="outline" onClick={() => setDialogType("expense")}>
          <Minus className="size-4" /> Add Expense
        </Button>
        <Button
          variant="outline"
          onClick={() =>
            toast.success("Report generated", {
              description: `${transactions.length} transactions · net ${formatINR(totals.balance)}`,
            })
          }
        >
          <FileText className="size-4" /> Generate Report
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            downloadCSV(transactions);
            toast.success("Export started", { description: "Your CSV is downloading." });
          }}
        >
          <Download className="size-4" /> Export Data
        </Button>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        <div className="card-surface p-5 xl:col-span-2">
          <h2 className="text-base font-semibold">Income vs Expense</h2>
          <p className="text-sm text-muted-foreground">Last 6 months</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={series} barGap={6}>
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  tickFormatter={(v: number) => `₹${Math.round(v / 1000)}k`}
                />
                <Tooltip
                  formatter={(v: number) => formatINR(v)}
                  contentStyle={{ borderRadius: 12, border: "1px solid var(--border)" }}
                />
                <Legend iconType="circle" />
                <Bar dataKey="income" fill="var(--success)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expense" fill="var(--expense)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-surface p-5">
          <h2 className="text-base font-semibold">Monthly Spending</h2>
          <p className="text-sm text-muted-foreground">By category</p>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={byCategory}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                >
                  {byCategory.map((entry, i) => (
                    <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => formatINR(v)} />
                <Legend iconType="circle" fontSize={12} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        <div className="card-surface p-5 xl:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Recent Transactions</h2>
            <Button asChild variant="ghost" size="sm">
              <Link to="/transactions">
                View All <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="pb-3 pr-4 font-medium">Date</th>
                  <th className="pb-3 pr-4 font-medium">Category</th>
                  <th className="pb-3 pr-4 font-medium">Amount</th>
                  <th className="pb-3 pr-4 font-medium">Type</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((t) => (
                  <tr key={t.id} className="border-b border-border/60 last:border-0">
                    <td className="py-3 pr-4 text-muted-foreground">{t.date}</td>
                    <td className="py-3 pr-4 font-medium">{t.category}</td>
                    <td
                      className={`py-3 pr-4 font-semibold ${
                        t.type === "income" ? "text-success" : "text-expense"
                      }`}
                    >
                      {t.type === "income" ? "+" : "−"}
                      {formatINR(t.amount)}
                    </td>
                    <td className="py-3 pr-4">
                      <TypeBadge type={t.type} />
                    </td>
                    <td className="py-3">
                      <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid gap-5">
          <div className="card-surface p-5">
            <h2 className="text-base font-semibold">Monthly Budget</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatINR(monthSpend)} of {formatINR(MONTHLY_BUDGET)} used
            </p>
            <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  budgetPct > 85 ? "bg-expense" : "bg-gradient-brand"
                }`}
                style={{ width: `${budgetPct}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>{budgetPct}% used</span>
              <span>{formatINR(Math.max(0, MONTHLY_BUDGET - monthSpend))} left</span>
            </div>
          </div>

          <div className="card-surface p-5">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-full bg-gradient-brand text-sm font-semibold text-primary-foreground">
                {(user?.name ?? "U").slice(0, 1).toUpperCase()}
              </span>
              <div>
                <p className="font-semibold">{user?.name ?? "User"}</p>
                <p className="text-xs text-muted-foreground">
                  {user?.email ?? "demo@fintrack.app"}
                </p>
              </div>
            </div>
            <p className="mt-3 inline-flex rounded-full bg-primary-soft px-2.5 py-1 text-xs font-semibold text-primary">
              {user?.tier ?? "Premium"} account
            </p>
            <Button
              variant="outline"
              className="mt-4 w-full"
              onClick={() => toast("Profile editing is coming soon in this demo.")}
            >
              Edit Profile
            </Button>
          </div>

          <div className="card-surface p-5">
            <div className="flex items-center gap-2">
              <Lightbulb className="size-4.5 text-primary" />
              <h2 className="text-base font-semibold">Financial Tips</h2>
            </div>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {TIPS.map((tip) => (
                <li key={tip} className="flex gap-2">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <TransactionDialog
        type={dialogType ?? "expense"}
        open={dialogType !== null}
        onOpenChange={(open) => !open && setDialogType(null)}
        onSubmit={(tx) => {
          addTransaction(tx);
          toast.success(`${tx.type === "income" ? "Income" : "Expense"} added`, {
            description: `${formatINR(tx.amount)} · ${tx.category}`,
          });
        }}
      />
    </AppShell>
  );
}
