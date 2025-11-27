import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import BaseService from "./BaseService";
import httpClient from "../config/AxiosConfig";
import { message } from "antd";

export default class MetafieldsService extends BaseService {
  useGetShop = ({ type, orgid }) => {
    const queryClient = useQueryClient();
    return useQuery({
      queryKey: ["shop", orgid],
      queryFn: async () => {
        try {
          const cache = queryClient.getQueryData(["shop", orgid]);
          if (cache) return cache;

          const response = await httpClient.get(`/api/metafields/shop?type=${type}`); /* prettier-ignore */
          return this.toResult(response);
        } catch (error) {
          const handleError = this.toResultError(error);
          message.error(handleError?.errorMessage).then(() => {
            if (handleError.status == "401") window.location.href = `/install/grandservice?orgid=${orgid}`;
          });
        }
      },
      select: (response) => {
        if (response.data) return response.data;
        return response.data;
      },
    });
  };

  useGetMetafields = (data) => {
    const { type, namespace, objectid } = data;
    const queryClient = useQueryClient();
    const orgid = sessionStorage.getItem("orgid");
    const hasOrgid = orgid && orgid !== 'null' && orgid !== 'undefined' && orgid.trim() !== '';
    
    return useQuery({
      queryKey: ["metafields", type, objectid],
      queryFn: async () => {
        try {
          const cache = queryClient.getQueryData(["metafields", type, objectid]);
          if (cache) return cache;

          const response = await httpClient.get(`/api/metafields?type=${type}&namespace=${namespace}&objectid=${objectid}`); /* prettier-ignore */
          return this.toResult(response);
        } catch (error) {
          const handleError = this.toResultError(error);
          // Only show error message if it's not a 401 (unauthorized) - those are handled by redirect
          if (handleError.status !== 401) {
            // Use a single error message, don't spam
            console.error('Error fetching metafields:', handleError.errorMessage);
          }
          // Return empty array instead of throwing to prevent multiple error messages
          return {
            success: false,
            data: [],
            errorMessage: handleError.errorMessage,
          };
        }
      },
      select: (response) => {
        if (response?.data) return response.data;
        return [];
      },
      enabled: hasOrgid, // Only run query if orgid exists
      retry: false, // Don't retry to avoid multiple error messages
      refetchOnWindowFocus: false, // Don't refetch on focus to avoid errors
    });
  };

  useCreateField = () => {
    const queryClient = useQueryClient(); 
    return useMutation({
      mutationFn: async (variables) => {
        try {
          const response = await httpClient.post(`/api/metafields`, JSON.stringify(variables));
          return this.toResult(response);
        } catch (error) {
          const handleError = this.toResultError(error);
          message.error("Có lỗi xảy ra, vui lòng thử lại");
        }
      },
      onSuccess: (newData, variables) => {
        if (!newData) return;
        const cache = queryClient.getQueryData(["metafields", variables.type, variables.objectid]);
        if (!cache) return;
        queryClient.setQueryData(["metafields", variables.type, variables.objectid], (oddData) => {
          oddData.data.push(newData.data);
          return oddData;
        });
      },
      onError: () => {
        message.error("Có lỗi xảy ra, vui lòng thử lại");
      },
      onSettled: (_data, _error, variables) => {
        message.success("Khởi tạo Field thành công");
        queryClient.invalidateQueries(["metafields", variables.type, variables.objectid]);
      }
    });
  };

  useUpdateField = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (variables) => {
        try {
          const response = await httpClient.put(`/api/metafields`, JSON.stringify(variables));
          return this.toResult(response);
        } catch (error) {
          const handleError = this.toResultError(error);
          message.error(String(handleError.errorMessage));
          throw error;
        }
      },
      onSuccess: (newData, variables) => {
        if (!newData) return;
        const cache = queryClient.getQueryData(["metafields", variables.type, variables.objectid]);
        if (!cache) return;
        queryClient.setQueryData(["metafields", variables.type, variables.objectid], (oddData) => {
          const findOldMetafield = oddData.data.find((metafield) => metafield.id === variables.metafieldid);
          if (findOldMetafield) {
            // Remove cái cũ, append cái mới
            oddData.data = oddData.data.filter((metafield) => metafield.id !== variables.metafieldid);
            oddData.data.push(newData.data);
          }
          return oddData;
        });
      },
      onError: () => {
        message.error("Có lỗi xảy ra, vui lòng thử lại");
      },
      onSettled: (_data, _error, variables) => {
        message.success("Cập nhật Field thành công");
        queryClient.invalidateQueries(["metafields", variables.type, variables.objectid]);
      }
    });
  };

  useDeleteField = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (variables) => {
        try {
          const response = await httpClient.delete(`/api/metafields?metafieldid=${variables.metafieldid}`);
          return this.toResult(response);
        } catch (error) {
          const handleError = this.toResultError(error);
          message.error(String(handleError.errorMessage));
          throw error;
        }
      },
      onSuccess: (newData, variables) => {
        if (!newData) return;
        const cache = queryClient.getQueryData(["metafields", variables.type, variables.objectid]);
        if (!cache) return;
        queryClient.setQueryData(["metafields", variables.type, variables.objectid], (oddData) => {
          const findOldMetafield = oddData.data.find((metafield) => metafield.id === variables.metafieldid);
          if (findOldMetafield) {
            // Remove cái cũ
            oddData.data = oddData.data.filter((metafield) => metafield.id !== variables.metafieldid);
          }
          return oddData;
        });
      },
      onError: () => {
        message.error("Có lỗi xảy ra, vui lòng thử lại");
      },
      onSettled: (_data, _error, variables) => {
        message.success("Xóa Field thành công");
        queryClient.invalidateQueries(["metafields", variables.type, variables.objectid]);
      }
    });
  };
}

export const metafieldsService = new MetafieldsService();
