import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";
import { NextRequest, NextResponse } from "next/server";

const intlMiddleware = createMiddleware(routing);

export default function proxy(req: NextRequest) {
  // Locale-neutral sign-in — preserve language from callbackUrl
  if (req.nextUrl.pathname === "/account/login") {
    const callbackUrl = req.nextUrl.searchParams.get("callbackUrl") ?? "";
    const locale = callbackUrl.startsWith("/en") ? "en" : "it";
    const newUrl = req.nextUrl.clone();
    newUrl.pathname = `/${locale}/account/login`;
    return NextResponse.redirect(newUrl);
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: [
    "/account/login",
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};
