"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCart, cartTotals } from "@/lib/cart-store";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { Package, ChevronLeft, Loader2, CreditCard, AlertTriangle } from "lucide-react";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const labels = {
  it: {
    title: "Checkout", back: "Torna al carrello",
    customerInfo: "Informazioni cliente",
    firstName: "Nome *", lastName: "Cognome *",
    email: "Email *", phone: "Telefono",
    shippingAddress: "Indirizzo di spedizione",
    address: "Indirizzo *", city: "Città *",
    province: "Provincia *", postalCode: "CAP *",
    notes: "Note ordine",
    orderSummary: "Riepilogo ordine",
    subtotal: "Subtotale", vat: "IVA (22%)",
    shipping: "Spedizione", free: "Gratuita", total: "Totale",
    payment: "Pagamento",
    payStripe: "Paga con carta", payPaypal: "Paga con PayPal",
    processing: "Elaborazione...",
    cartEmpty: "Il carrello è vuoto.",
    vatNote: "IVA 22% inclusa",
    stockIssue: "Alcuni prodotti nel carrello non sono più disponibili in quantità sufficiente. Torna al carrello per risolvere.",
    backToCart: "Torna al carrello",
  },
  en: {
    title: "Checkout", back: "Back to cart",
    customerInfo: "Customer information",
    firstName: "First name *", lastName: "Last name *",
    email: "Email *", phone: "Phone",
    shippingAddress: "Shipping address",
    address: "Address *", city: "City *",
    province: "Province *", postalCode: "Postal code *",
    notes: "Order notes",
    orderSummary: "Order summary",
    subtotal: "Subtotal", vat: "VAT (22%)",
    shipping: "Shipping", free: "Free", total: "Total",
    payment: "Payment",
    payStripe: "Pay with card", payPaypal: "Pay with PayPal",
    processing: "Processing...",
    cartEmpty: "Cart is empty.",
    vatNote: "VAT 22% included",
    stockIssue: "Some items in your cart are no longer available in the requested quantity. Return to cart to resolve.",
    backToCart: "Back to cart",
  },
} as const;

type CustomerForm = {
  firstName: string; lastName: string; email: string; phone: string;
  addressLine1: string; city: string; province: string; postalCode: string; notes: string;
};

function emptyForm(): CustomerForm {
  return { firstName: "", lastName: "", email: "", phone: "", addressLine1: "", city: "", province: "", postalCode: "", notes: "" };
}

function isFormValid(f: CustomerForm) {
  return f.firstName && f.lastName && f.email && f.addressLine1 && f.city && f.province && f.postalCode;
}

