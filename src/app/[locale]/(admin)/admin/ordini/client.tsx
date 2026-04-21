"use client";

import { useState, useEffect, useCallback } from "react";
import { useAdminLocale, adminT } from "@/lib/use-admin-locale";
import { Package, ChevronDown, ChevronUp, Loader2 } from "lucide-react";

type OrderStatus = "PENDING" | "PAID" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

type Variant = { size: string; color: string };
type Product = { nameIt: string; nameEn: string };
type OrderItem = { id: string; qty: number; priceCents: number; variant: Variant & { product: Product } };

type Order = {
  id: string;
  status: OrderStatus;
  paymentMethod: string;
  paymentId: string | null;
  totalCents: number;
  vatCents: number;
  subtotalCents: number;
  shippingCents: number;
  trackingNumber: string | null;
  shippingCarrier: string | null;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  province: string;
  postalCode: string;
  notes: string | null;
  createdAt: string;
  items: OrderItem[];
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PAID: "bg-blue-100 text-blue-800",
  PROCESSING: "bg-purple-100 text-purple-800",
  SHIPPED: "bg-cyan-100 text-cyan-800",
  DELIVERED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const ALL_STATUSES: OrderStatus[] = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];

export function OrdersClient() {
  const locale = useAdminLocale();
  const t = adminT[locale];
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page) });
    if (filterStatus) params.set("status", filterStatus);
    const res = await fetch(`/api/admin/orders?${params}`);
    const data = await res.json();
    setOrders(data.orders);
    setTotal(data.total);
    setPages(data.pages);
    setLoading(false);
  }, [page, filterStatus]);

  useEffect(() => { load(); }, [load]);

  function statusLabel(s: OrderStatus) {
    const key = `status${s}` as keyof typeof t;
    return (t[key] as string) ?? s;
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">{t.orders}</h1>
          <p className="text-sm text-stone-400 mt-0.5">{total} {locale === "it" ? "ordini totali" : "total orders"}</p>
        </div>

        <select
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }}
          className="text-sm border border-stone-200 rounded-xl px-3 py-2 bg-white text-stone-700 outline-none focus:ring-2 focus:ring-stone-900"
        >
          <option value="">{t.allStatuses}</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>{statusLabel(s)}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-stone-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <p className="text-stone-400 text-center py-20">{t.noOrders}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {orders.map((order) => (
            <OrderRow
              key={order.id}
              order={order}
              locale={locale}
              t={t}
              expanded={expandedId === order.id}
              onToggle={() => setExpandedId(expandedId === order.id ? null : order.id)}
              statusLabel={statusLabel}
              onUpdated={(updated) => setOrders((prev) => prev.map((o) => o.id === updated.id ? updated : o))}
            />
          ))}
        </div>
      )}

      {pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                p === page ? "bg-stone-900 dark:bg-amber-500 text-white dark:text-stone-900" : "bg-white border border-stone-200 text-stone-700 hover:border-stone-400"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function OrderRow({ order, locale, t, expanded, onToggle, statusLabel, onUpdated }: {
  order: Order;
  locale: "it" | "en";
  t: typeof adminT["it"] | typeof adminT["en"];
  expanded: boolean;
  onToggle: () => void;
  statusLabel: (s: OrderStatus) => string;
  onUpdated: (o: Order) => void;
}) {
  const [tracking, setTracking] = useState(order.trackingNumber ?? "");
  const [carrier, setCarrier] = useState(order.shippingCarrier ?? "");
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const res = await fetch(`/api/admin/orders/${order.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, trackingNumber: tracking, shippingCarrier: carrier }),
    });
    const updated = await res.json();
    onUpdated(updated);
    setSaving(false);
  }

  const date = new Date(order.createdAt).toLocaleDateString(locale === "it" ? "it-IT" : "en-GB");

  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-stone-50 transition-colors text-left"
      >
        <Package className="w-4 h-4 text-stone-400 shrink-0" />
        <span className="font-mono text-xs text-stone-500 w-24 shrink-0">#{order.id.slice(-8).toUpperCase()}</span>
        <span className="flex-1 text-sm font-medium text-stone-800 truncate">{order.firstName} {order.lastName}</span>
        <span className="text-xs text-stone-400 w-24 shrink-0">{date}</span>
        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${STATUS_COLORS[order.status]}`}>
          {statusLabel(order.status)}
        </span>
        <span className="text-sm font-bold text-stone-900 w-20 text-right shrink-0">
          €{(order.totalCents / 100).toFixed(2)}
        </span>
        {expanded ? <ChevronUp className="w-4 h-4 text-stone-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />}
      </button>

      {expanded && (
        <div className="border-t border-stone-100 px-5 py-5 flex flex-col gap-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Items */}
            <div className="md:col-span-1 flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-stone-400">{t.items}</p>
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm text-stone-700">
                  <span className="truncate">
                    {locale === "en" ? item.variant.product.nameEn : item.variant.product.nameIt}
                    <span className="text-stone-400 ml-1">×{item.qty}</span>
                    <span className="text-stone-400 ml-1">({item.variant.size}/{item.variant.color})</span>
                  </span>
                  <span className="font-medium shrink-0 ml-2">€{(item.priceCents * item.qty / 100).toFixed(2)}</span>
                </div>
              ))}
            </div>

            {/* Address */}
            <div className="flex flex-col gap-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-stone-400">{t.shippingAddress}</p>
              <p className="text-sm text-stone-700">{order.firstName} {order.lastName}</p>
              <p className="text-sm text-stone-500">{order.addressLine1}</p>
              {order.addressLine2 && <p className="text-sm text-stone-500">{order.addressLine2}</p>}
              <p className="text-sm text-stone-500">{order.postalCode} {order.city} ({order.province})</p>
              <p className="text-sm text-stone-500">{order.email}</p>
              {order.phone && <p className="text-sm text-stone-500">{order.phone}</p>}
              {order.notes && <p className="text-xs text-stone-400 mt-1 italic">{order.notes}</p>}
            </div>

            {/* Payment + status update */}
            <div className="flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-stone-400">{t.paymentInfo}</p>
              <div className="text-sm text-stone-500 flex flex-col gap-0.5">
                <span>{order.paymentMethod}</span>
                {order.paymentId && <span className="font-mono text-xs truncate">{order.paymentId}</span>}
              </div>

              <div className="flex flex-col gap-2 mt-1">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as OrderStatus)}
                  className="text-sm border border-stone-200 rounded-xl px-3 py-2 bg-stone-50 outline-none focus:ring-2 focus:ring-stone-900"
                >
                  {ALL_STATUSES.map((s) => (
                    <option key={s} value={s}>{statusLabel(s)}</option>
                  ))}
                </select>

                <input
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  placeholder={t.carrier}
                  className="text-sm border border-stone-200 rounded-xl px-3 py-2 bg-stone-50 outline-none focus:ring-2 focus:ring-stone-900"
                />

                <input
                  value={tracking}
                  onChange={(e) => setTracking(e.target.value)}
                  placeholder={t.tracking}
                  className="text-sm border border-stone-200 rounded-xl px-3 py-2 bg-stone-50 outline-none focus:ring-2 focus:ring-stone-900"
                />

                <button
                  onClick={save}
                  disabled={saving}
                  className="flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-700 text-white text-sm font-medium py-2 rounded-xl transition-colors disabled:opacity-50"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {t.update}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
