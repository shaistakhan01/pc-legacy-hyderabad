const navItems = [
  { label: "Dashboard",                href: "/admin" },
  { label: "Room & Booking Management", href: "/admin/rooms" },
  { label: "Restaurant & Tables",       href: "/admin/restaurant" },
  { label: "Banquet & Events",          href: "/admin/banquet" },
  { label: "Conference & Meetings",     href: "/admin/conference" },
  { label: "Guests / CRM",             href: "#" },
{ label: "Staff & Roles", href: "/admin/staff" },
  { label: "Reports & Analytics",      href: "/admin/reports" },
  { label: "Settings",                 href: "#" },
  { label: "Payments",                 href: "/admin/payments" },
  { label: "Audit Log", href: "/admin/audit-log" },



];

// Admin persistent left sidebar — design doc §3.1.B.
// Collapsible to icon-only rail is a later refinement; mobile drawer
// behavior is deferred until real admin pages exist (Phase 9).
export function Sidebar() {
  return (
    <aside className="hidden w-64 flex-shrink-0 border-r border-neutral-200 bg-surface md:flex md:flex-col">
      <div className="border-b border-neutral-200 p-6">
        <span className="font-heading text-lg text-primary">PC Legacy Admin</span>
      </div>
      <nav className="flex flex-col gap-1 p-3">
        {navItems.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="rounded-sm px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-primary"
          >
            {item.label}
          </a>
        ))}
      </nav>
    </aside>
  );
}