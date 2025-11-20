'use client';

import { AppSidebar } from '@/components/app-sidebar';
import { TopBar } from '@/components/top-bar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { useMockData } from '@/lib/hooks/use-mock-data';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Initialize mock data (will be replaced with API calls later)
  useMockData();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <TopBar />
        <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
