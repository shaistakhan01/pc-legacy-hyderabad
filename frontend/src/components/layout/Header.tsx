import { Button } from "@/components/common";

// Customer-facing top navigation — design doc §3.1.A.
export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-surface">
      <div className="mx-auto flex max-w-content items-center justify-between px-6 py-4">

        {/* Logo */}
        <span className="font-heading text-xl text-primary">
          PC Legacy Hyderabad
        </span>

        {/* Center nav — hidden on mobile */}
        <nav className="hidden gap-6 text-sm font-medium text-neutral-700 md:flex">
          <a href="/rooms"    className="hover:text-primary transition-colors">Rooms</a>
          <a href="/dining"   className="hover:text-primary transition-colors">Dining</a>
          <a href="/events"   className="hover:text-primary transition-colors">Events</a>
          <a href="/meetings" className="hover:text-primary transition-colors">Meetings</a>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <a
            href="/account/bookings"
            className="hidden text-sm font-medium text-neutral-700 hover:text-primary transition-colors md:inline"
          >
            My Bookings
          </a>
          <Button size="sm">Book Now</Button>
        </div>

      </div>
    </header>
  );
}