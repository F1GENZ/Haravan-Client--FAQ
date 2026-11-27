import { useQuery } from "@tanstack/react-query";
import httpClient from "../config/AxiosConfig";
import { hasCredentials } from "../lib/session";
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
    enabled: Boolean(endpoint) && hasCredentials() && trimmed.length >= 2,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
  });
}

export function useResourceLookup(type, objectid, { enabled = true } = {}) {
  const id = (objectid ?? "").trim();
  return useQuery({
    queryKey: ["resource-lookup", type, id],
    queryFn: async () => {
      const response = await httpClient.get("/api/oauth/install/resource/lookup", {
        params: { type, id },
      });
      return toResult(response).data?.resource ?? null;
    },
    enabled: enabled && hasCredentials() && Boolean(type) && /^\d+$/.test(id) && id !== "0",
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
  });
}
