// Feature of statistics api
/*
track the following business metrics:

- businessMetrics
    - monthlyRevenue     // Monthly recurring revenue
    - activeSubscriptions // Number of current subscribers
    - churnRate          // Rate at which customers cancel subscriptions
    - industry      // Total industries served

    // Response format
      const businessMetrics = [
    {
      value: "$127,450",
      change: "+23.1%",
      isPositive: true,
      period: "MRR",
    },
    {
      value: "1,847",
      change: "+5.4%",
      isPositive: true,
      period: "This month",
    },
    {
      value: "2.8%",
      change: "-0.5%",
      icon: TrendingDown,
      period: "Monthly",
    },
    {
  
      value: "$4,250",
      change: "+8.9%",
      icon: Target,
      period: "Average",
    },
  ];
*/

import { createClient } from "@/utils/server";
import { cookies } from "next/headers";

export const GET = async (request: Request) => {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);
  try {
    // monthly recurring revenue

    const { data: revenueData, error: revenueError } = await supabase
      .from("subscriptions")
      .select("amount, status, created_at")
      .eq("status", "completed");
    if (revenueError) throw revenueError;

    const monthlyRevenue = revenueData
      ? revenueData.reduce((total, sub) => total + sub.amount, 0)
      : 0;
    const formattedMonthlyRevenue = `₹${(monthlyRevenue / 100).toLocaleString(
      "en-IN"
    )}`;

    const this_month_revenue = revenueData
      ? revenueData.filter((sub) => {
          const createdAt = new Date(sub.created_at);
          const now = new Date();
          return (
            createdAt.getMonth() === now.getMonth() &&
            createdAt.getFullYear() === now.getFullYear()
          );
        })
      : 0;
    const monthlyRevenueChange = this_month_revenue
      ? (
          (this_month_revenue.reduce((total, sub) => total + sub.amount, 0) /
            monthlyRevenue) *
          100
        ).toFixed(1)
      : "0.0";
    const isMonthlyRevenuePositive = parseFloat(monthlyRevenueChange) >= 0;

    const monthlyRevenueMetric = {
      label: "Monthly Recurring Revenue",
      value: formattedMonthlyRevenue,
      change: `${monthlyRevenueChange}%`,
      isPositive: isMonthlyRevenuePositive,
      period: "MRR",
    };

    // active subscriptions
    const { data: activeSubsData, error: activeSubsError } = await supabase
      .from("subscriptions")
      .select("id, status")
      .eq("status", "completed");
    if (activeSubsError) throw activeSubsError;

    const activeSubscriptions = activeSubsData ? activeSubsData.length : 0;

    const { data: lastMonthActiveSubsData, error: lastMonthActiveSubsError } =
      await supabase
        .from("subscriptions")
        .select("id, status, created_at")
        .eq("status", "completed");
    if (lastMonthActiveSubsError) throw lastMonthActiveSubsError;
    const lastMonthActiveSubscriptions = lastMonthActiveSubsData
      ? lastMonthActiveSubsData.filter((sub) => {
          const createdAt = new Date(sub.created_at);
          const now = new Date();

          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          return (
            createdAt.getMonth() === lastMonth.getMonth() &&
            createdAt.getFullYear() === lastMonth.getFullYear()
          );
        })
      : 0;

    const activeSubscriptionsChange = lastMonthActiveSubscriptions
      ? (
          (lastMonthActiveSubscriptions.length / activeSubscriptions) *
          100
        ).toFixed(1)
      : "0.0";
    const isActiveSubscriptionsPositive =
      parseFloat(activeSubscriptionsChange) >= 0;

    const activeSubscriptionsMetric = {
      label: "Active Subscriptions",
      value: activeSubscriptions.toString(),
      change: `${activeSubscriptionsChange}%`,
      isPositive: isActiveSubscriptionsPositive,
      period: "This month",
    };

    // churn rate

    const { data: cancellationData, error: cancellationError } = await supabase
      .from("subscription_cancellation")
      .select("*");

    if (cancellationError) throw cancellationError;

    const cancellations = cancellationData ? cancellationData.length : 0;

    const churnRate = activeSubscriptions
      ? ((cancellations / activeSubscriptions) * 100).toFixed(1)
      : "0.0";

    const {
      data: lastMonthCancellationData,
      error: lastMonthCancellationError,
    } = await supabase
      .from("subscription_cancellation")
      .select("id, created_at");

    if (lastMonthCancellationError) throw lastMonthCancellationError;
    const lastMonthCancellations = lastMonthCancellationData
      ? lastMonthCancellationData.filter((sub) => {
          const createdAt = new Date(sub.created_at);
          const now = new Date();
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          return (
            createdAt.getMonth() === lastMonth.getMonth() &&
            createdAt.getFullYear() === lastMonth.getFullYear()
          );
        })
      : [];

    const lastMonthChurnRate = activeSubscriptions
      ? ((lastMonthCancellations.length / activeSubscriptions) * 100).toFixed(1)
      : "0.0";

    const churnRateChange = (
      parseFloat(churnRate) - parseFloat(lastMonthChurnRate)
    ).toFixed(1);
    const isChurnRatePositive = parseFloat(churnRateChange) <= 0;

    const churnRateMetric = {
      label: "Churn Rate",
      value: `${churnRate}%`,
      change: `${churnRateChange}%`,
      isPositive: isChurnRatePositive,
      period: "Monthly",
    };

    // industries served

    const { data: industryData, error: industryError } = await supabase
      .from("press_releases")
      .select("industry, created_at");
    if (industryError) throw industryError;

    const industriesServed = industryData
      ? new Set(industryData.map((industry) => industry.industry)).size
      : 0;

    const this_month_industry = industryData
      ? industryData.filter((industry) => {
          const createdAt = new Date(industry.created_at);
          const now = new Date();
          return (
            createdAt.getMonth() === now.getMonth() &&
            createdAt.getFullYear() === now.getFullYear()
          );
        })
      : 0;

    const industrychange = this_month_industry
      ? ((this_month_industry.length / industriesServed) * 100).toFixed(1)
      : "0.0";

    const isIndustriesServedPositive = parseFloat(industrychange) >= 0;

    const industriesServedMetric = {
      label: "Industries Served",
      value: industriesServed.toString(),
      change: `${industrychange}%`,
      isPositive: isIndustriesServedPositive,
      period: "This month",
    };

    return new Response(
      JSON.stringify({
        businessMetrics: [
          monthlyRevenueMetric,
          activeSubscriptionsMetric,
          churnRateMetric,
          industriesServedMetric,
        ],
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Statistics API Error:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};
