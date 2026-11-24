import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import httpClient from "../config/AxiosConfig";
import { hasSession } from "../lib/session";
import { toResult, toResultError } from "./apiResult";

const SNIPPET_QUERY_KEY = ["theme-snippet"];

export function useSnippetStatus() {
  return useQuery({
    queryKey: SNIPPET_QUERY_KEY,
    queryFn: async () => {
      const response = await httpClient.get("/api/theme/snippet");
      return toResult(response).data;
    },
    enabled: hasSession(),
    retry: false,
    refetchOnWindowFocus: false,
  });
}

export function useInstallSnippet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const response = await httpClient.post("/api/theme/snippet");
      return toResult(response).data;
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.setQueryData(SNIPPET_QUERY_KEY, (old) => ({
          ...(old ?? {}),
          ...data,
        }));
      }
      queryClient.invalidateQueries({ queryKey: SNIPPET_QUERY_KEY });
      message.success("Đã cài snippet vào theme đang xuất bản.");
    },
    onError: (error) => {
      const result = toResultError(error);
      if (result.status === 402) {
        queryClient.invalidateQueries({ queryKey: ["trial"] });
      }
      message.error(result.errorMessage || "Không cài được snippet vào theme.");
    },
  });
}
