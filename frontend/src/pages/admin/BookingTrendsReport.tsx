import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { fetchSummary, fetchBookingTrend, type ReportSummary, type BookingTrendPoint } from "@/services/reports";
import { DateRangeFilter, type DateRange } from "@/components/admin/DateRangeFilter";
import { Card, Badge, Button } from "@/components/common";
import { exportToCsv } from "@/utils/exportCsv";


function isoDateDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

const statusToBadge: Record<string, "success" | "warning" | "error" | "info" | "neutral"> = {
  confirmed: "success",
  pending: "warning",
  checked_in: "info",
  completed: "neutral",
  cancelled: "error",
};

export function BookingTrendsReport() {
  const [range, setRange] = useState<DateRange>({
    startDate: isoDateDaysAgo(30),
    endDate: isoDateDaysAgo(0),
  });
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [trend, setTrend] = useState<BookingTrendPoint[]>([]);
  const [loading, setLoading] = useState(true);

  function loadData() {
    setLoading(true);
    Promise.all([fetchSummary(range.startDate, range.endDate), fetchBookingTrend(range.startDate, range.endDate)]).then(
      ([summaryRes, trendRes]) => {
        if (summaryRes.success) setSummary(summaryRes);
        if (trendRes.success) setTrend(trendRes.trend);
        setLoading(false);
      }
    );
  }
  function handleExport() {
    exportToCsv(
      `booking-trends-${range.startDate}-to-${range.endDate}.csv`,
      trend.map((point) => ({ date: point.date, bookings: point.count }))
    );
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl text-primary">Booking Trends</h1>

      <DateRangeFilter range={range} onChange={setRange} onApply={loadData} />
      <div className="mb-6">
        <Button onClick={handleExport} variant="secondary" disabled={trend.length === 0}>
          Export CSV
        </Button>
      </div>

      {loading ? (
        <p className="text-neutral-700">Loading booking trends...</p>
      ) : (
        <>
          <Card className="mb-6">
            <h3 className="mb-3 font-heading text-lg text-neutral-900">By Status</h3>
            <div className="flex flex-wrap gap-3">
              {Object.entries(summary?.bookingsByStatus ?? {}).map(([status, count]) => (
                <Badge key={status} status={statusToBadge[status] ?? "neutral"}>
                  {status.replace("_", " ")}: {count}
                </Badge>
              ))}
            </div>
          </Card>

          <Card>
            <h3 className="mb-4 font-heading text-lg text-neutral-900">Bookings Over Time</h3>
            {trend.length === 0 ? (
              <p className="text-neutral-700">No bookings in this date range.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#C9952C" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Card>
        </>
      )}
    </div>
  );
}