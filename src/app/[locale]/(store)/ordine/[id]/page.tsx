import { prisma } from "@/lib/prisma";
import { getLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Bookmark } from "lucide-react";

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const locale = await getLocale();

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { variant: { include: { product: true } } } } },
  });

  if (!order) notFound();

  const isIt = locale === "it";

  return (
    <div className="max-w-lg mx-auto px-4 py-16 flex flex-col items-center gap-6 text-center">
      <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
        <CheckCircle className="w-8 h-8 text-emerald-600" />
      </div>

      <div>
        <h1 className="text-2xl font-bold text-stone-900">
          {isIt ? "Ordine confermato!" : "Order confirmed!"}
        </h1>
        <p className="text-stone-500 mt-1 text-sm">
          {isIt ? "ID ordine / tracciamento:" : "Order / tracking ID:"}
        </p>
        <p className="text-2xl font-mono font-bold text-stone-900 tracking-wider mt-1 select-all">
          #{order.id.slice(-8).toUpperCase()}
        </p>
        {order.shippingCarrier && (
          <p className="text-xs text-stone-400 mt-1">
            {isIt ? "Corriere" : "Carrier"}: {order.shippingCarrier}
          </p>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 p-5 w-full text-left flex flex-col gap-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-stone-400">
          {isIt ? "Riepilogo" : "Summary"}
        </p>
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm text-stone-700">
            <span>
              {locale === "en" ? item.variant.product.nameEn : item.variant.product.nameIt}
              {" "}<span className="text-stone-400">×{item.qty}</span>
              {" "}({item.variant.size} / {item.variant.color})
            </span>
            <span className="font-medium">€{(item.priceCents * item.qty / 100).toFixed(2)}</span>
          </div>
        ))}
        <div className="border-t border-stone-100 pt-3 flex flex-col gap-1 text-sm">
          {order.vatCents > 0 && (
            <div className="flex justify-between text-stone-500">
              <span>{isIt ? "IVA (22%)" : "VAT (22%)"}</span>
              <span>€{(order.vatCents / 100).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-stone-900">
            <span>{isIt ? "Totale" : "Total"}</span>
            <span>€{(order.totalCents / 100).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Guest-only bookmark hint (no userId on order = guest checkout) */}
      {!order.userId && (
        <div className="w-full bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-start gap-3 text-left">
          <Bookmark className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-900 leading-relaxed">
            {isIt
              ? "Salva questo link per consultare lo stato dell'ordine e il tracciamento. Se crei un account con la stessa email, l'ordine apparirà automaticamente nella tua area personale."
              : "Save this link to check order status and tracking. If you create an account with the same email, this order will automatically appear in your account."}
          </p>
        </div>
      )}

      <p className="text-sm text-stone-500">
        {isIt
          ? `Conferma inviata a ${order.email}`
          : `Confirmation sent to ${order.email}`}
      </p>

      <Link
        href={`/${locale}`}
        className="bg-stone-900 hover:bg-stone-700 text-white font-medium px-6 py-3 rounded-full transition-colors text-sm"
      >
        {isIt ? "Torna alla home" : "Back to home"}
      </Link>
    </div>
  );
}
