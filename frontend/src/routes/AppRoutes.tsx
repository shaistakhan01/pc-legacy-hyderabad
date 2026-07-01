import { Routes, Route } from "react-router-dom";
import { PublicLayout } from "@/layouts/PublicLayout";
import { AdminLayout }  from "@/layouts/AdminLayout";
import { Placeholder }  from "@/pages/public/Placeholder";

// Routing skeleton — Technical Plan Phase 1.4.
//
// Three route groups:
//  1. Public routes     → PublicLayout (no auth required)
//  2. Customer routes   → PublicLayout (ProtectedRoute added in Phase 3)
//  3. Admin routes      → AdminLayout  (RoleBasedRoute added in Phase 3)
//
// All leaf components are Placeholder until their module phase is built.
// The catch-all * route MUST remain last — React Router matches top-to-bottom.
export function AppRoutes() {
  return (
    <Routes>

      {/* ── Public routes ─────────────────────────────────────────── */}
      <Route path="/" element={
        <PublicLayout><Placeholder pageName="Home" /></PublicLayout>
      } />
      <Route path="/rooms" element={
        <PublicLayout><Placeholder pageName="Room Listing" /></PublicLayout>
      } />
      <Route path="/rooms/:roomId" element={
        <PublicLayout><Placeholder pageName="Room Detail" /></PublicLayout>
      } />
      <Route path="/dining" element={
        <PublicLayout><Placeholder pageName="Restaurant & Reservations" /></PublicLayout>
      } />
      <Route path="/events" element={
        <PublicLayout><Placeholder pageName="Banquet & Events" /></PublicLayout>
      } />
      <Route path="/meetings" element={
        <PublicLayout><Placeholder pageName="Meetings & Conference" /></PublicLayout>
      } />
      <Route path="/login" element={
        <PublicLayout><Placeholder pageName="Login" /></PublicLayout>
      } />
      <Route path="/register" element={
        <PublicLayout><Placeholder pageName="Register" /></PublicLayout>
      } />

      {/* ── Customer portal routes (auth-protected in Phase 3) ────── */}
      <Route path="/account/bookings" element={
        <PublicLayout><Placeholder pageName="My Bookings" /></PublicLayout>
      } />
      <Route path="/account/bookings/:bookingId" element={
        <PublicLayout><Placeholder pageName="Booking Detail" /></PublicLayout>
      } />
      <Route path="/account/profile" element={
        <PublicLayout><Placeholder pageName="Profile & Preferences" /></PublicLayout>
      } />

      {/* ── Admin portal routes (role-protected in Phase 3) ──────── */}
      <Route path="/admin" element={
        <AdminLayout><Placeholder pageName="Admin Dashboard" /></AdminLayout>
      } />
      <Route path="/admin/rooms" element={
        <AdminLayout><Placeholder pageName="Room Management" /></AdminLayout>
      } />
      <Route path="/admin/restaurant" element={
        <AdminLayout><Placeholder pageName="Restaurant Management" /></AdminLayout>
      } />
      <Route path="/admin/banquet" element={
        <AdminLayout><Placeholder pageName="Banquet Management" /></AdminLayout>
      } />
      <Route path="/admin/conference" element={
        <AdminLayout><Placeholder pageName="Conference Management" /></AdminLayout>
      } />
      <Route path="/admin/guests" element={
        <AdminLayout><Placeholder pageName="Guests / CRM" /></AdminLayout>
      } />
      <Route path="/admin/staff" element={
        <AdminLayout><Placeholder pageName="Staff & Roles" /></AdminLayout>
      } />
      <Route path="/admin/reports" element={
        <AdminLayout><Placeholder pageName="Reports & Analytics" /></AdminLayout>
      } />
      <Route path="/admin/settings" element={
        <AdminLayout><Placeholder pageName="Settings" /></AdminLayout>
      } />

      {/* ── 404 fallback — must be last ───────────────────────────── */}
      <Route path="*" element={
        <PublicLayout><Placeholder pageName="404 — Page Not Found" /></PublicLayout>
      } />

    </Routes>
  );
}