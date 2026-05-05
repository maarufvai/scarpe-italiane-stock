"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Eye, EyeOff } from "lucide-react";

const labels = {
  it: {
    title: "Accedi",
    email: "Email",
    password: "Password",
    submit: "Accedi",
    noAccount: "Non hai un account?",
    register: "Registrati",
    orWith: "oppure",
    google: "Continua con Google",
    error: "Email o password errati",
    processing: "Accesso in corso...",
  },
  en: {
    title: "Sign in",
    email: "Email",
    password: "Password",
    submit: "Sign in",
    noAccount: "Don't have an account?",
    register: "Sign up",
    orWith: "or",
    google: "Continue with Google",
    error: "Invalid email or password",
    processing: "Signing in...",
  },
} as const;

export default function LoginPage() {
  const pathname = usePathname();
  const locale = pathname.startsWith("/en") ? "en" : "it";
  const l = labels[locale];
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? `/${locale}/account/ordini`;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.ok) {
      router.push(redirect);
      router.refresh();
    } else {
      setError(l.error);
    }
  }

  async function loginGoogle() {
    setGoogleLoading(true);
    await signIn("google", { callbackUrl: redirect });
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-stone-900">{l.title}</h1>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 flex flex-col gap-4">
          {/* Google */}
          <button
            type="button"
            onClick={loginGoogle}
            disabled={googleLoading}
            className="flex items-center justify-center gap-3 border border-stone-200 rounded-xl py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors disabled:opacity-50"
          >
            {googleLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <svg viewBox="0 0 24 24" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
            )}
            {l.google}
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-stone-200" />
            <span className="text-xs text-stone-400">{l.orWith}</span>
            <div className="flex-1 h-px bg-stone-200" />
          </div>

          <form onSubmit={submit} className="flex flex-col gap-3">
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
                  autoComplete="current-password"
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
          {l.noAccount}{" "}
          <Link href={`/${locale}/account/registrati`} className="text-stone-900 font-semibold underline underline-offset-2">
            {l.register}
          </Link>
        </p>
      </div>
    </div>
  );
}
