// hooks/useActivities.ts
"use client";

import { useState, useEffect } from "react";

interface Activity {
  id: string;
  userName: string;
  activityName: string;
  details: string;
  avatarUrl: string | null;
  initials: string;
  avatarColor: string;
  timeAgo: string;
  created_at: string;
}

interface ActivitiesResponse {
  activities: Activity[];
}

export function useActivities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/statistic/activities");

        if (!response.ok) {
          throw new Error("Failed to fetch activities");
        }

        const result: ActivitiesResponse = await response.json();
        setActivities(result.activities);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error fetching activities:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();

    // Optional: Set up polling to refresh activities every 30 seconds
    const interval = setInterval(fetchActivities, 30000);

    return () => clearInterval(interval);
  }, []);

  return { activities, loading, error };
}
