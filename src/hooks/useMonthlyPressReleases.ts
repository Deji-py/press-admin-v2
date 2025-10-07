// hooks/useMonthlyPressReleases.ts
"use client";

import { useState, useEffect } from "react";

interface MonthlyData {
  month: string;
  count: number;
}

interface MonthlyPressReleasesResponse {
  monthlyPressReleases: MonthlyData[];
  year: number;
}

export function useMonthlyPressReleases() {
  const [data, setData] = useState<MonthlyPressReleasesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMonthlyData = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/statistic/monthly-press-releases");

        if (!response.ok) {
          throw new Error("Failed to fetch monthly press releases data");
        }

        const result = await response.json();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
        console.error("Error fetching monthly press releases:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMonthlyData();
  }, []);

  return { data, loading, error };
}
