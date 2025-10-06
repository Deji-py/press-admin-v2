// AppSidebar.tsx
"use client";
import logo_full from "@/../public/branding/logo_full.svg";
import * as React from "react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import {
  Book,
  CreditCard,
  Factory,
  LayoutPanelTop,
  ListIcon,
  Mail,
  Trash,
  User2,
  Wallet,
  WalletCards,
  HelpCircle,
  Settings,
  ExternalLink,
  Heart,
  Headphones,
  Bell,
  UserX,
} from "lucide-react";
import { IconCategory, IconCreditCardOff, IconCube } from "@tabler/icons-react";
import clsx from "clsx";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: <LayoutPanelTop className="h-4 w-4" />,
    },
    {
      title: "Users",
      url: "/dashboard/users",
      icon: <User2 className="h-4 w-4" />,
    },
    {
      title: "Press Release",
      url: "/dashboard/press-release",
      icon: <Book className="h-4 w-4" />,
    },
    {
      title: "Categories",
      url: "/dashboard/categories",
      icon: <IconCategory className="h-4 w-4" />,
    },
    {
      title: "Subscriptions",
      url: "/dashboard/subscriptions",
      icon: <Wallet className="h-4 w-4" />,
    },
    {
      title: "Packages",
      url: "/dashboard/packages",
      icon: <IconCube className="h-4 w-4" />,
    },
    {
      title: "Subscription Plans",
      url: "/dashboard/subscription-plans",
      icon: <CreditCard className="h-4 w-4" />,
    },
    {
      title: "Newsletter",
      url: "/dashboard/newsletter",
      icon: <Mail className="h-4 w-4" />,
    },
    {
      title: "Support",
      url: "/dashboard/support",
      icon: <Headphones className="h-4 w-4" />,
    },
    {
      title: "Activities",
      url: "/dashboard/activities",
      icon: <Bell className="h-4 w-4" />,
    },
    {
      title: "Subscription Cancellation",
      url: "/dashboard/subscription-cancellations",
      icon: <IconCreditCardOff className="h-4 w-4" />,
    },
    {
      title: "Account Deletion",
      url: "/dashboard/account-deletion",
      icon: <UserX className="h-4 w-4" />,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { open } = useSidebar();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="py-5 px-3 flex flex-row w-full items-center justify-between">
        {open && (
          <a href="#" className="flex items-center gap-2 font-medium">
            <Image src={logo_full} alt="logo" className="w-20" />
          </a>
        )}
        <div
          className={`text-xs font-medium text-muted-foreground ${
            !open ? "rotate-90 whitespace-nowrap" : ""
          }`}
        >
          V1.0
        </div>
      </SidebarHeader>

      <SidebarContent className={clsx(open ? "px-2" : "px-0")}>
        <NavMain items={data.navMain} />
      </SidebarContent>

      <SidebarFooter
        className={`px-3 py-4 mt-auto border-t border-border/50 transition-all duration-200 ${
          !open ? "px-2" : ""
        }`}
      >
        {open ? (
          // Expanded footer
          <div className="space-y-3">
            {/* Quick Actions */}
            <div className="space-y-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-full h-8 text-xs justify-start gap-2 text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                onClick={() => window.open("/help", "_blank")}
              >
                <HelpCircle className="h-3.5 w-3.5" />
                Help & Support
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="w-full h-8 text-xs justify-start gap-2 text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                onClick={() => window.open("/settings", "_blank")}
              >
                <Settings className="h-3.5 w-3.5" />
                Settings
              </Button>
            </div>

            <Separator className="my-2 opacity-50" />

            {/* Company Info */}
            <div className="space-y-2">
              {/* Status indicator */}
              <div className="flex items-center gap-2 text-xs">
                <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-sm shadow-emerald-500/50">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping opacity-75"></div>
                </div>
                <span className="text-muted-foreground font-medium">
                  System Online
                </span>
              </div>

              {/* Links */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex gap-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => window.open("/privacy", "_blank")}
                  >
                    Privacy
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => window.open("/terms", "_blank")}
                  >
                    Terms
                  </Button>
                </div>
                <ExternalLink className="h-3 w-3 text-muted-foreground/50" />
              </div>

              {/* Copyright */}
              <div className="text-xs text-muted-foreground/70">
                © 2024 Your Company
              </div>

              {/* Made with love */}
              <div className="flex items-center gap-1 text-xs text-muted-foreground/60 pt-1">
                <span>Made with</span>
                <Heart className="h-3 w-3 text-rose-500 fill-current animate-pulse" />
                <span>by Your Team</span>
              </div>
            </div>
          </div>
        ) : (
          // Collapsed footer - minimal and clean
          <div className="flex flex-col items-center gap-3">
            {/* Quick action buttons */}
            <div className="space-y-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                onClick={() => window.open("/help", "_blank")}
                title="Help & Support"
              >
                <HelpCircle className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
                onClick={() => window.open("/settings", "_blank")}
                title="Settings"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>

            <Separator className="w-6 opacity-50" />

            {/* Status dot */}
            <div className="relative" title="System Online">
              <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-sm shadow-emerald-500/50">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping opacity-75"></div>
              </div>
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
