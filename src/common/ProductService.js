import { useQuery } from '@tanstack/react-query';
import BaseService from "./BaseService";
import httpClient from "../config/AxiosConfig";

export default class ProductService extends BaseService {
  useSearchProducts = (query, limit = 10) => {
    const orgid = sessionStorage.getItem("orgid");
    const hasOrgid = orgid && orgid !== 'null' && orgid !== 'undefined' && orgid.trim() !== '';
    
    return useQuery({
      queryKey: ["products", "search", query],
      queryFn: async () => {
        if (!query || query.trim() === '' || !hasOrgid) {
          return { products: [] };
        }

        try {
          const response = await httpClient.get(`/api/oauth/install/products/search?q=${encodeURIComponent(query.trim())}&limit=${limit}`);
          return this.toResult(response);
        } catch (error) {
          const handleError = this.toResultError(error);
          console.error('Error searching products:', handleError);
          return { products: [] };
        }
      },
      select: (response) => {
        if (response?.data?.products) return response.data.products;
        return [];
      },
      enabled: hasOrgid && !!query && query.trim() !== '' && query.length >= 2, // Only run if orgid exists, query is not empty and at least 2 characters
      staleTime: 5 * 60 * 1000, // 5 minutes cache to reduce API calls (respect Haravan rate limit)
      gcTime: 10 * 60 * 1000, // 10 minutes garbage collection time (React Query v5)
      retry: false,
      refetchOnWindowFocus: false, // Don't refetch on focus to reduce API calls
    });
  };
}

export const productService = new ProductService();

