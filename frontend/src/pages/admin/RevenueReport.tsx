import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { fetchSummary, fetchRevenueTrend, type ReportSummary, type RevenueTrendPoint } from "@/services/reports";
import { DateRangeFilter, type DateRange } from "@/components/admin/DateRangeFilter";
import { Card } from "@/components/common";

function isoDateDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export function RevenueReport() {
  const [range, setRange] = useState<DateRange>({
    startDate: isoDateDaysAgo(30),
    endDate: isoDateDaysAgo(0),
  });
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [trend, setTrend] = useState<RevenueTrendPoint[]>([]);
  const [loading, setLoading] = useState(true);

  function loadData() {
    setLoading(true);
    Promise.all([fetchSummary(range.startDate, range.endDate), fetchRevenueTrend(range.startDate, range.endDate)]).then(
      ([summaryRes, trendRes]) => {
        if (summaryRes.success) setSummary(summaryRes);
        if (trendRes.success) setTrend(trendRes.trend);
        setLoading(false);
      }
    );
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl text-primary">Revenue Report</h1>

      <DateRangeFilter range={range} onChange={setRange} onApply={loadData} />

      {loading ? (
        <p className="text-neutral-700">Loading revenue data...</p>
      ) : (
        <>
          <Card className="mb-6">
            <p className="text-xs text-neutral-700">Total Revenue in Range</p>
            <p className="text-2xl font-semibold text-primary">₹{summary?.totalRevenue ?? 0}</p>
          </Card>

          <Card>
            <h3 className="mb-4 font-heading text-lg text-neutral-900">Revenue Over Time</h3>
            {trend.length === 0 ? (
              <p className="text-neutral-700">No revenue in this date range.</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#0F3D3E" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Card>
        </>
      )}
    </div>
  );
}