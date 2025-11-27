import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import BaseService from "./BaseService";
import httpClient from "../config/AxiosConfig";
import { message } from "antd";

export default class TrialService extends BaseService {
  useGetTrialInfo = (orgid) => {
    const queryClient = useQueryClient();
    return useQuery({
      queryKey: ["trial", orgid],
      queryFn: async () => {
        try {
          const cache = queryClient.getQueryData(["trial", orgid]);
          if (cache) return cache;

          const response = await httpClient.get(`/api/oauth/install/trial?orgid=${orgid}`);
          return this.toResult(response);
        } catch (error) {
          const handleError = this.toResultError(error);
          // Don't show error message for trial info, just return default
          return {
            success: false,
            data: {
              status: 'trial',
              expires_at: null,
              days_remaining: 0,
              is_unlimited: false,
            },
            errorMessage: handleError?.errorMessage,
          };
        }
      },
      select: (response) => {
        if (response.data) return response.data;
        return {
          status: 'trial',
          expires_at: null,
          days_remaining: 0,
          is_unlimited: false,
        };
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: true,
    });
  };

  useSetTrialUnlimited = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (orgid) => {
        try {
          const response = await httpClient.post(`/api/oauth/install/trial/unlimited`, { orgid });
          return this.toResult(response);
        } catch (error) {
          const handleError = this.toResultError(error);
          message.error(handleError?.errorMessage || 'Không thể kích hoạt trial vĩnh viễn');
          throw error;
        }
      },
      onSuccess: (data, orgid) => {
        queryClient.invalidateQueries({ queryKey: ["trial", orgid] });
        message.success('Đã kích hoạt trial vĩnh viễn thành công!');
      },
      onError: (error) => {
        console.error('Error setting trial unlimited:', error);
      },
    });
  };
}

export const trialService = new TrialService();

