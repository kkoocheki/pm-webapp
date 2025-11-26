'use client';

import { AppSidebar } from '@/components/app-sidebar';
import { TopBar } from '@/components/top-bar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { DataLoader } from '@/components/data-loader';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <TopBar />
        <main className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <DataLoader>
            {children}
          </DataLoader>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
