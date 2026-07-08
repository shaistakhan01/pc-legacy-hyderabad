import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface RoleBasedRouteProps {
  children: ReactNode;
  allowedRoles: string[];
}

export function RoleBasedRoute({ children, allowedRoles }: RoleBasedRouteProps) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return <div className="p-16 text-center text-neutral-700">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!profile || !allowedRoles.includes(profile.role) || !profile.is_active) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}