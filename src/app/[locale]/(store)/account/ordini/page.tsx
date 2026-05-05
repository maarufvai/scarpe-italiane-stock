import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import Link from "next/link";
import { Package } from "lucide-react";
import AccountSignOut from "./sign-out-button";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PAID: "bg-blue-100 text-blue-800",
  PROCESSING: "bg-purple-100 text-purple-800",
  SHIPPED: "bg-cyan-100 text-cyan-800",
  DELIVERED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-red-100 text-red-800",
  REFUNDED: "bg-stone-100 text-stone-600",
};

const STATUS_LABELS: Record<string, { it: string; en: string }> = {
  PENDING: { it: "In attesa", en: "Pending" },
  PAID: { it: "Pagato", en: "Paid" },
  PROCESSING: { it: "In lavorazione", en: "Processing" },
  SHIPPED: { it: "Spedito", en: "Shipped" },
  DELIVERED: { it: "Consegnato", en: "Delivered" },
  CANCELLED: { it: "Annullato", en: "Cancelled" },
  REFUNDED: { it: "Rimborsato", en: "Refunded" },
};

export default async function AccountOrdersPage() {
  const locale = await getLocale();
  const isIt = locale === "it";
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect(`/${locale}/account/login`);
  }

  const orders = await prisma.order.findMany({
    where: {
      OR: [{ userId: session.user.id }, { email: session.user.email }],
    },
    include: {
      items: { include: { variant: { include: { product: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">
            {isIt ? "I miei ordini" : "My orders"}
          </h1>
          <p className="text-sm text-stone-400 mt-0.5">{session.user.email}</p>
        </div>
        <AccountSignOut locale={locale} />
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 text-stone-400">
          <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>{isIt ? "Nessun ordine ancora." : "No orders yet."}</p>
          <Link
            href={`/${locale}/scarpe`}
            className="mt-4 inline-block text-sm font-medium text-stone-900 underline underline-offset-2"
          >
            {isIt ? "Vai allo shop" : "Go to shop"}
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => {
            const date = new Date(order.createdAt).toLocaleDateString(isIt ? "it-IT" : "en-GB");
            const statusLabel = STATUS_LABELS[order.status]?.[locale as "it" | "en"] ?? order.status;
            const statusColor = STATUS_COLORS[order.status] ?? "bg-stone-100 text-stone-600";

            return (
              <div key={order.id} className="bg-white rounded-2xl border border-stone-200 p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-mono text-xs text-stone-400">#{order.id.slice(-8).toUpperCase()}</span>
                    <span className="text-xs text-stone-400">{date}</span>
                  </div>
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${statusColor}`}>
                    {statusLabel}
                  </span>
                  <span className="text-sm font-bold text-stone-900 ml-auto">
                    €{(order.totalCents / 100).toFixed(2)}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-sm text-stone-700">
                      <span className="truncate">
                        {locale === "en" ? item.variant.product.nameEn : item.variant.product.nameIt}
                        <span className="text-stone-400 ml-1.5">×{item.qty}</span>
                        <span className="text-stone-400 ml-1">({item.variant.size} / {item.variant.color})</span>
                      </span>
                      <span className="font-medium shrink-0 ml-3">€{(item.priceCents * item.qty / 100).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {order.trackingNumber && (
                  <div className="text-xs text-stone-500 bg-stone-50 rounded-xl px-3 py-2">
                    {isIt ? "Tracking" : "Tracking"}: <span className="font-mono font-medium">{order.trackingNumber}</span>
                    {order.shippingCarrier && <span className="ml-2 text-stone-400">({order.shippingCarrier})</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
