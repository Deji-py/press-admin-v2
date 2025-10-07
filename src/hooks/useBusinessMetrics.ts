import { useQuery } from "@tanstack/react-query";

interface businessMetrics {
  label: string;
  value: string;
  change: string;
  isPositive: boolean;
  period: string;
}

type Statistics = {
  businessMetrics: Array<businessMetrics>;
};

export const useBusinessMetrics = () => {
  const {
    data: statistics,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["statistics"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/statistic/business-metrics");
        const data = await response.json();
        return data as Statistics;
      } catch (error) {
        console.log(error);
        return null;
      }
    },
  });

  return { statistics, isLoading, isError };
};
