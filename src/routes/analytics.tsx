import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/components/app-shell";
import { useSession, useTransactions } from "@/hooks/use-finance";
import {
  categoryBreakdown,
  currentMonthExpense,
  formatINR,
  monthlySeries,
  summarize,
} from "@/lib/finance";

export const Route = createFileRoute("/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — FinTrack Expense Tracker" },
      { name: "description", content: "Deep-dive charts on monthly spending habits, savings trend and category breakdowns." },
      { property: "og:title", content: "Analytics — FinTrack Expense Tracker" },
      { property: "og:description", content: "Deep-dive charts on monthly spending habits, savings trend and category breakdowns." },
    ],
  }),
  component: AnalyticsPage,
});

const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--muted-foreground)",
];

function AnalyticsPage() {
  const navigate = useNavigate();
  const { user, hydrated } = useSession();
  const { transactions } = useTransactions();

  useEffect(() => {
    if (hydrated && !user) navigate({ to: "/login" });
  }, [hydrated, user, navigate]);

  const series = useMemo(() => monthlySeries(transactions), [transactions]);
  const savings = useMemo(
    () => series.map((s) => ({ month: s.month, savings: s.income - s.expense })),
    [series],
  );
  const categories = useMemo(() => categoryBreakdown(transactions), [transactions]);
  const totals = useMemo(() => summarize(transactions), [transactions]);
  const monthSpend = currentMonthExpense(transactions);
  const avgSpend = series.length
    ? series.reduce((s, m) => s + m.expense, 0) / series.length
    : 0;
  const savingsRate = totals.income ? Math.round((totals.savings / totals.income) * 100) : 0;

  const stats = [
    { label: "This month's spend", value: formatINR(monthSpend) },
    { label: "Avg. monthly spend", value: formatINR(avgSpend) },
    { label: "Savings rate", value: `${savingsRate}%` },
    { label: "Top category", value: categories[0]?.name ?? "—" },
  ];

  return (
    <AppShell title="Analytics" subtitle="Understand your spending habits over time.">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card-surface card-hover p-5">
            <p className="text-sm text-muted-foreground">{s.label}</p>
            <p className="mt-2 text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <div className="card-surface p-5">
          <h2 className="text-base font-semibold">Monthly spending trend</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series}>
                <defs>
                  <linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--expense)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--expense)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  tickFormatter={(v: number) => `₹${Math.round(v / 1000)}k`}
                />
                <Tooltip formatter={(v: number) => formatINR(v)} />
                <Area
                  type="monotone"
                  dataKey="expense"
                  stroke="var(--expense)"
                  strokeWidth={2}
                  fill="url(#spendFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-surface p-5">
          <h2 className="text-base font-semibold">Savings trend</h2>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={savings}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  tickFormatter={(v: number) => `₹${Math.round(v / 1000)}k`}
                />
                <Tooltip formatter={(v: number) => formatINR(v)} />
                <Line
                  type="monotone"
                  dataKey="savings"
                  stroke="var(--success)"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-surface p-5">
          <h2 className="text-base font-semibold">Category breakdown</h2>
          <div className="mt-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categories}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={110}
                  paddingAngle={2}
                >
                  {categories.map((entry, i) => (
                    <Cell key={entry.name} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => formatINR(v)} />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-surface p-5">
          <h2 className="text-base font-semibold">Income vs expense</h2>
          <div className="mt-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={series} barGap={6}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  tickFormatter={(v: number) => `₹${Math.round(v / 1000)}k`}
                />
                <Tooltip formatter={(v: number) => formatINR(v)} />
                <Legend iconType="circle" />
                <Bar dataKey="income" fill="var(--success)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="expense" fill="var(--expense)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
