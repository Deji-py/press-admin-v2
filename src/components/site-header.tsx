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
import { useActivities } from "@/hooks/useActivities";

export function SiteHeader() {
  const { activities, loading, error } = useActivities();
  const { logout, user } = useAuth();
  const { setTheme, theme } = useTheme();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    router.push("/login");
  };

  // const unreadCount = activities.length;

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
          <Breadcrumb className="hidden lg:flex">
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
                className="h-9 w-9 flex flex-col justify-center items-center p-0 relative"
              >
                <Bell className="h-4 w-4" />

                <Badge
                  variant="destructive"
                  className="absolute  -mt-5 -mr-5 h-2 w-2 p-0 flex items-center justify-center text-xs"
                />

                <span className="sr-only">Notifications</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-100 max-h-xs">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {loading ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  Loading activities...
                </div>
              ) : error ? (
                <div className="p-4 text-center text-sm text-red-500">
                  Error loading activities
                </div>
              ) : activities.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  No notifications
                </div>
              ) : (
                activities.slice(0, 3).map((activity) => (
                  <DropdownMenuItem
                    key={activity.id}
                    className="flex flex-col items-start p-3 cursor-pointer"
                  >
                    <div className="flex w-full items-start justify-between gap-2">
                      <div className="flex items-start gap-2 flex-1">
                        <Avatar className="h-6 bg-secondary/30 text-secondary-foreground w-6 flex-shrink-0 mt-0.5">
                          <AvatarFallback className="text-xs bg-secondary text-secondary-foreground font-semibold rounded-full">
                            {activity.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="text-sm font-medium">
                            {activity.userName || "Anonymous"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {activity.activityName}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                            {activity.details}
                          </p>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 ml-8">
                      {activity.timeAgo}
                    </p>
                  </DropdownMenuItem>
                ))
              )}
              {!loading && !error && activities.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => router.push("/dashboard/activities")}
                    className="text-center justify-center"
                  >
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
