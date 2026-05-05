"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Loader2, Eye, EyeOff } from "lucide-react";

const labels = {
  it: {
    title: "Crea account",
    name: "Nome completo",
    email: "Email",
    password: "Password",
    confirm: "Conferma password",
    submit: "Registrati",
    haveAccount: "Hai già un account?",
    login: "Accedi",
    processing: "Registrazione...",
    errorMatch: "Le password non coincidono",
    errorShort: "Password troppo corta (min 8 caratteri)",
  },
  en: {
    title: "Create account",
    name: "Full name",
    email: "Email",
    password: "Password",
    confirm: "Confirm password",
    submit: "Sign up",
    haveAccount: "Already have an account?",
    login: "Sign in",
    processing: "Creating account...",
    errorMatch: "Passwords do not match",
    errorShort: "Password too short (min 8 characters)",
  },
} as const;

export default function RegisterPage() {
  const pathname = usePathname();
  const locale = pathname.startsWith("/en") ? "en" : "it";
  const l = labels[locale];
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) { setError(l.errorShort); return; }
    if (password !== confirm) { setError(l.errorMatch); return; }

    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Errore");
      setLoading(false);
      return;
    }

    // Auto-login after register
    await signIn("credentials", { email, password, redirect: false });
    router.push(`/${locale}/account/ordini`);
    router.refresh();
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-stone-900">{l.title}</h1>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
          <form onSubmit={submit} className="flex flex-col gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-stone-600">{l.name}</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
                className="rounded-xl border border-stone-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-stone-900 bg-stone-50"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-stone-600">{l.email}</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="rounded-xl border border-stone-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-stone-900 bg-stone-50"
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-stone-600">{l.password}</span>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-stone-200 px-3 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-stone-900 bg-stone-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-stone-600">{l.confirm}</span>
              <input
                type={showPw ? "text" : "password"}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                autoComplete="new-password"
                className="rounded-xl border border-stone-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-stone-900 bg-stone-50"
              />
            </label>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-700 text-white font-medium py-2.5 rounded-xl transition-colors disabled:opacity-50 text-sm mt-1"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? l.processing : l.submit}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-stone-500">
          {l.haveAccount}{" "}
          <Link href={`/${locale}/account/login`} className="text-stone-900 font-semibold underline underline-offset-2">
            {l.login}
          </Link>
        </p>
      </div>
    </div>
  );
}
