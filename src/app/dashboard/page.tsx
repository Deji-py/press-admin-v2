"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Filter,
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  Eye,
  Share2,
  DollarSign,
  Calendar,
  Globe,
  Mail,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  Target,
  Newspaper,
} from "lucide-react";
import { GridPattern } from "@/components/ui/grid-pattern";
import { cn } from "@/lib/utils";
import { IconTimelineEvent } from "@tabler/icons-react";

type TimePeriod = "weekly" | "monthly" | "yearly";

import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
export const description = "A bar chart with a label";
const chartData = [
  { month: "January", desktop: 186 },
  { month: "February", desktop: 305 },
  { month: "March", desktop: 237 },
  { month: "April", desktop: 73 },
  { month: "May", desktop: 209 },
  { month: "June", desktop: 214 },
  { month: "July", desktop: 186 },
  { month: "August", desktop: 305 },
  { month: "September", desktop: 237 },
  { month: "October", desktop: 73 },
  { month: "November", desktop: 209 },
  { month: "December", desktop: 214 },
];
const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;
export function ChartBarLabel() {
  return (
    <Card className="w-full xl:col-span-2 h-full flex flex-col p-6">
      <div className="flex flex-col gap-1 pb-4 mb-4 border-b">
        <h3 className="text-lg font-semibold">Bar Chart - Label</h3>
        <p className="text-sm text-muted-foreground">January - June 2024</p>
      </div>
      <div className="flex-1 flex items-center justify-center min-h-0">
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{
              top: 20,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="desktop" fill="var(--color-desktop)" radius={8}>
              <LabelList
                position="top"
                offset={12}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>
    </Card>
  );
}
export default function Page() {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("weekly");

  // Core KPIs for Press Release Management
  const coreMetrics = [
    {
      label: "Total Press Releases",
      value: "2,847",
      change: "+12.5%",
      isPositive: true,
      icon: FileText,
      description: "Created this month",
    },
    {
      label: "Active Distributions",
      value: "1,523",
      change: "+8.2%",
      isPositive: true,
      icon: Globe,
      description: "Currently active",
    },
    {
      label: "Media Pickups",
      value: "4,290",
      change: "+15.7%",
      isPositive: true,
      icon: Newspaper,
      description: "This month",
    },
    {
      label: "Avg. Engagement Rate",
      value: "7.3%",
      change: "-2.1%",
      isPositive: false,
      icon: Activity,
      description: "Views to shares ratio",
    },
  ];

  // SaaS Business Metrics
  const businessMetrics = [
    {
      label: "Monthly Recurring Revenue",
      value: "$127,450",
      change: "+23.1%",
      isPositive: true,
      icon: DollarSign,
      period: "MRR",
    },
    {
      label: "Active Subscribers",
      value: "1,847",
      change: "+5.4%",
      isPositive: true,
      icon: Users,
      period: "This month",
    },
    {
      label: "Churn Rate",
      value: "2.8%",
      change: "-0.5%",
      isPositive: true,
      icon: TrendingDown,
      period: "Monthly",
    },
    {
      label: "Customer LTV",
      value: "$4,250",
      change: "+8.9%",
      isPositive: true,
      icon: Target,
      period: "Average",
    },
  ];

  // Top Performing Releases
  const topReleases = [
    {
      title: "AI Technology Partnership Announcement",
      industry: "Technology",
      views: "45.2K",
      shares: "1.2K",
      pickups: 23,
      engagement: 8.7,
      status: "Live",
    },
    {
      title: "Q3 Financial Results & Growth Outlook",
      industry: "Finance",
      views: "38.7K",
      shares: "890",
      pickups: 18,
      engagement: 7.2,
      status: "Live",
    },
    {
      title: "Sustainability Initiative Launch",
      industry: "Environment",
      views: "32.1K",
      shares: "756",
      pickups: 15,
      engagement: 6.8,
      status: "Live",
    },
    {
      title: "Product Innovation Award Recognition",
      industry: "Manufacturing",
      views: "29.4K",
      shares: "634",
      pickups: 12,
      engagement: 6.2,
      status: "Archived",
    },
  ];

  // User Activity Data
  const userActivity = [
    { period: "New Registrations", count: 234, change: "+15.2%" },
    { period: "Daily Active Users", count: 1847, change: "+8.1%" },
    { period: "Premium Upgrades", count: 89, change: "+22.5%" },
    { period: "Feature Usage Rate", count: 73.2, change: "+5.4%" },
  ];

  return (
    <>
      <div className=" flex size-full opacity-50 items-center left-0 top-0 bg-gradient-to-br border-b from-accent to-transparent justify-center absolute overflow-hidden h-[20%] bg-card p-15">
        <GridPattern
          width={20}
          height={20}
          x={-1}
          y={-1}
          className={cn(
            "[mask-image:linear-gradient(to_bottom_right,white,transparent,transparent)] "
          )}
        />
      </div>
      <div className="max-w-7xl relative z-10 mx-auto space-y-6 p-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Dashboard Overview
            </h1>
            <p className="text-muted-foreground mt-2">
              Monitor your press release performance and platform metrics
            </p>
          </div>
          <div className="flex gap-3 items-center">
            <div className="inline-flex items-center border gap-0.5 rounded-lg bg-muted p-0.5">
              {(["weekly", "monthly", "yearly"] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`text-sm px-3 py-2  font-medium transition-all duration-200 capitalize rounded-md ${
                    selectedPeriod === period
                      ? "shadow-sm text-secondary-foreground bg-secondary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Business Metrics Row */}
        <Card className="pt-0 ">
          <CardHeader className="py-0">
            <CardTitle className="flex items-center gap-2 text-xl font-semibold bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent"></CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {businessMetrics.map((metric, index) => {
                const Icon = metric.icon;

                // Enhanced gradient colors for better light mode visibility
                const gradients = [
                  "from-primary/20 via-primary/10 to-transparent",
                  "from-chart-2/20 via-chart-2/10 to-transparent",
                  "from-chart-3/20 via-chart-3/10 to-transparent",
                  "from-chart-4/20 via-chart-4/10 to-transparent",
                ];

                const iconColors = [
                  "text-primary",
                  "text-chart-2",
                  "text-chart-3",
                  "text-chart-4",
                ];

                const borderColors = [
                  "border-primary/30",
                  "border-chart-2/30",
                  "border-chart-3/30",
                  "border-chart-4/30",
                ];

                return (
                  <div
                    key={index}
                    className={`group relative space-y-4 overflow-hidden border ${
                      borderColors[index % 4]
                    } p-6 pb-0 rounded-2xl 
                   bg-gradient-to-br ${gradients[index % 4]} 
                   transition-all duration-300 ease-out backdrop-blur-sm
                 `}
                  >
                    {/* Background decoration */}
                    <div className="absolute -top-4 -right-4 w-24 h-24 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Icon
                        className={`w-full h-full ${iconColors[index % 4]}`}
                      />
                    </div>

                    {/* Header */}
                    <div className="flex items-center relative z-10 gap-3">
                      <div
                        className={`p-2 rounded-xl bg-white/70 dark:bg-white/5 backdrop-blur-md   ${
                          iconColors[index % 4]
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-sm font-semibold text-foreground tracking-wide">
                        {metric.label}
                      </span>
                    </div>

                    {/* Main value and change */}
                    <div className="flex z-10 relative items-end justify-between">
                      <div className="text-3xl font-bold text-foreground">
                        {metric.value}
                      </div>
                      <Badge
                        variant={metric.isPositive ? "default" : "destructive"}
                        className={`gap-1 ${
                          metric.isPositive
                            ? "bg-emerald-500/20 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
                            : "bg-red-500/20 text-red-700 dark:bg-red-500/15 dark:text-red-400"
                        }`}
                      >
                        {metric.change}
                      </Badge>
                    </div>

                    {/* Period info */}
                    <div className="flex items-center gap-2">
                      <div className="h-1 w-1 rounded-full bg-muted-foreground/50"></div>
                      <p className="text-xs text-muted-foreground font-medium">
                        {metric.period}
                      </p>
                    </div>

                    {/* Hover effect accent line */}
                    <div
                      className={`absolute bottom-0 left-0 h-1 w-0 ${gradients[
                        index % 4
                      ]
                        .split(" ")[0]
                        .replace("/20", "")} 
                     group-hover:w-full transition-all duration-500 ease-out rounded-full`}
                    ></div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Core Press Release KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {coreMetrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <Card key={index} className="relative py-0 overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {metric.label}
                        </p>
                        <p className="text-xs text-muted-foreground/70">
                          {metric.description}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-end justify-between">
                    <div className="text-3xl font-bold text-foreground">
                      {metric.value}
                    </div>
                    <Badge
                      variant={metric.isPositive ? "default" : "destructive"}
                      className={`gap-1 ${
                        metric.isPositive
                          ? "bg-emerald-100  text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400"
                          : "bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400"
                      }`}
                    >
                      {metric.isPositive ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {metric.change}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts and Analytics Section */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Distribution Success Rates */}

          <ChartBarLabel />

          {/* Recent Signups Timeline */}
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconTimelineEvent className="h-5 w-5 text-muted-foreground" />
                Activities
              </CardTitle>
              <CardAction className=" text-sm text-muted-foreground cursor-pointer">
                View All
              </CardAction>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute top-6 bottom-10 left-5 w-px bg-border"></div>

                {/* Sarah Johnson */}
                <div className="relative mb-6 flex">
                  <div className="z-10 flex-shrink-0">
                    <div className="size-10 rounded-full bg-secondary backdrop-blur-2xl flex items-center justify-center text-primary font-semibold text-sm ring-4 ring-primary/30">
                      SJ
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="flex items-baseline">
                      <h3 className="text-sm font-medium text-foreground">
                        Sarah Johnson
                      </h3>
                      <span className="text-sm ml-2 font-normal text-muted-foreground">
                        signed up
                      </span>
                    </div>
                    <p className="text-sm font-normal text-muted-foreground">
                      Tech Startup CEO
                    </p>
                    <p className="text-xs mt-1 text-muted-foreground">
                      2 minutes ago
                    </p>
                  </div>
                </div>

                {/* Marcus Chen */}
                <div className="relative mb-6 flex">
                  <div className="z-10 flex-shrink-0">
                    <div className="size-10 rounded-full bg-secondary backdrop-blur-2xl flex items-center justify-center text-primary font-semibold text-sm ring-4 ring-primary/30">
                      MC
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="flex items-baseline">
                      <h3 className="text-sm font-medium text-foreground">
                        Marcus Chen
                      </h3>
                      <span className="ml-2 text-sm text-muted-foreground">
                        signed up
                      </span>
                    </div>
                    <p className="text-sm font-normal text-muted-foreground">
                      Marketing Director
                    </p>
                    <p className="text-xs mt-1 text-muted-foreground">
                      15 minutes ago
                    </p>
                  </div>
                </div>

                {/* Elena Rodriguez */}
                <div className="relative mb-6 flex">
                  <div className="z-10 flex-shrink-0">
                    <div className="size-10 rounded-full bg-secondary backdrop-blur-2xl flex items-center justify-center text-primary font-semibold text-sm ring-4 ring-primary/30">
                      ER
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="flex items-baseline">
                      <h3 className="text-sm font-medium text-foreground">
                        Elena Rodriguez
                      </h3>
                      <span className="text-sm ml-2 text-muted-foreground">
                        signed up
                      </span>
                    </div>
                    <p className="text-sm font-normal text-muted-foreground">
                      PR Agency Owner
                    </p>
                    <p className="text-xs mt-1 text-muted-foreground">
                      1 hour ago
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Performing Releases Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Top Performing Press Releases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                      Title
                    </th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                      Industry
                    </th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                      Views
                    </th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                      Shares
                    </th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                      Media Pickups
                    </th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                      Engagement %
                    </th>
                    <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {topReleases.map((release, index) => (
                    <tr
                      key={index}
                      className="border-b border-border/50 hover:bg-muted/50"
                    >
                      <td className="py-4 px-2">
                        <div className="font-medium text-sm max-w-xs truncate">
                          {release.title}
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <Badge variant="outline" className="text-xs bg-accent">
                          {release.industry}
                        </Badge>
                      </td>
                      <td className="py-4 px-2 font-medium">{release.views}</td>
                      <td className="py-4 px-2 font-medium">
                        {release.shares}
                      </td>
                      <td className="py-4 px-2 text-center">
                        {release.pickups}
                      </td>
                      <td className="py-4 px-2 font-medium">
                        {release.engagement}%
                      </td>
                      <td className="py-4 px-2">
                        <Badge
                          variant={
                            release.status === "Live" ? "default" : "secondary"
                          }
                          className={`text-xs ${
                            release.status === "Live"
                              ? "bg-green-100 text-green-600 dark:bg-green-500/15"
                              : "bg-orange-100 text-orange-600 dark:bg-orange-500/15"
                          }`}
                        >
                          {release.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* User Activity Metrics */}
        <Card className="pt-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"></CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {userActivity.map((activity, index) => (
                <div key={index} className="text-center space-y-2">
                  <div className="text-2xl font-bold">
                    {typeof activity.count === "number" && activity.count < 100
                      ? `${activity.count}${
                          activity.period.includes("Rate") ? "%" : ""
                        }`
                      : activity.count.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {activity.period}
                  </div>
                  <Badge
                    variant="default"
                    className="bg-emerald-100  text-emerald-600 dark:bg-emerald-500/15 text-xs"
                  >
                    {activity.change}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
