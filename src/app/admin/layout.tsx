"use client";

import { useAdminAuth } from "@/lib/admin-auth";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AdminSidebar, AdminTopbar } from "@/components/admin/AdminLayout";

const PUBLIC_PATHS = ["/admin/login", "/admin/forgot-password", "/admin/reset-password"];

export default function AdminShellLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const isPublic = PUBLIC_PATHS.includes(pathname);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated && !isPublic) {
      router.replace("/admin/login");
    }
  }, [mounted, isAuthenticated, isPublic, router]);

  // Public pages: no shell
  if (isPublic) return <>{children}</>;

  // Auth guard loading
  if (!mounted || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#84cc16] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="lg:pl-56 flex flex-col min-h-screen">
        <AdminTopbar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
