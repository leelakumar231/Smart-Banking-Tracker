import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/hooks/use-finance";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title: "Create account — FinTrack Expense Tracker" },
      { name: "description", content: "Create your free FinTrack account and start tracking income, expenses and savings today." },
      { property: "og:title", content: "Create account — FinTrack Expense Tracker" },
      { property: "og:description", content: "Create your free FinTrack account and start tracking income, expenses and savings today." },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useSession();
  const [form, setForm] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState("");

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-hero px-5 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 flex items-center justify-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-brand text-primary-foreground">
            <Wallet className="size-5" />
          </span>
          <span className="text-base font-bold">FinTrack</span>
        </Link>

        <div className="card-surface p-7">
          <h1 className="text-2xl font-bold">Create your account</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Takes seconds — your data stays on this device.
          </p>

          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (form.password !== form.confirm) {
                setError("Passwords do not match.");
                return;
              }
              login({
                name: form.name,
                email: form.email,
                username: form.username,
                tier: "Premium",
              });
              navigate({ to: "/dashboard" });
            }}
          >
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" required value={form.name} onChange={set("name")} placeholder="Aarav Sharma" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input id="email" type="email" required value={form.email} onChange={set("email")} placeholder="you@example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" required value={form.username} onChange={set("username")} placeholder="aarav" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required value={form.password} onChange={set("password")} placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirm</Label>
                <Input id="confirm" type="password" required value={form.confirm} onChange={set("confirm")} placeholder="••••••••" />
              </div>
            </div>
            {error ? <p className="text-sm font-medium text-destructive">{error}</p> : null}
            <Button type="submit" className="w-full" size="lg">
              Create account
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
