export type TxType = "income" | "expense";

export type Transaction = {
  id: string;
  type: TxType;
  amount: number;
  category: string;
  date: string; // yyyy-mm-dd
  note?: string;
  status: "Completed" | "Paid" | "Pending";
};

export type SessionUser = {
  name: string;
  email: string;
  username: string;
  tier: string;
};

export const INCOME_CATEGORIES = [
  "Salary",
  "Freelancing",
  "Investments",
  "Bonus",
  "Refund",
  "Other",
];

export const EXPENSE_CATEGORIES = [
  "Groceries",
  "Fuel",
  "Rent",
  "Utilities",
  "Dining",
  "Shopping",
  "Travel",
  "Health",
  "Other",
];

export const TX_KEY = "pet.transactions";
export const SESSION_KEY = "pet.session";
export const BUDGET_KEY = "pet.budget";

export const MONTHLY_BUDGET = 50000;

export const formatINR = (value: number) =>
  "₹" + Math.round(value).toLocaleString("en-IN");

const iso = (d: Date) => d.toISOString().slice(0, 10);

export function seedTransactions(): Transaction[] {
  const now = new Date();
  const day = (offset: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - offset);
    return iso(d);
  };
  const monthBack = (m: number, dayOfMonth = 5) => {
    const d = new Date(now.getFullYear(), now.getMonth() - m, dayOfMonth);
    return iso(d);
  };

  const rows: Omit<Transaction, "id">[] = [
    { type: "income", amount: 60000, category: "Salary", date: day(4), note: "Monthly salary", status: "Completed" },
    { type: "income", amount: 12000, category: "Freelancing", date: day(9), note: "Landing page project", status: "Completed" },
    { type: "expense", amount: 8500, category: "Rent", date: day(3), note: "Apartment rent", status: "Paid" },
    { type: "expense", amount: 4200, category: "Groceries", date: day(2), note: "Weekly stock-up", status: "Paid" },
    { type: "expense", amount: 3100, category: "Fuel", date: day(6), status: "Paid" },
    { type: "expense", amount: 2600, category: "Dining", date: day(7), note: "Dinner with friends", status: "Completed" },
    { type: "expense", amount: 2400, category: "Shopping", date: day(11), status: "Paid" },
    { type: "expense", amount: 1500, category: "Utilities", date: day(13), note: "Electricity + internet", status: "Paid" },
    { type: "expense", amount: 1200, category: "Health", date: day(16), status: "Completed" },
    { type: "income", amount: 58000, category: "Salary", date: monthBack(1), status: "Completed" },
    { type: "expense", amount: 21000, category: "Rent", date: monthBack(1, 8), status: "Paid" },
    { type: "income", amount: 55000, category: "Salary", date: monthBack(2), status: "Completed" },
    { type: "expense", amount: 26400, category: "Shopping", date: monthBack(2, 12), status: "Paid" },
    { type: "income", amount: 51000, category: "Salary", date: monthBack(3), status: "Completed" },
    { type: "expense", amount: 19800, category: "Travel", date: monthBack(3, 15), status: "Paid" },
    { type: "income", amount: 49000, category: "Salary", date: monthBack(4), status: "Completed" },
    { type: "expense", amount: 24500, category: "Groceries", date: monthBack(4, 18), status: "Paid" },
    { type: "income", amount: 47000, category: "Salary", date: monthBack(5), status: "Completed" },
    { type: "expense", amount: 22200, category: "Utilities", date: monthBack(5, 20), status: "Paid" },
  ];

  return rows.map((r, i) => ({ ...r, id: `seed-${i}` }));
}

export function summarize(transactions: Transaction[]) {
  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + t.amount, 0);
  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + t.amount, 0);
  return { income, expense, balance: income - expense, savings: income - expense };
}

export function currentMonthExpense(transactions: Transaction[]) {
  const now = new Date();
  return transactions
    .filter((t) => {
      const d = new Date(t.date);
      return (
        t.type === "expense" &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    })
    .reduce((s, t) => s + t.amount, 0);
}

export function monthlySeries(transactions: Transaction[], months = 6) {
  const now = new Date();
  const buckets: { month: string; income: number; expense: number }[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({
      month: d.toLocaleString("en-US", { month: "short" }),
      income: 0,
      expense: 0,
    });
  }
  transactions.forEach((t) => {
    const d = new Date(t.date);
    const diff =
      (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
    if (diff >= 0 && diff < months) {
      const bucket = buckets[months - 1 - diff];
      if (!bucket) return;
      if (t.type === "income") bucket.income += t.amount;
      else bucket.expense += t.amount;

    }
  });
  return buckets;
}

export function categoryBreakdown(transactions: Transaction[]) {
  const map = new Map<string, number>();
  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => map.set(t.category, (map.get(t.category) ?? 0) + t.amount));
  return [...map.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export function toCSV(transactions: Transaction[]) {
  const header = "Date,Type,Category,Amount,Status,Note";
  const rows = transactions.map((t) =>
    [t.date, t.type, t.category, t.amount, t.status, (t.note ?? "").replace(/,/g, " ")].join(","),
  );
  return [header, ...rows].join("\n");
}

export function downloadCSV(transactions: Transaction[]) {
  const blob = new Blob([toCSV(transactions)], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `transactions-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
