import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getLocale } from "next-intl/server";
import Link from "next/link";
import Image from "next/image";
import { Package, MapPin, CreditCard, User, Truck, Receipt } from "lucide-react";
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
      items: {
        include: {
          variant: {
            include: {
              product: {
                include: { images: { orderBy: { position: "asc" }, take: 1 } },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const t = {
    title: isIt ? "I miei ordini" : "My orders",
    noOrders: isIt ? "Nessun ordine ancora." : "No orders yet.",
    goShop: isIt ? "Vai allo shop" : "Go to shop",
    products: isIt ? "Prodotti" : "Products",
    shipping: isIt ? "Spedizione" : "Shipping",
    customer: isIt ? "Cliente" : "Customer",
    payment: isIt ? "Pagamento" : "Payment",
    summary: isIt ? "Riepilogo" : "Summary",
    subtotal: isIt ? "Subtotale" : "Subtotal",
    vat: isIt ? "IVA (22%)" : "VAT (22%)",
    shippingCost: isIt ? "Spedizione" : "Shipping",
    total: isIt ? "Totale" : "Total",
    tracking: isIt ? "Tracciamento" : "Tracking",
    notes: isIt ? "Note" : "Notes",
    free: isIt ? "Gratis" : "Free",
    size: isIt ? "Taglia" : "Size",
    color: isIt ? "Colore" : "Color",
    qty: isIt ? "Q.tà" : "Qty",
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">{t.title}</h1>
          <p className="text-sm text-stone-400 mt-0.5">{session.user.email}</p>
        </div>
        <AccountSignOut locale={locale} />
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 text-stone-400">
          <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>{t.noOrders}</p>
          <Link
            href={`/${locale}/scarpe`}
            className="mt-4 inline-block text-sm font-medium text-stone-900 underline underline-offset-2"
          >
            {t.goShop}
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {orders.map((order) => {
            const date = new Date(order.createdAt).toLocaleDateString(isIt ? "it-IT" : "en-GB", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            });
            const statusLabel = STATUS_LABELS[order.status]?.[locale as "it" | "en"] ?? order.status;
            const statusColor = STATUS_COLORS[order.status] ?? "bg-stone-100 text-stone-600";

            return (
              <div key={order.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
                {/* Header */}
                <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-mono text-xs text-stone-400">#{order.id.slice(-8).toUpperCase()}</span>
                    <span className="text-xs text-stone-500">{date}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${statusColor}`}>
                      {statusLabel}
                    </span>
                    <span className="text-base font-bold text-stone-900">
                      €{(order.totalCents / 100).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="px-5 py-4 border-b border-stone-100">
                  <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 uppercase tracking-wide mb-3">
                    <Package className="w-3.5 h-3.5" />
                    {t.products}
                  </div>
                  <div className="flex flex-col gap-3">
                    {order.items.map((item) => {
                      const img = item.variant.product.images[0]?.url;
                      const name = locale === "en"
                        ? item.variant.product.nameEn
                        : item.variant.product.nameIt;
                      return (
                        <div key={item.id} className="flex items-center gap-3">
                          <div className="w-14 h-14 rounded-lg bg-stone-100 overflow-hidden shrink-0 border border-stone-200">
                            {img ? (
                              <Image
                                src={img}
                                alt={name}
                                width={56}
                                height={56}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-5 h-5 text-stone-300" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-stone-900 truncate">{name}</p>
                            <p className="text-xs text-stone-500 mt-0.5">
                              {t.size}: <span className="font-medium text-stone-700">{item.variant.size}</span>
                              <span className="mx-1.5 text-stone-300">·</span>
                              {t.color}:{" "}
                              <span className="inline-flex items-center gap-1">
                                {item.variant.colorCode && (
                                  <span
                                    className="w-2.5 h-2.5 rounded-full border border-stone-200"
                                    style={{ backgroundColor: item.variant.colorCode }}
                                  />
                                )}
                                <span className="font-medium text-stone-700">{item.variant.color}</span>
                              </span>
                              <span className="mx-1.5 text-stone-300">·</span>
                              {t.qty}: <span className="font-medium text-stone-700">{item.qty}</span>
                            </p>
                          </div>
                          <span className="text-sm font-semibold text-stone-900 shrink-0">
                            €{((item.priceCents * item.qty) / 100).toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Shipping + Customer + Summary grid */}
                <div className="grid sm:grid-cols-2 gap-5 px-5 py-4 border-b border-stone-100">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">
                      <MapPin className="w-3.5 h-3.5" />
                      {t.shipping}
                    </div>
                    <div className="text-sm text-stone-700 leading-relaxed">
                      <p className="font-medium text-stone-900">
                        {order.firstName} {order.lastName}
                      </p>
                      <p>{order.addressLine1}</p>
                      {order.addressLine2 && <p>{order.addressLine2}</p>}
                      <p>
                        {order.postalCode} {order.city} ({order.province})
                      </p>
                      <p className="text-stone-500">{order.country}</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 uppercase tracking-wide mb-2">
                      <User className="w-3.5 h-3.5" />
                      {t.customer}
                    </div>
                    <div className="text-sm text-stone-700 leading-relaxed">
                      <p>{order.email}</p>
                      {order.phone && <p>{order.phone}</p>}
                    </div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 uppercase tracking-wide mt-3 mb-2">
                      <CreditCard className="w-3.5 h-3.5" />
                      {t.payment}
                    </div>
                    <p className="text-sm text-stone-700">{order.paymentMethod}</p>
                  </div>
                </div>

                {/* Summary */}
                <div className="px-5 py-4 bg-stone-50">
                  <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 uppercase tracking-wide mb-3">
                    <Receipt className="w-3.5 h-3.5" />
                    {t.summary}
                  </div>
                  <div className="flex flex-col gap-1.5 text-sm">
                    <div className="flex justify-between text-stone-600">
                      <span>{t.subtotal}</span>
                      <span>€{(order.subtotalCents / 100).toFixed(2)}</span>
                    </div>
                    {order.vatCents > 0 && (
                      <div className="flex justify-between text-stone-600">
                        <span>{t.vat}</span>
                        <span>€{(order.vatCents / 100).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-stone-600">
                      <span>
                        {t.shippingCost}
                        {order.shippingCarrier && (
                          <span className="text-stone-400 text-xs ml-1">({order.shippingCarrier})</span>
                        )}
                      </span>
                      <span>
                        {order.shippingCents === 0
                          ? t.free
                          : `€${(order.shippingCents / 100).toFixed(2)}`}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold text-stone-900 pt-2 mt-1 border-t border-stone-200">
                      <span>{t.total}</span>
                      <span>€{(order.totalCents / 100).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Tracking — order ID acts as tracking ID */}
                <div className="px-5 py-3 border-t border-stone-100 bg-blue-50/50 flex items-center gap-2 text-sm">
                  <Truck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="text-stone-600">
                    {t.tracking}:{" "}
                    <span className="font-mono font-medium text-stone-900">
                      #{order.id.slice(-8).toUpperCase()}
                    </span>
                    {order.shippingCarrier && (
                      <span className="ml-2 text-stone-400">({order.shippingCarrier})</span>
                    )}
                  </span>
                </div>

                {/* Notes */}
                {order.notes && (
                  <div className="px-5 py-3 border-t border-stone-100 text-sm">
                    <span className="text-xs font-semibold text-stone-500 uppercase tracking-wide">{t.notes}: </span>
                    <span className="text-stone-700">{order.notes}</span>
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
