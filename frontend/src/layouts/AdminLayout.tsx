import { ReactNode } from "react";
import { Sidebar, AdminTopbar } from "@/components/layout";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminTopbar />
        <main className="flex-1 overflow-auto bg-neutral-100 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}