import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest, NextResponse } from "next/server";

const intlMiddleware = createMiddleware(routing);

export default function proxy(req: NextRequest) {
  // Locale-neutral sign-in — preserve language from callbackUrl or cookie fallback
  if (req.nextUrl.pathname === "/account/login") {
    const callbackUrl = req.nextUrl.searchParams.get("callbackUrl") ?? "";
    let locale = "it";

    if (callbackUrl) {
      // callbackUrl can be absolute (https://domain.com/en/...) or relative (/en/...)
      try {
        const pathname = callbackUrl.startsWith("http")
          ? new URL(callbackUrl).pathname
          : callbackUrl;
        if (pathname.startsWith("/en")) locale = "en";
      } catch {}
    } else {
      // No callbackUrl (e.g. OAuth error redirect) — fall back to cookie set by prior visits
      if (req.cookies.get("NEXT_LOCALE")?.value === "en") locale = "en";
    }

    const newUrl = req.nextUrl.clone();
    newUrl.pathname = `/${locale}/account/login`;
    return NextResponse.redirect(newUrl);
  }

  const response = intlMiddleware(req);

  // Persist the current locale in a cookie so auth redirects (which have no callbackUrl)
  // can restore the correct language.
  const localeFromPath = req.nextUrl.pathname.startsWith("/en") ? "en" : "it";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (response as any)?.cookies?.set?.("NEXT_LOCALE", localeFromPath, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax" as const,
  });

  return response;
}

export const config = {
  matcher: [
    "/account/login",
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
