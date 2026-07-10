import { useEffect, useState } from "react";
import { fetchOccupancy, type OccupancyReport as OccupancyData } from "@/services/reports";
import { DateRangeFilter, type DateRange } from "@/components/admin/DateRangeFilter";
import { Card } from "@/components/common";

function isoDateDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export function OccupancyReport() {
  const [range, setRange] = useState<DateRange>({
    startDate: isoDateDaysAgo(30),
    endDate: isoDateDaysAgo(0),
  });
  const [data, setData] = useState<OccupancyData | null>(null);
  const [loading, setLoading] = useState(true);

  function loadData() {
    setLoading(true);
    fetchOccupancy(range.startDate, range.endDate).then((res) => {
      if (res.success) setData(res);
      setLoading(false);
    });
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl text-primary">Occupancy & Utilization</h1>

      <DateRangeFilter range={range} onChange={setRange} onApply={loadData} />

      {loading ? (
        <p className="text-neutral-700">Loading occupancy data...</p>
      ) : data ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <p className="text-xs text-neutral-700">Room Occupancy Rate</p>
            <p className="text-2xl font-semibold text-primary">{data.roomOccupancyRate}%</p>
            <p className="mt-1 text-xs text-neutral-400">
              {data.bookedRoomNights} of {data.totalRooms} rooms × range nights booked
            </p>
          </Card>
          <Card>
            <p className="text-xs text-neutral-700">Restaurant Reservations</p>
            <p className="text-2xl font-semibold text-primary">{data.restaurantBookingCount}</p>
          </Card>
          <Card>
            <p className="text-xs text-neutral-700">Banquet Bookings</p>
            <p className="text-2xl font-semibold text-primary">{data.banquetBookingCount}</p>
          </Card>
          <Card>
            <p className="text-xs text-neutral-700">Conference Bookings</p>
            <p className="text-2xl font-semibold text-primary">{data.conferenceBookingCount}</p>
          </Card>
        </div>
      ) : (
        <p className="text-neutral-700">No data available.</p>
      )}
    </div>
  );
}