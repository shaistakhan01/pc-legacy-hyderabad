import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, Badge } from "@/components/common";

interface PaymentRow {
  id: string;
  gateway_reference: string | null;
  status: string;
  amount: number;
  method: string | null;
  created_at: string;
  bookings: {
    reference_number: string;
    module_type: string;
  } | null;
}

const statusToBadge: Record<string, "success" | "warning" | "error" | "info" | "neutral"> = {
  success: "success",
  initiated: "warning",
  failed: "error",
  refunded: "info",
};

// payment_transactions is staff/admin-only per Phase 2.3 RLS.
export function PaymentsOverview() {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("payment_transactions")
      .select(`id, gateway_reference, status, amount, method, created_at, bookings ( reference_number, module_type )`)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setPayments(data as unknown as PaymentRow[]);
        setLoading(false);
      });
  }, []);

  const totalRevenue = payments
    .filter((p) => p.status === "success")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  if (loading) {
    return <div className="p-16 text-center text-neutral-700">Loading payments...</div>;
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl text-primary">Payments Overview</h1>
        <Card className="px-6 py-3">
          <p className="text-xs text-neutral-700">Total Revenue (successful payments)</p>
          <p className="text-2xl font-semibold text-primary">₹{totalRevenue}</p>
        </Card>
      </div>

      <div className="flex flex-col gap-3">
        {payments.map((p) => (
          <Card key={p.id}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-neutral-900">
                  {p.bookings?.module_type ?? "—"} · Ref: {p.bookings?.reference_number ?? "—"}
                </p>
                <p className="text-xs text-neutral-400">
                  {p.method ?? "unknown"} · {p.gateway_reference ?? "no reference"} ·{" "}
                  {new Date(p.created_at).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge status={statusToBadge[p.status] ?? "neutral"}>{p.status}</Badge>
                <span className="font-semibold text-primary">₹{p.amount}</span>
              </div>
            </div>
          </Card>
        ))}
        {payments.length === 0 && <p className="text-neutral-700">No payments recorded yet.</p>}
      </div>
    </div>
  );
}