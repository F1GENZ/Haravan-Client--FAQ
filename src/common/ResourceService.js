import { useQuery } from "@tanstack/react-query";
import httpClient from "../config/AxiosConfig";
import { hasSession } from "../lib/session";
import { toResult } from "./apiResult";

const ENDPOINTS = {
  products: "/api/oauth/install/products/search",
  collections: "/api/oauth/install/collections/search",
  pages: "/api/oauth/install/pages/search",
};

export function useResourceSearch(type, query, limit = 10) {
  const trimmed = (query ?? "").trim();
  const endpoint = ENDPOINTS[type];

  return useQuery({
    queryKey: ["resource-search", type, trimmed, limit],
    queryFn: async () => {
      const response = await httpClient.get(endpoint, {
        params: { q: trimmed, limit },
      });
      const data = toResult(response).data;
      return data?.[type] ?? [];
    },
    enabled: Boolean(endpoint) && hasSession() && trimmed.length >= 2,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
  });
}
