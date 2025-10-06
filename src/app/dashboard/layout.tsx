"use client";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ReactNode } from "react";

export default function Page({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="floating" />
      <SidebarInset>
        <div className="flex flex-1 flex-col p-2 ">
          <div className="@container/main flex bg-card  rounded-2xl dark:bg-accent/10 relative border   shadow flex-1 flex-col gap-2">
            <SiteHeader />
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
