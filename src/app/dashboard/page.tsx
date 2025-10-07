/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  DollarSign,
  Globe,
  Activity,
  Newspaper,
  Target,
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
import { useMonthlyPressReleases } from "@/hooks/useMonthlyPressReleases";
import { useBusinessMetrics } from "@/hooks/useBusinessMetrics";
import { Skeleton } from "@/components/ui/skeleton";
import { useActivities } from "@/hooks/useActivities";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const description = "A bar chart with a label";

const chartConfig = {
  count: {
    label: "Press Releases",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

function ChartBarLabel() {
  const { data: monthlyData, loading } = useMonthlyPressReleases();

  const chartData = monthlyData?.monthlyPressReleases || [];
  const year = monthlyData?.year || new Date().getFullYear();

  return (
    <Card className="w-full xl:col-span-2 h-full flex flex-col p-6">
      <div className="flex flex-col gap-1 pb-4 mb-4 border-b">
        <h3 className="text-lg font-semibold">Monthly Press Releases</h3>
        <p className="text-sm text-muted-foreground">
          {loading ? "Loading..." : `January - December ${year}`}
        </p>
      </div>
      <div className="flex-1 flex items-center justify-center min-h-0">
        {loading ? (
          <div className="text-sm text-muted-foreground">
            Loading chart data...
          </div>
        ) : chartData.length === 0 ? (
          <div className="text-sm text-muted-foreground">No data available</div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <BarChart
              accessibilityLayer
              data={chartData}
              margin={{
                top: 25,
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
              <Bar dataKey="count" fill="var(--color-count)" radius={8}>
                <LabelList
                  position="top"
                  offset={12}
                  className="fill-foreground"
                  fontSize={12}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </div>
    </Card>
  );
}

export default function Page() {
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>("weekly");

  const { statistics } = useBusinessMetrics();
  const { activities } = useActivities();

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

  // Map icons to metric labels
  const metricIcons: Record<string, any> = {
    "Monthly Recurring Revenue": DollarSign,
    "Active Subscriptions": Users,
    "Churn Rate": TrendingDown,
    "Industries Served": Target,
  };

  // SaaS Business Metrics - Using live data from API
  const businessMetrics = statistics?.businessMetrics
    ? statistics.businessMetrics.map((metric) => ({
        ...metric,
        icon: metricIcons[metric.label] || DollarSign,
      }))
    : [
        {
          label: "Monthly Recurring Revenue",
          value: "Loading...",
          change: "0.0%",
          isPositive: true,
          icon: DollarSign,
          period: "MRR",
        },
        {
          label: "Active Subscriptions",
          value: "Loading...",
          change: "0.0%",
          isPositive: true,
          icon: Users,
          period: "This month",
        },
        {
          label: "Churn Rate",
          value: "Loading...",
          change: "0.0%",
          isPositive: true,
          icon: TrendingDown,
          period: "Monthly",
        },
        {
          label: "Industries Served",
          value: "Loading...",
          change: "0.0%",
          isPositive: true,
          icon: Target,
          period: "This month",
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
                        {metric.value.includes("Loading...") ? (
                          <Skeleton className="w-20 h-4  rounded-md bg-black/10 dark:bg-white/20" />
                        ) : (
                          metric.value
                        )}
                      </div>
                      <Badge
                        variant={metric.isPositive ? "default" : "destructive"}
                        className={`gap-1 ${
                          metric.isPositive
                            ? "bg-emerald-500/20 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"
                            : "bg-red-500/20 text-red-700 dark:bg-red-500/15 dark:text-red-400"
                        }`}
                      >
                        {metric.isPositive ? "+" : "-"}
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
                Activities{" "}
                <Badge
                  variant="secondary"
                  className="text-xs  bg-green-300 text-green-700 dark:bg-green-500/15 dark:text-green-400"
                >
                  new
                </Badge>
              </CardTitle>
              <CardAction className=" text-sm text-muted-foreground cursor-pointer">
                View All
              </CardAction>
            </CardHeader>
            <CardContent>
              <div className="relative max-h-[250px]   overflow-y-scroll scroll-hidden">
                <div className="top-0 sticky w-full h-[280px] bg-gradient-to-b from-transparent via-transparent to-card z-20"></div>
                {/* Timeline line */}

                <div className="absolute top-0 bottom-10 left-0 ">
                  <div className="absolute top-6 bottom-10 left-8 w-px bg-border"></div>

                  {activities.map((activity, index) => (
                    <div key={index} className="relative mb-6  ml-3 mt-3 flex">
                      <div className="z-10 flex-shrink-0">
                        <Avatar className="size-10 rounded-full bg-secondary backdrop-blur-2xl flex items-center justify-center text-primary font-semibold text-sm ring-4 ring-primary/30">
                          <AvatarImage
                            src={activity?.avatarUrl as string}
                            alt={activity.initials}
                            className="rounded-full"
                          />
                          <AvatarFallback className="text-primary">
                            {activity.initials}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="ml-4">
                        <div className="flex items-baseline">
                          <h3 className="text-sm font-medium flex-1 text-foreground line-clamp-2">
                            {activity.activityName}
                          </h3>
                          <span className="text-sm ml-2 font-normal flex-1 text-muted-foreground line-clamp-2">
                            {activity.details}
                          </span>
                        </div>
                        <p className="text-sm font-normal text-muted-foreground">
                          {activity.timeAgo}
                        </p>
                      </div>
                    </div>
                  ))}
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
