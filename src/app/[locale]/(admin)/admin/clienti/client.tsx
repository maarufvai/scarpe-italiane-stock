"use client";

import { useState, useEffect, useCallback } from "react";
import { useAdminLocale } from "@/lib/use-admin-locale";
import { Loader2, ChevronUp, ChevronDown, Users } from "lucide-react";
import Image from "next/image";

type Customer = {
  id: string;
  name: string;
  email: string;
  image: string | null;
  createdAt: string;
  orderCount: number;
  totalSpentCents: number;
  shoeCount: number;
};

type SortKey = "name" | "email" | "orderCount" | "totalSpentCents" | "shoeCount" | "createdAt";

const cols: { key: SortKey; labelIt: string; labelEn: string; align?: string }[] = [
  { key: "name", labelIt: "Nome", labelEn: "Name" },
  { key: "email", labelIt: "Email", labelEn: "Email" },
  { key: "orderCount", labelIt: "Ordini", labelEn: "Orders", align: "right" },
  { key: "shoeCount", labelIt: "Paia acquistate", labelEn: "Shoes bought", align: "right" },
  { key: "totalSpentCents", labelIt: "Spesa totale", labelEn: "Total spent", align: "right" },
  { key: "createdAt", labelIt: "Registrato", labelEn: "Joined", align: "right" },
];

export function CustomersClient() {
  const locale = useAdminLocale();
  const isIt = locale === "it";

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/admin/customers?sort=${sortKey}&dir=${sortDir}`);
    const data = await res.json();
    setCustomers(data.customers ?? []);
    setLoading(false);
  }, [sortKey, sortDir]);

  useEffect(() => { load(); }, [load]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ChevronDown className="w-3 h-3 opacity-20" />;
    return sortDir === "asc"
      ? <ChevronUp className="w-3 h-3 text-stone-900" />
      : <ChevronDown className="w-3 h-3 text-stone-900" />;
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">
            {isIt ? "Clienti" : "Customers"}
          </h1>
          <p className="text-sm text-stone-400 mt-0.5">
            {customers.length} {isIt ? "clienti registrati" : "registered customers"}
          </p>
        </div>
        <Users className="w-8 h-8 text-stone-300" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-stone-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : customers.length === 0 ? (
        <p className="text-stone-400 text-center py-20">
          {isIt ? "Nessun cliente ancora." : "No customers yet."}
        </p>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100">
                {cols.map((col) => (
                  <th
                    key={col.key}
                    className={`px-4 py-3 text-xs font-semibold uppercase tracking-widest text-stone-400 cursor-pointer hover:text-stone-700 select-none ${col.align === "right" ? "text-right" : "text-left"}`}
                    onClick={() => toggleSort(col.key)}
                  >
                    <span className="inline-flex items-center gap-1">
                      {isIt ? col.labelIt : col.labelEn}
                      <SortIcon col={col.key} />
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {customers.map((c, i) => (
                <tr
                  key={c.id}
                  className={`border-b border-stone-50 hover:bg-stone-50 transition-colors ${i === customers.length - 1 ? "border-b-0" : ""}`}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {c.image ? (
                        <Image src={c.image} alt={c.name} width={28} height={28} className="rounded-full shrink-0" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-stone-200 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-stone-500">
                            {c.name?.[0]?.toUpperCase() ?? "?"}
                          </span>
                        </div>
                      )}
                      <span className="font-medium text-stone-800 truncate max-w-[160px]">{c.name || "—"}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-stone-500 truncate max-w-[200px]">{c.email}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-semibold text-stone-800">{c.orderCount}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-semibold text-stone-800">{c.shoeCount}</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-semibold text-stone-900">€{(c.totalSpentCents / 100).toFixed(2)}</span>
                  </td>
                  <td className="px-4 py-3 text-right text-stone-400 text-xs">
                    {new Date(c.createdAt).toLocaleDateString(isIt ? "it-IT" : "en-GB")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
