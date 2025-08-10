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
    const { type, namespace } = data;
    const queryClient = useQueryClient();
    return useQuery({
      queryKey: ["metafields", type],
      queryFn: async () => {
        try {
          const cache = queryClient.getQueryData(["metafields", type]);
          if (cache) return cache;
 
          const response = await httpClient.get(`/api/metafields?type=${type}&namespace=${namespace}`); /* prettier-ignore */
          return this.toResult(response);
        } catch (error) {
          const handleError = this.toResultError(error);
          message.error(String(handleError.errorMessage));
          throw error;
        }
      },
      select: (response) => {
        if (response.data) return response.data;
        return response.data;
      },
    });
  };

  useCreateField = () => {
    const queryClient = useQueryClient(); 
    return useMutation({
      mutationFn: async (variables) => {
        try {
          const response = await httpClient.post(`/api/metafields`, variables);
          return this.toResult(response);
        } catch (error) {
          const handleError = this.toResultError(error);
          window.error("Có lỗi xảy ra, vui lòng thử lại");
        }
      },
      onSuccess: (newData, variables) => {
        if (!newData) return;
        const cache = queryClient.getQueryData(["metafields", variables.type]);
        if (!cache) return;
        queryClient.setQueryData(["metafields", variables.type], (oddData) => {
          oddData.data.metafields.push(newData.data.metafield);
          return oddData;
        });
      },
      onSettled: (_data, _error, variables) => {
        setTimeout(() => {
          message.success("Cập nhật Field thành công");
          queryClient.invalidateQueries(["metafields", variables.type]);
        }, 2500);
      }
    });
  };

  useUpdateFieldv2 = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (variables) => {
        try {
          const response = await httpClient.put(`/api/metafields`, variables);
          return this.toResult(response);
        } catch (error) {
          const handleError = this.toResultError(error);
          message.error(String(handleError.errorMessage));
          throw error;
        }
      },
      onSuccess: (newData, variables) => {
        if (!newData) return;
        const cache = queryClient.getQueryData(["metafields", variables.type]);
        if (!cache) return;
        queryClient.setQueryData(["metafields", variables.type], (oddData) => {
          const findOldMetafield = oddData.data.metafields.find((metafield) => metafield.id === variables.metafieldID);
          if (findOldMetafield) {
            // Remove cái cũ, append cái mới
            oddData.data.metafields = oddData.data.metafields.filter((metafield) => metafield.id !== variables.metafieldID);
            oddData.data.metafields.push(newData.data.metafield);
          }
          return oddData;
        });
      },
      onSettled: (_data, _error, variables) => {
        setTimeout(() => {
          message.success("Cập nhật Field thành công");
          queryClient.invalidateQueries(["metafields", variables.type]);
        }, 1500);
      }
    });
  };

  useUpdateField = () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (variables) => {
        try {
          const response = await httpClient.put(`/api/metafields?orgid=${variables.orgid}`, variables);
          return this.toResult(response);
        } catch (error) {
          const handleError = this.toResultError(error);
          message.error(String(handleError.errorMessage));
          throw error;
        }
      },
      onSuccess: (newData, variables) => {
        if (!newData) return;
        const cache = queryClient.getQueryData(["metafields", variables.type]);
        if (!cache) return;
        queryClient.setQueryData(["metafields", variables.type], (oddData) => {
          const findOldMetafield = oddData.data.metafields.find((metafield) => metafield.id === variables.metafieldID);
          if (findOldMetafield) {
            // Remove cái cũ, append cái mới
            oddData.data.metafields = oddData.data.metafields.filter((metafield) => metafield.id !== variables.metafieldID);
            oddData.data.metafields.push(newData.data.metafield);
          }
          return oddData;
        });
      },
      onSettled: (_data, _error, variables) => {
        setTimeout(() => {
          message.success("Cập nhật Field thành công");
          queryClient.invalidateQueries(["metafields", variables.type]);
        }, 1500);
      }
    });
  };
}

export const metafieldsService = new MetafieldsService();
