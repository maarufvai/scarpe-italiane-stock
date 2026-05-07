import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  // Locale-neutral sign-in redirect — NextAuth always sends here on auth error.
  // Extract locale from callbackUrl so the user stays in their chosen language.
  if (req.nextUrl.pathname === "/account/login") {
    const callbackUrl = req.nextUrl.searchParams.get("callbackUrl") ?? "";
    const locale = callbackUrl.startsWith("/en") ? "en" : "it";
    const newUrl = req.nextUrl.clone();
    newUrl.pathname = `/${locale}/account/login`;
    return NextResponse.redirect(newUrl);
  }
}

export const config = {
  matcher: ["/account/login"],
};
