"use client";

// Dashboard Layout with Sidebar Navigation
import { Sidebar } from "@/components/Sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

/**
 * Dashboard Layout - provides sidebar for all dashboard routes
 * 
 * Dashboard pages:
 * - /dashboard (main dashboard)
 * - /dashboard/projects
 * - /dashboard/waste-incidents
 * - /dashboard/recommendations
 * - /dashboard/value-stream
 * - /dashboard/last-planner
 * - /dashboard/5s-assessments
 * - /dashboard/kaizen
 * - /dashboard/ai-assistant
 * - /dashboard/ai-analysis
 * - /dashboard/team
 * - /dashboard/reports
 * - /dashboard/settings
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <Sidebar />
      <SidebarInset>
        <main className="flex-1 p-4">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}