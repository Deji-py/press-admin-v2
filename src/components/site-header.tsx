"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import useAuth from "@/hooks/useAuth";
import {
  ChevronDown,
  LogOutIcon,
  Search,
  Bell,
  Settings,
  User,
  Moon,
  Sun,
  Monitor,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";

export function SiteHeader() {
  const { logout, user } = useAuth();
  const { setTheme, theme } = useTheme();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    router.push("/login");
  };

  const notifications = [
    { id: 1, message: "New user registered", time: "2 min ago", unread: true },
    {
      id: 2,
      message: "System update completed",
      time: "1 hour ago",
      unread: true,
    },
    {
      id: 3,
      message: "Backup completed successfully",
      time: "3 hours ago",
      unread: false,
    },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <header className="flex h-16 sticky top-0 z-40 shrink-0 items-center gap-2 border-b rounded-t-2xl bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-16">
      <div className="flex w-full items-center gap-4 px-4 lg:px-6">
        {/* Left Section - Sidebar trigger and breadcrumb */}
        <div className="flex items-center gap-2">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mx-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb className="hidden md:flex">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/components">Components</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Center Section - Search Bar */}
        <div className="flex-1 flex justify-center px-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="pl-10 pr-4! w-full border bg-muted/50  focus-visible:ring-1"
            />
          </div>
        </div>

        {/* Right Section - Theme toggle, notifications, and user menu */}
        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Theme</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Sun className="mr-2 h-4 w-4" />
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Moon className="mr-2 h-4 w-4" />
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                <Monitor className="mr-2 h-4 w-4" />
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 p-0 relative"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                  >
                    {unreadCount}
                  </Badge>
                )}
                <span className="sr-only">Notifications</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No notifications
                </div>
              ) : (
                notifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className="flex flex-col items-start p-3 cursor-pointer"
                  >
                    <div className="flex w-full items-start justify-between">
                      <p className="text-sm font-medium flex-1">
                        {notification.message}
                      </p>
                      {notification.unread && (
                        <div className="h-2 w-2 bg-blue-500 rounded-full mt-1 ml-2 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {notification.time}
                    </p>
                  </DropdownMenuItem>
                ))
              )}
              {notifications.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-center justify-center">
                    View all notifications
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <Separator orientation="vertical" className="h-4" />

          {/* User Account Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-9 px-2 gap-2 hover:bg-muted/50"
              >
                <Avatar className="h-7 w-7 bg-accent rounded-full">
                  <AvatarFallback className="rounded-full text-xs font-semibold text-secondary-foreground bg-secondary">
                    {user?.email?.slice(0, 2).toUpperCase() || "AD"}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium hidden sm:inline-block">
                  Admin
                </span>
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">Admin User</p>
                  <p className="text-xs text-muted-foreground">
                    {user?.email || "admin@example.com"}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-red-600 focus:text-red-600"
                onClick={handleLogout}
              >
                <LogOutIcon className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
