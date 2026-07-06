import { Routes, Route } from "react-router-dom";
import { PublicLayout } from "@/layouts/PublicLayout";
import { AdminLayout }  from "@/layouts/AdminLayout";
import { Placeholder }  from "@/pages/public/Placeholder";
import { Login } from "@/pages/public/Login";
import { Register } from "@/pages/public/Register";
import { ProtectedRoute } from "@/routes/ProtectedRoute";
import { RoleBasedRoute } from "@/routes/RoleBasedRoute";
import { AcceptInvite } from "@/pages/public/AcceptInvite";
import { ForgotPassword } from "@/pages/public/ForgotPassword";
import { ResetPassword } from "@/pages/public/ResetPassword";
import { Profile } from "@/pages/account/Profile";
import { RoomListing } from "@/pages/public/RoomListing";
import { RoomDetail } from "@/pages/public/RoomDetail";
import { MyBookings } from "@/pages/account/MyBookings";
import { RoomManagement } from "@/pages/admin/RoomManagement";
import { Dining } from "@/pages/public/Dining";
import { ReserveTable } from "@/pages/public/ReserveTable";
import { RestaurantManagement } from "@/pages/admin/RestaurantManagement";
import { Events } from "@/pages/public/Events";
import { EventHallDetail } from "@/pages/public/EventHallDetail";
import { BanquetManagement } from "@/pages/admin/BanquetManagement";
import { Meetings } from "@/pages/public/Meetings";
import { ConferenceRoomDetail } from "@/pages/public/ConferenceRoomDetail";
import { ConferenceManagement } from "@/pages/admin/ConferenceManagement";


// Routing skeleton — Technical Plan Phase 1.4.
//
// Three route groups:
//  1. Public routes     → PublicLayout (no auth required)
//  2. Customer routes   → PublicLayout + ProtectedRoute (Phase 3)
//  3. Admin routes      → AdminLayout  + RoleBasedRoute (Phase 3)
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
        <PublicLayout><RoomListing /></PublicLayout>
      } />
        <Route path="/rooms/:roomId" element={
        <PublicLayout><RoomDetail /></PublicLayout>
      } />
      <Route path="/dining" element={
        <PublicLayout><Dining /></PublicLayout>
      } />
      <Route path="/dining/reserve" element={
        <PublicLayout><ReserveTable /></PublicLayout>
      } />
      <Route path="/events" element={
        <PublicLayout><Events /></PublicLayout>
      } />
      <Route path="/events/:hallId" element={
        <PublicLayout><EventHallDetail /></PublicLayout>
      } />
      <Route path="/meetings" element={
        <PublicLayout><Meetings /></PublicLayout>
      } />
        <Route path="/meetings/:roomId" element={
        <PublicLayout><ConferenceRoomDetail /></PublicLayout>
      } />
      <Route path="/login" element={
        <PublicLayout><Login /></PublicLayout>
      } />
      <Route path="/forgot-password" element={
        <PublicLayout><ForgotPassword /></PublicLayout>
      } />
      <Route path="/reset-password" element={
        <PublicLayout><ResetPassword /></PublicLayout>
      } />
      <Route path="/register" element={
        <PublicLayout><Register /></PublicLayout>
      } />
      <Route path="/staff/accept-invite" element={
        <PublicLayout><AcceptInvite /></PublicLayout>
      } />

      {/* ── Customer portal routes (auth-protected) ───────────────── */}
     <Route path="/account/bookings" element={
        <ProtectedRoute>
          <PublicLayout><MyBookings /></PublicLayout>
        </ProtectedRoute>
      } />
      <Route path="/account/bookings/:bookingId" element={
        <ProtectedRoute>
          <PublicLayout><Placeholder pageName="Booking Detail" /></PublicLayout>
        </ProtectedRoute>
      } />
      <Route path="/account/profile" element={
        <ProtectedRoute>
          <PublicLayout><Profile /></PublicLayout>
        </ProtectedRoute>
      } />

      {/* ── Admin portal routes (role-protected) ──────────────────── */}
      <Route path="/admin" element={
        <RoleBasedRoute allowedRoles={["staff", "admin", "super_admin"]}>
          <AdminLayout><Placeholder pageName="Admin Dashboard" /></AdminLayout>
        </RoleBasedRoute>
      } />
      <Route path="/admin/rooms" element={
        <RoleBasedRoute allowedRoles={["staff", "admin", "super_admin"]}>
          <AdminLayout><RoomManagement /></AdminLayout>
        </RoleBasedRoute>
      } />
     <Route path="/admin/restaurant" element={
        <RoleBasedRoute allowedRoles={["staff", "admin", "super_admin"]}>
          <AdminLayout><RestaurantManagement /></AdminLayout>
        </RoleBasedRoute>
      } />
      <Route path="/admin/banquet" element={
        <RoleBasedRoute allowedRoles={["staff", "admin", "super_admin"]}>
          <AdminLayout><BanquetManagement /></AdminLayout>
        </RoleBasedRoute>
      } />
     <Route path="/admin/conference" element={
        <RoleBasedRoute allowedRoles={["staff", "admin", "super_admin"]}>
          <AdminLayout><ConferenceManagement /></AdminLayout>
        </RoleBasedRoute>
      } />
      <Route path="/admin/guests" element={
        <RoleBasedRoute allowedRoles={["staff", "admin", "super_admin"]}>
          <AdminLayout><Placeholder pageName="Guests / CRM" /></AdminLayout>
        </RoleBasedRoute>
      } />
      <Route path="/admin/staff" element={
        <RoleBasedRoute allowedRoles={["staff", "admin", "super_admin"]}>
          <AdminLayout><Placeholder pageName="Staff & Roles" /></AdminLayout>
        </RoleBasedRoute>
      } />
      <Route path="/admin/reports" element={
        <RoleBasedRoute allowedRoles={["staff", "admin", "super_admin"]}>
          <AdminLayout><Placeholder pageName="Reports & Analytics" /></AdminLayout>
        </RoleBasedRoute>
      } />
      <Route path="/admin/settings" element={
        <RoleBasedRoute allowedRoles={["staff", "admin", "super_admin"]}>
          <AdminLayout><Placeholder pageName="Settings" /></AdminLayout>
        </RoleBasedRoute>
      } />

      {/* ── 404 fallback — must be last ───────────────────────────── */}
      <Route path="*" element={
        <PublicLayout><Placeholder pageName="404 — Page Not Found" /></PublicLayout>
      } />

    </Routes>
  );
}