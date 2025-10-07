// API endpoint for monthly press releases statistics
/*
Track monthly press release creation for bar chart visualization

Response format:
{
  monthlyPressReleases: [
    { month: "January", count: 186 },
    { month: "February", count: 305 },
    ...
  ]
}
*/

import { createClient } from "@/utils/server";
import { cookies } from "next/headers";

export const GET = async (request: Request) => {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);

  try {
    // Fetch all press releases with their creation dates
    const { data: pressReleases, error: pressReleasesError } = await supabase
      .from("press_releases")
      .select("id, release_date");

    if (pressReleasesError) throw pressReleasesError;

    // Get current year
    const currentYear = new Date().getFullYear();

    // Initialize monthly counts
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const monthlyCounts = monthNames.map((month, index) => ({
      month,
      count: 0,
    }));

    // Count press releases per month for current year
    if (pressReleases) {
      pressReleases.forEach((release) => {
        const createdAt = new Date(release.release_date);

        // Only count releases from the current year
        if (createdAt.getFullYear() === currentYear) {
          const monthIndex = createdAt.getMonth();
          monthlyCounts[monthIndex].count++;
        }
      });
    }

    return new Response(
      JSON.stringify({
        monthlyPressReleases: monthlyCounts,
        year: currentYear,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Monthly Press Releases API Error:", error);
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
