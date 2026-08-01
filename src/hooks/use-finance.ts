import { useCallback, useEffect, useState } from "react";
import {
  SESSION_KEY,
  TX_KEY,
  seedTransactions,
  type SessionUser,
  type Transaction,
} from "@/lib/finance";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(TX_KEY);
    if (stored) {
      setTransactions(read<Transaction[]>(TX_KEY, []));
    } else {
      const seeded = seedTransactions();
      window.localStorage.setItem(TX_KEY, JSON.stringify(seeded));
      setTransactions(seeded);
    }
    setHydrated(true);
  }, []);

  const persist = useCallback((next: Transaction[]) => {
    setTransactions(next);
    window.localStorage.setItem(TX_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event("pet:tx-updated"));
  }, []);

  const addTransaction = useCallback(
    (tx: Omit<Transaction, "id">) => {
      const next = [{ ...tx, id: crypto.randomUUID() }, ...transactions];
      persist(next);
    },
    [transactions, persist],
  );

  const deleteTransaction = useCallback(
    (id: string) => persist(transactions.filter((t) => t.id !== id)),
    [transactions, persist],
  );

  return { transactions, hydrated, addTransaction, deleteTransaction };
}

export function useSession() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setUser(read<SessionUser | null>(SESSION_KEY, null));
    setHydrated(true);
  }, []);

  const login = useCallback((next: SessionUser) => {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(next));
    setUser(next);
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem(SESSION_KEY);
    setUser(null);
  }, []);

  return { user, hydrated, login, logout };
}