export default function CheckoutPage() {
  const pathname = usePathname();
  const locale = pathname.startsWith("/en") ? "en" : "it";
  const l = labels[locale];
  const router = useRouter();
  const { items, clear } = useCart();
  const { subtotalCents, vatCents, totalCents } = cartTotals(items);
  const [form, setForm] = useState<CustomerForm>(emptyForm());
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"stripe" | "paypal">("stripe");
  const [loadingIntent, setLoadingIntent] = useState(false);
  const [stockIssues, setStockIssues] = useState(false);

  function setField(k: keyof CustomerForm, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  const formValid = isFormValid(form);

  // Validate cart stock on mount
  useEffect(() => {
    if (items.length === 0) return;
    fetch("/api/cart/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: items.map((i) => ({ variantId: i.variantId, qty: i.qty })) }),
    })
      .then((r) => r.json())
      .then((d) => setStockIssues(!d.valid));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Create Stripe intent when form valid + stripe selected
  useEffect(() => {
    if (!formValid || paymentMethod !== "stripe" || clientSecret) return;
    setLoadingIntent(true);
    fetch("/api/checkout/stripe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ totalCents, email: form.email }),
    })
      .then((r) => r.json())
      .then((d) => {
        setClientSecret(d.clientSecret);
        setPaymentIntentId(d.paymentIntentId);
      })
      .finally(() => setLoadingIntent(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formValid, paymentMethod]);

  async function createOrder(payId: string, method: "STRIPE" | "PAYPAL") {
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({ variantId: i.variantId, qty: i.qty, priceCents: i.priceCents })),
        paymentMethod: method,
        paymentId: payId,
        ...form,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      clear();
      router.push(`/${locale}/ordine/${data.orderId}`);
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center text-stone-400">
        <p>{l.cartEmpty}</p>
        <Link href={`/${locale}/scarpe`} className="text-stone-900 underline mt-2 inline-block text-sm">
          {l.back}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Link href={`/${locale}/carrello`}
        className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-900 transition-colors mb-8">
        <ChevronLeft className="w-4 h-4" />{l.back}
      </Link>

      <h1 className="text-3xl font-bold text-stone-900 mb-8">{l.title}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
        {/* Form — 3 cols */}
        <div className="lg:col-span-3 flex flex-col gap-8">
          {/* Customer info */}
          <section className="flex flex-col gap-4">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-stone-400">{l.customerInfo}</h2>
            <div className="grid grid-cols-2 gap-3">
              <CField label={l.firstName} value={form.firstName} onChange={(v) => setField("firstName", v)} />
              <CField label={l.lastName} value={form.lastName} onChange={(v) => setField("lastName", v)} />
              <CField label={l.email} value={form.email} onChange={(v) => setField("email", v)} type="email" className="col-span-2" />
              <CField label={l.phone} value={form.phone} onChange={(v) => setField("phone", v)} type="tel" className="col-span-2" />
            </div>
          </section>

          {/* Shipping */}
          <section className="flex flex-col gap-4">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-stone-400">{l.shippingAddress}</h2>
            <div className="grid grid-cols-2 gap-3">
              <CField label={l.address} value={form.addressLine1} onChange={(v) => setField("addressLine1", v)} className="col-span-2" />
              <CField label={l.city} value={form.city} onChange={(v) => setField("city", v)} />
              <div className="grid grid-cols-2 gap-3">
                <CField label={l.province} value={form.province} onChange={(v) => setField("province", v.toUpperCase())} maxLength={2} placeholder="MI" />
                <CField label={l.postalCode} value={form.postalCode} onChange={(v) => setField("postalCode", v)} />
              </div>
              <CField label={l.notes} value={form.notes} onChange={(v) => setField("notes", v)} multiline className="col-span-2" />
            </div>
          </section>

          {/* Stock issue banner */}
          {stockIssues && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-4">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-2">
                <p className="text-sm font-medium text-amber-900">{l.stockIssue}</p>
                <Link
                  href={`/${locale}/carrello`}
                  className="text-xs font-semibold text-amber-800 underline underline-offset-2"
                >
                  {l.backToCart}
                </Link>
              </div>
            </div>
          )}

          {/* Payment */}
          <section className={`flex flex-col gap-4 transition-opacity ${stockIssues ? "opacity-40 pointer-events-none select-none" : ""}`}>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-stone-400">{l.payment}</h2>

            {/* Method tabs */}
            <div className="flex gap-2">
              {(["stripe", "paypal"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => { setPaymentMethod(m); setClientSecret(null); }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    paymentMethod === m
                      ? "border-stone-900 bg-stone-900 text-white"
                      : "border-stone-200 text-stone-600 hover:border-stone-400"
                  }`}
                >
                  {m === "stripe" ? <CreditCard className="w-4 h-4" /> : <span className="text-base">🅿</span>}
                  {m === "stripe" ? l.payStripe : l.payPaypal}
                </button>
              ))}
            </div>

            {/* Stripe */}
            {paymentMethod === "stripe" && (
              <div className="bg-white rounded-2xl border border-stone-200 p-5">
                {!formValid ? (
                  <p className="text-sm text-stone-400 text-center py-4">
                    {locale === "it" ? "Compila i dati sopra per procedere" : "Fill in the form above to continue"}
                  </p>
                ) : loadingIntent ? (
                  <div className="flex items-center justify-center py-6 gap-2 text-stone-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">{l.processing}</span>
                  </div>
                ) : clientSecret ? (
                  <Elements stripe={stripePromise} options={{ clientSecret, locale: locale === "it" ? "it" : "en" }}>
                    <StripeForm
                      clientSecret={clientSecret}
                      paymentIntentId={paymentIntentId!}
                      onSuccess={(pid) => createOrder(pid, "STRIPE")}
                      label={l.payStripe}
                      processing={l.processing}
                    />
                  </Elements>
                ) : null}
              </div>
            )}

            {/* PayPal */}
            {paymentMethod === "paypal" && (
              <div className="bg-white rounded-2xl border border-stone-200 p-5">
                {!formValid ? (
                  <p className="text-sm text-stone-400 text-center py-4">
                    {locale === "it" ? "Compila i dati sopra per procedere" : "Fill in the form above to continue"}
                  </p>
                ) : (
                  <PayPalScriptProvider options={{
                    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
                    currency: "EUR",
                  }}>
                    <PayPalButtons
                      style={{ layout: "vertical", shape: "pill" }}
                      createOrder={(_data, actions) =>
                        actions.order.create({
                          intent: "CAPTURE",
                          purchase_units: [{
                            amount: { currency_code: "EUR", value: (totalCents / 100).toFixed(2) },
                          }],
                        })
                      }
                      onApprove={async (_data, actions) => {
                        const details = await actions.order!.capture();
                        await createOrder(details.id!, "PAYPAL");
                      }}
                    />
                  </PayPalScriptProvider>
                )}
              </div>
            )}
          </section>
        </div>

        {/* Summary — 2 cols */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-stone-200 p-5 flex flex-col gap-4 sticky top-20">
            <p className="text-xs font-semibold uppercase tracking-widest text-stone-400">{l.orderSummary}</p>

            <div className="flex flex-col gap-3">
              {items.map((item) => {
                const name = locale === "en" ? item.nameEn : item.nameIt;
                return (
                  <div key={item.variantId} className="flex gap-3 items-center">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-stone-100 border border-stone-200 shrink-0 relative">
                      {item.imageUrl ? (
                        <Image src={item.imageUrl} alt={name} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-4 h-4 text-stone-300" />
                        </div>
                      )}
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-stone-700 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                        {item.qty}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-stone-800 truncate">{name}</p>
                      <p className="text-[10px] text-stone-400">{item.size} / {item.color}</p>
                    </div>
                    <p className="text-xs font-semibold text-stone-900 shrink-0">
                      €{(item.priceCents * item.qty / 100).toFixed(2)}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-stone-100 pt-3 flex flex-col gap-2 text-sm">
              <div className="flex justify-between text-stone-500">
                <span>{l.subtotal}</span><span>€{(subtotalCents / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-stone-400 text-xs">
                <span>{l.vat}</span><span>€{(vatCents / 100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-stone-500 text-xs">
                <span>{l.shipping}</span><span className="text-emerald-600">{l.free}</span>
              </div>
              <div className="flex justify-between font-bold text-stone-900 text-base border-t border-stone-100 pt-2">
                <span>{l.total}</span><span>€{(totalCents / 100).toFixed(2)}</span>
              </div>
              <p className="text-[10px] text-stone-400">{l.vatNote}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StripeForm({ clientSecret: _cs, paymentIntentId, onSuccess, label, processing }: {
  clientSecret: string; paymentIntentId: string;
  onSuccess: (pid: string) => void;
  label: string; processing: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setLoading(true);
    setError("");

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    });

    if (stripeError) {
      setError(stripeError.message ?? "Payment failed");
      setLoading(false);
      return;
    }

    onSuccess(paymentIntentId);
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <PaymentElement />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading || !stripe}
        className="flex items-center justify-center gap-2 bg-stone-900 hover:bg-stone-700 text-white font-semibold py-3.5 rounded-xl transition-colors disabled:opacity-50"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {loading ? processing : label}
      </button>
    </form>
  );
}

function CField({ label, value, onChange, type = "text", className = "", multiline, placeholder, maxLength }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; className?: string; multiline?: boolean; placeholder?: string; maxLength?: number;
}) {
  const cls = "rounded-xl border border-stone-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-stone-900 bg-stone-50 w-full";
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-xs font-medium text-stone-600">{label}</span>
      {multiline ? (
        <textarea value={value} onChange={(e) => onChange(e.target.value)}
          rows={3} className={cls + " resize-none"} placeholder={placeholder} />
      ) : (
        <input value={value} onChange={(e) => onChange(e.target.value)}
          type={type} className={cls} placeholder={placeholder} maxLength={maxLength} />
      )}
    </label>
  );
}
