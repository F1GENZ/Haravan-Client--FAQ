import { useQuery } from "@tanstack/react-query";
import httpClient from "../config/AxiosConfig";
import { hasCredentials } from "../lib/session";
import { toResult } from "./apiResult";

export const DEFAULT_TRIAL = {
  status: "unknown",
  expires_at: null,
  days_remaining: 0,
  is_unlimited: false,
  billing_enforced: false,
  can_write: true,
};

export function useTrialInfo() {
  return useQuery({
    queryKey: ["trial"],
    queryFn: async () => {
      if (!hasCredentials()) return DEFAULT_TRIAL;
      const response = await httpClient.get("/api/oauth/install/trial");
      return toResult(response).data ?? DEFAULT_TRIAL;
    },
    enabled: hasCredentials(),
    staleTime: 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
  });
}

export function useCanWrite() {
  const { data } = useTrialInfo();
  return data ? data.can_write !== false : true;
}
