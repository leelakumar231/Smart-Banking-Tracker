import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Download, Minus, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell, TypeBadge } from "@/components/app-shell";
import { TransactionDialog } from "@/components/transaction-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSession, useTransactions } from "@/hooks/use-finance";
import { downloadCSV, formatINR, type TxType } from "@/lib/finance";

export const Route = createFileRoute("/transactions")({
  head: () => ({
    meta: [
      { title: "Transactions — FinTrack Expense Tracker" },
      { name: "description", content: "Search, filter and manage every income and expense entry you have recorded." },
      { property: "og:title", content: "Transactions — FinTrack Expense Tracker" },
      { property: "og:description", content: "Search, filter and manage every income and expense entry you have recorded." },
    ],
  }),
  component: TransactionsPage,
});

function TransactionsPage() {
  const navigate = useNavigate();
  const { user, hydrated } = useSession();
  const { transactions, addTransaction, deleteTransaction } = useTransactions();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | TxType>("all");
  const [dialogType, setDialogType] = useState<TxType | null>(null);

  useEffect(() => {
    if (hydrated && !user) navigate({ to: "/login" });
  }, [hydrated, user, navigate]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return transactions
      .filter((t) => (filter === "all" ? true : t.type === filter))
      .filter((t) =>
        q
          ? t.category.toLowerCase().includes(q) ||
            (t.note ?? "").toLowerCase().includes(q) ||
            t.date.includes(q)
          : true,
      )
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [transactions, query, filter]);

  return (
    <AppShell
      title="Transactions"
      subtitle={`${rows.length} entries`}
      actions={
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={() => downloadCSV(rows)}
          aria-label="Export CSV"
        >
          <Download className="size-5" />
        </Button>
      }
    >
      <div className="card-surface flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search category, note or date…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <SelectTrigger className="sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex gap-2">
          <Button onClick={() => setDialogType("income")}>
            <Plus className="size-4" /> Income
          </Button>
          <Button variant="outline" onClick={() => setDialogType("expense")}>
            <Minus className="size-4" /> Expense
          </Button>
        </div>
      </div>

      <div className="card-surface mt-5 overflow-x-auto p-5">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="pb-3 pr-4 font-medium">Date</th>
              <th className="pb-3 pr-4 font-medium">Category</th>
              <th className="pb-3 pr-4 font-medium">Note</th>
              <th className="pb-3 pr-4 font-medium">Amount</th>
              <th className="pb-3 pr-4 font-medium">Type</th>
              <th className="pb-3 pr-4 font-medium">Status</th>
              <th className="pb-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {rows.map((t) => (
              <tr
                key={t.id}
                className="border-b border-border/60 transition-colors last:border-0 hover:bg-secondary/60"
              >
                <td className="py-3 pr-4 text-muted-foreground">{t.date}</td>
                <td className="py-3 pr-4 font-medium">{t.category}</td>
                <td className="py-3 pr-4 text-muted-foreground">{t.note ?? "—"}</td>
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
                <td className="py-3 pr-4">
                  <span className="rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
                    {t.status}
                  </span>
                </td>
                <td className="py-3 text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Delete transaction"
                    onClick={() => {
                      deleteTransaction(t.id);
                      toast.success("Transaction deleted");
                    }}
                  >
                    <Trash2 className="size-4 text-expense" />
                  </Button>
                </td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-muted-foreground">
                  No transactions match your filters.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <TransactionDialog
        type={dialogType ?? "expense"}
        open={dialogType !== null}
        onOpenChange={(open) => !open && setDialogType(null)}
        onSubmit={(tx) => {
          addTransaction(tx);
          toast.success("Transaction added");
        }}
      />
    </AppShell>
  );
}
