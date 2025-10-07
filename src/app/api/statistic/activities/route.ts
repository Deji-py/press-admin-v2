// API endpoint for recent activities timeline
/*
Fetch recent user activities with user business info

Response format:
{
  activities: [
    {
      id: "uuid",
      userName: "John Doe",
      activityName: "signed up",
      details: "Tech Startup CEO",
      avatarUrl: "url or null",
      initials: "JD",
      timeAgo: "2 minutes ago",
      created_at: "timestamp"
    }
  ]
}
*/

import { createClient } from "@/utils/server";
import { cookies } from "next/headers";

// Helper function to calculate time ago
function getTimeAgo(date: Date): string {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 120) return "1 minute ago";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 7200) return "1 hour ago";
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 172800) return "1 day ago";
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  if (seconds < 1209600) return "1 week ago";
  return `${Math.floor(seconds / 604800)} weeks ago`;
}

// Helper function to get initials from name
function getInitials(name: string): string {
  if (!name) return "??";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Helper function to generate avatar color based on name
function getAvatarColor(name: string): string {
  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-orange-500",
    "bg-teal-500",
    "bg-indigo-500",
    "bg-red-500",
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

export const GET = async (request: Request) => {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);

  try {
    // Fetch recent activities with user info
    const { data: activities, error: activitiesError } = await supabase
      .from("activities")
      .select(
        `
        id,
        user_id,
        activity_name,
        details,
        created_at
      `
      )
      .order("created_at", { ascending: false })
      .limit(30);

    if (activitiesError) throw activitiesError;

    if (!activities || activities.length === 0) {
      return new Response(
        JSON.stringify({
          activities: [],
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Get user IDs
    const userIds = activities.map((activity) => activity.user_id);

    // Fetch user business info for all users
    const { data: userBusinessInfo, error: userBusinessError } = await supabase
      .from("user_business_info")
      .select("user_id, company_name, industry, logo_url")
      .in("user_id", userIds);

    if (userBusinessError) throw userBusinessError;

    // Fetch users table for names (assuming you have a users table with name/email)
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("user_id, first_name, last_name, email, profile_pic")
      .in("user_id", userIds);

    if (usersError) throw usersError;

    // Create lookup maps
    const businessInfoMap = new Map(
      userBusinessInfo?.map((info) => [info.user_id, info]) || []
    );
    const usersMap = new Map(users?.map((user) => [user.user_id, user]) || []);

    // Transform activities data
    const transformedActivities = activities.map((activity) => {
      const user = usersMap.get(activity.user_id);
      const businessInfo = businessInfoMap.get(activity.user_id);

      // Determine user name (fallback chain)
      const userName =
        `${user?.first_name || ""} ${user?.last_name || ""}`.trim() ||
        businessInfoMap.get(activity.user_id)?.company_name ||
        user?.email?.split("@")[0] ||
        "Unknown User";

      // Determine avatar URL (priority: profile_pic > logo_url > null)
      const avatarUrl = user?.profile_pic || businessInfo?.logo_url || null;

      // Get initials
      const initials = getInitials(userName);

      // Get avatar color
      const avatarColor = getAvatarColor(userName);

      // Calculate time ago
      const timeAgo = getTimeAgo(new Date(activity.created_at));

      // Get details (fallback to industry if no details provided)
      const details =
        activity.details || businessInfo?.industry || "User activity";

      return {
        id: activity.id,
        userName,
        activityName: activity.activity_name,
        details,
        avatarUrl,
        initials,
        avatarColor,
        timeAgo,
        created_at: activity.created_at,
      };
    });

    return new Response(
      JSON.stringify({
        activities: transformedActivities,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Activities API Error:", error);
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
