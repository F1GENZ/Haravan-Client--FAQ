import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      retry: 1,
      retryDelay: (retryCount) => Math.min(retryCount * 1000, 5000),
      staleTime: 30 * 1000,
    },
    mutations: {
      retry: false,
    },
  },
});
