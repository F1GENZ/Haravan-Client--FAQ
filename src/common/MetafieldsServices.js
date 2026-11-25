import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import httpClient from "../config/AxiosConfig";
import { hasSession } from "../lib/session";
import { sortFaqEntries, toFaqEntries } from "../lib/faq";
import {
  addPendingFaq,
  buildCreatedFaqEntry,
  forgetPendingFaq,
  mergePendingFaqs,
} from "../lib/pendingFaqs";
import { toResult, toResultError } from "./apiResult";

const FALLBACK_ERROR = "Có lỗi xảy ra, vui lòng thử lại.";

// Created FAQs that Haravan does not list yet; module memory is enough because the
// grace window is shorter than a normal admin session.
const pendingFaqs = new Map();

function faqQueryKey(type, objectid) {
  return ["faqs", type, objectid || "0"];
}

function ownerOf(values) {
  return { type: values?.type, objectid: String(values?.objectid ?? "0") };
}

function withCreatedEntry(current, entry) {
  const list = Array.isArray(current) ? current : [];
  if (list.some((item) => String(item.id) === String(entry.id))) return list;
  return sortFaqEntries([...list, entry]);
}

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

export async function deleteFaq({ type, objectid, metafieldid }) {
  const response = await httpClient.delete("/api/metafields", {
    params: { type, objectid, metafieldid },
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

/** Puts a created FAQ into the list cache and keeps it through refetches until Haravan lists it. */
export function registerCreatedFaq(queryClient, values, metafield) {
  const owner = ownerOf(values);
  const entry = buildCreatedFaqEntry(values, metafield);
  if (!entry?.id) return;
  addPendingFaq(pendingFaqs, owner, entry);
  queryClient.setQueryData(faqQueryKey(owner.type, owner.objectid), (current) =>
    withCreatedEntry(current, { ...entry, pending: true })
  );
}

function useFaqErrorHandler() {
  const queryClient = useQueryClient();
  return (error) => {
    const result = toResultError(error);
    if (result.status === 402) {
      queryClient.invalidateQueries({ queryKey: ["trial"] });
    }
    message.error(result.errorMessage || FALLBACK_ERROR);
  };
}

export function useFaqs({ type, objectid }) {
  const target = objectid || "0";
  const hasTarget = type === "shop" || target !== "0";

  return useQuery({
    queryKey: faqQueryKey(type, target),
    queryFn: async () => {
      const owner = { type, objectid: target };
      const entries = sortFaqEntries(toFaqEntries(await fetchFaqs(owner)));
      return sortFaqEntries(mergePendingFaqs(pendingFaqs, owner, entries));
    },
    enabled: hasTarget && hasSession(),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 30 * 1000,
  });
}

export function useCreateFaq() {
  const queryClient = useQueryClient();
  const handleFaqError = useFaqErrorHandler();
  return useMutation({
    mutationFn: createFaq,
    onSuccess: (data, values) => {
      registerCreatedFaq(queryClient, values, data);
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
      message.success("Đã thêm câu hỏi.");
    },
    onError: handleFaqError,
  });
}

export function useUpdateFaq() {
  const queryClient = useQueryClient();
  const handleFaqError = useFaqErrorHandler();
  return useMutation({
    mutationFn: updateFaq,
    onSuccess: (data, values) => {
      const owner = ownerOf(values);
      // A successful update proves Haravan already lists the item.
      forgetPendingFaq(pendingFaqs, owner, values?.metafieldid);
      const entry = buildCreatedFaqEntry(values, data);
      if (entry?.id) {
        queryClient.setQueryData(faqQueryKey(owner.type, owner.objectid), (current) =>
          Array.isArray(current)
            ? sortFaqEntries(
                current.map((item) =>
                  String(item.id) === String(entry.id) ? entry : item
                )
              )
            : current
        );
      }
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
      message.success("Đã cập nhật câu hỏi.");
    },
    onError: handleFaqError,
  });
}

export function useDeleteFaq() {
  const queryClient = useQueryClient();
  const handleFaqError = useFaqErrorHandler();
  return useMutation({
    mutationFn: deleteFaq,
    onSuccess: (_data, values) => {
      const owner = ownerOf(values);
      forgetPendingFaq(pendingFaqs, owner, values?.metafieldid);
      queryClient.setQueryData(faqQueryKey(owner.type, owner.objectid), (current) =>
        Array.isArray(current)
          ? current.filter(
              (item) => String(item.id) !== String(values?.metafieldid)
            )
          : current
      );
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
      message.success("Đã xóa câu hỏi.");
    },
    onError: handleFaqError,
  });
}

export function useReorderFaqs() {
  const queryClient = useQueryClient();
  const handleFaqError = useFaqErrorHandler();
  return useMutation({
    mutationFn: reorderFaqs,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
      message.success("Đã lưu thứ tự câu hỏi.");
    },
    onError: handleFaqError,
  });
}
