import { useEffect, useState } from "react";
import { fetchSummary, type ReportSummary } from "@/services/reports";
import { DateRangeFilter, type DateRange } from "@/components/admin/DateRangeFilter";
import { Card, Badge } from "@/components/common";

function isoDateDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

const moduleLabels: Record<string, string> = {
  room: "Rooms",
  restaurant: "Dining",
  banquet: "Events",
  conference: "Meetings",
};

export function DashboardOverview() {
  const [range, setRange] = useState<DateRange>({
    startDate: isoDateDaysAgo(30),
    endDate: isoDateDaysAgo(0),
  });
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(true);

  function loadSummary() {
    setLoading(true);
    fetchSummary(range.startDate, range.endDate).then((res) => {
      if (res.success) setSummary(res);
      setLoading(false);
    });
  }

  useEffect(() => {
    loadSummary();
  }, []);

  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl text-primary">Dashboard</h1>

      <DateRangeFilter range={range} onChange={setRange} onApply={loadSummary} />

      {loading ? (
        <p className="text-neutral-700">Loading summary...</p>
      ) : summary ? (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <p className="text-xs text-neutral-700">Total Revenue</p>
              <p className="text-2xl font-semibold text-primary">₹{summary.totalRevenue}</p>
            </Card>
            <Card>
              <p className="text-xs text-neutral-700">Total Bookings</p>
              <p className="text-2xl font-semibold text-primary">{summary.totalBookings}</p>
            </Card>
            <Card>
              <p className="text-xs text-neutral-700">Confirmed</p>
              <p className="text-2xl font-semibold text-success">
                {summary.bookingsByStatus.confirmed ?? 0}
              </p>
            </Card>
            <Card>
              <p className="text-xs text-neutral-700">Cancelled</p>
              <p className="text-2xl font-semibold text-error">
                {summary.bookingsByStatus.cancelled ?? 0}
              </p>
            </Card>
          </div>

          <h2 className="mb-3 font-heading text-lg text-neutral-900">By Module</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Object.entries(moduleLabels).map(([key, label]) => (
              <Card key={key}>
                <div className="flex items-center justify-between">
                  <p className="font-medium text-neutral-900">{label}</p>
                  <Badge status="info">{summary.bookingsByModule[key] ?? 0} bookings</Badge>
                </div>
                <p className="mt-2 text-lg font-semibold text-primary">
                  ₹{summary.revenueByModule[key] ?? 0}
                </p>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <p className="text-neutral-700">No data available.</p>
      )}
    </div>
  );
}