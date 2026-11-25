import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import httpClient from "../config/AxiosConfig";
import { hasSession } from "../lib/session";
import { toResult, toResultError } from "./apiResult";

const SNIPPET_QUERY_KEY = ["theme-snippet"];
const TEMPLATES_QUERY_KEY = ["theme-templates"];

function invalidateThemeWriteQueries(queryClient) {
  queryClient.invalidateQueries({ queryKey: TEMPLATES_QUERY_KEY });
  queryClient.invalidateQueries({ queryKey: SNIPPET_QUERY_KEY });
}

function useThemeWriteErrorHandler(fallback) {
  const queryClient = useQueryClient();
  return (error) => {
    // A write can fail after some templates were already modified; refetch the real state.
    invalidateThemeWriteQueries(queryClient);
    const result = toResultError(error);
    if (result.status === 402) {
      queryClient.invalidateQueries({ queryKey: ["trial"] });
    }
    message.error(result.errorMessage || fallback);
  };
}

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

export function useThemeTemplates() {
  return useQuery({
    queryKey: TEMPLATES_QUERY_KEY,
    queryFn: async () => {
      const response = await httpClient.get("/api/theme/templates");
      return toResult(response).data;
    },
    enabled: hasSession(),
    retry: false,
    refetchOnWindowFocus: false,
  });
}

export function useInsertTemplates() {
  const queryClient = useQueryClient();
  const handleError = useThemeWriteErrorHandler("Không chèn được FAQ vào template.");
  return useMutation({
    mutationFn: async ({ keys, title }) => {
      const response = await httpClient.post("/api/theme/templates/insert", {
        keys,
        ...(title ? { title } : {}),
      });
      return toResult(response).data;
    },
    onSuccess: () => invalidateThemeWriteQueries(queryClient),
    onError: handleError,
  });
}

export function useRemoveTemplates() {
  const queryClient = useQueryClient();
  const handleError = useThemeWriteErrorHandler("Không gỡ được FAQ khỏi template.");
  return useMutation({
    mutationFn: async ({ keys }) => {
      const response = await httpClient.post("/api/theme/templates/remove", { keys });
      return toResult(response).data;
    },
    onSuccess: () => invalidateThemeWriteQueries(queryClient),
    onError: handleError,
  });
}

export function useRestoreTemplate() {
  const queryClient = useQueryClient();
  const handleError = useThemeWriteErrorHandler("Không khôi phục được template.");
  return useMutation({
    mutationFn: async ({ key }) => {
      const response = await httpClient.post("/api/theme/templates/restore", { key });
      return toResult(response).data;
    },
    onSuccess: () => invalidateThemeWriteQueries(queryClient),
    onError: handleError,
  });
}
