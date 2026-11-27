import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import httpClient from "../config/AxiosConfig";
import { hasCredentials } from "../lib/session";
import { toResult } from "./apiResult";

// One quota per shop session: the worker derives the shop from the token.
export const AI_QUOTA_QUERY_KEY = ["ai-quota"];

export async function fetchAiQuota() {
  const response = await httpClient.get("/api/ai/quota");
  return toResult(response).data;
}

export async function suggestFaqs({ type, objectid }) {
  const response = await httpClient.post("/api/ai/suggest", {
    type,
    objectid: String(objectid ?? "0"),
  });
  return toResult(response).data;
}

export function useAiQuota({ enabled = true } = {}) {
  return useQuery({
    queryKey: AI_QUOTA_QUERY_KEY,
    queryFn: fetchAiQuota,
    enabled: enabled && hasCredentials(),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 30 * 1000,
  });
}

export function useAiSuggest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: suggestFaqs,
    onSuccess: (data) => {
      if (data?.quota) queryClient.setQueryData(AI_QUOTA_QUERY_KEY, data.quota);
    },
    // A failed run may still be a 429 (quota exhausted), so always re-read the counter.
    onSettled: () => queryClient.invalidateQueries({ queryKey: AI_QUOTA_QUERY_KEY }),
  });
}
