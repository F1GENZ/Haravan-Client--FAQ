import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import httpClient from "../config/AxiosConfig";
import { hasSession } from "../lib/session";
import { sortFaqEntries, toFaqEntries } from "../lib/faq";
import { toResult, toResultError } from "./apiResult";

const FALLBACK_ERROR = "Có lỗi xảy ra, vui lòng thử lại.";

export async function fetchFaqs({ type, objectid }) {
  const response = await httpClient.get("/api/metafields", {
    params: { type, objectid },
  });
  const result = toResult(response);
  return Array.isArray(result.data) ? result.data : [];
}

export async function createFaq(values) {
  const response = await httpClient.post("/api/metafields", values);
  return toResult(response).data;
}

export async function updateFaq(values) {
  const response = await httpClient.put("/api/metafields", values);
  return toResult(response).data;
}

export async function deleteFaq({ metafieldid }) {
  const response = await httpClient.delete("/api/metafields", {
    params: { metafieldid },
  });
  return toResult(response).data;
}

export async function reorderFaqs({ type, objectid, order }) {
  const response = await httpClient.put("/api/metafields/reorder", {
    type,
    objectid,
    order,
  });
  return toResult(response).data;
}

function useFaqMutation(mutationFn, successMessage) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
      if (successMessage) message.success(successMessage);
    },
    onError: (error) => {
      const result = toResultError(error);
      if (result.status === 402) {
        queryClient.invalidateQueries({ queryKey: ["trial"] });
      }
      message.error(result.errorMessage || FALLBACK_ERROR);
    },
  });
}

export function useFaqs({ type, objectid }) {
  const target = objectid || "0";
  const hasTarget = type === "shop" || target !== "0";

  return useQuery({
    queryKey: ["faqs", type, target],
    queryFn: async () =>
      sortFaqEntries(toFaqEntries(await fetchFaqs({ type, objectid: target }))),
    enabled: hasTarget && hasSession(),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 30 * 1000,
  });
}

export function useCreateFaq() {
  return useFaqMutation(createFaq, "Đã thêm câu hỏi.");
}

export function useUpdateFaq() {
  return useFaqMutation(updateFaq, "Đã cập nhật câu hỏi.");
}

export function useDeleteFaq() {
  return useFaqMutation(deleteFaq, "Đã xóa câu hỏi.");
}

export function useReorderFaqs() {
  return useFaqMutation(reorderFaqs, "Đã lưu thứ tự câu hỏi.");
}
