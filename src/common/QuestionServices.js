import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { message } from "antd";
import httpClient from "../config/AxiosConfig";
import { hasCredentials } from "../lib/session";
import { toResult, toResultError } from "./apiResult";

const FALLBACK_ERROR = "Có lỗi xảy ra, vui lòng thử lại.";

export async function fetchQuestions(state) {
  const response = await httpClient.get("/api/questions", { params: { state } });
  const data = toResult(response).data ?? {};
  return {
    questions: Array.isArray(data.questions) ? data.questions : [],
    pending: Number(data.pending) || 0,
  };
}

export async function fetchQuestionCount() {
  const response = await httpClient.get("/api/questions/count");
  return Number(toResult(response).data?.pending) || 0;
}

export async function publishQuestion(values) {
  const response = await httpClient.post("/api/questions/publish", values);
  return toResult(response).data;
}

export async function dismissQuestion(id) {
  const response = await httpClient.post("/api/questions/dismiss", { id });
  return toResult(response).data;
}

export function useQuestions(state) {
  return useQuery({
    queryKey: ["questions", state],
    queryFn: () => fetchQuestions(state),
    enabled: hasCredentials(),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 15 * 1000,
  });
}

export function useQuestionCount() {
  return useQuery({
    queryKey: ["question-count"],
    queryFn: fetchQuestionCount,
    enabled: hasCredentials(),
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 30 * 1000,
    // A shopper can submit at any hour; poll often while questions wait, rarely once quiet.
    refetchInterval: (query) => (query.state.data > 0 ? 60 * 1000 : 10 * 60 * 1000),
  });
}

function useQuestionErrorHandler() {
  const queryClient = useQueryClient();
  return (error) => {
    const result = toResultError(error);
    if (result.status === 402) {
      queryClient.invalidateQueries({ queryKey: ["trial"] });
    }
    message.error(result.errorMessage || FALLBACK_ERROR);
  };
}

export function usePublishQuestion() {
  const queryClient = useQueryClient();
  const handleError = useQuestionErrorHandler();
  return useMutation({
    mutationFn: publishQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      queryClient.invalidateQueries({ queryKey: ["question-count"] });
      queryClient.invalidateQueries({ queryKey: ["faqs"] });
      message.success("Đã đăng câu hỏi lên FAQ.");
    },
    onError: handleError,
  });
}

export function useDismissQuestion() {
  const queryClient = useQueryClient();
  const handleError = useQuestionErrorHandler();
  return useMutation({
    mutationFn: dismissQuestion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["questions"] });
      queryClient.invalidateQueries({ queryKey: ["question-count"] });
      message.success("Đã bỏ qua câu hỏi.");
    },
    onError: handleError,
  });
}
