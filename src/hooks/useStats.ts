import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { DashboardStats } from '@/types';

export function useStats() {
  return useQuery<DashboardStats>({
    queryKey: ['stats'],
    queryFn: async () => {
      const response = await axios.get('/api/stats');
      return response.data;
    },
    staleTime: 30 * 1000, // 30 seconds
  });
}
