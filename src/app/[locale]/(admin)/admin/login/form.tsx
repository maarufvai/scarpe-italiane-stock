"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Loader2, Eye, EyeOff } from "lucide-react";

export function LoginForm() {
  const locale = useLocale();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.ok) {
      router.push(`/${locale}/admin/prodotti`);
      router.refresh();
    } else {
      setError("Email o password errati");
    }
  }

  return (
    <form onSubmit={submit} className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-stone-700">Email</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          className="rounded-lg border border-stone-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-stone-900 bg-stone-50"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-stone-700">Password</span>
        <div className="relative">
          <input
            type={showPw ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full rounded-lg border border-stone-200 px-3 py-2.5 pr-10 text-sm outline-none focus:ring-2 focus:ring-stone-900 bg-stone-50"
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

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-700 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 text-sm mt-1"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        Accedi
      </button>
    </form>
  );
}
