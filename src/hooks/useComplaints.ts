import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { ComplaintWithRelations } from '@/types';

interface ComplaintsResponse {
  complaints: ComplaintWithRelations[];
  total: number;
  page: number;
  totalPages: number;
}

interface ComplaintsFilterParams {
  status?: string;
  categoryId?: string;
  departmentId?: string;
  isFlagged?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  my?: boolean;
}

export function useComplaints(filters: ComplaintsFilterParams = {}) {
  return useQuery<ComplaintsResponse>({
    queryKey: ['complaints', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.status && filters.status !== 'ALL') params.append('status', filters.status);
      if (filters.categoryId && filters.categoryId !== 'ALL') params.append('categoryId', filters.categoryId);
      if (filters.departmentId && filters.departmentId !== 'ALL') params.append('departmentId', filters.departmentId);
      if (filters.isFlagged) params.append('isFlagged', 'true');
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', filters.page.toString());
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.my) params.append('my', 'true');

      const response = await axios.get(`/api/complaints?${params.toString()}`);
      return response.data;
    },
  });
}

export function useComplaint(id: string | number) {
  return useQuery<{ complaint: ComplaintWithRelations }>({
    queryKey: ['complaint', id],
    queryFn: async () => {
      const response = await axios.get(`/api/complaints/${id}`);
      return response.data;
    },
    enabled: !!id,
  });
}

export function useUpdateComplaint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      comment,
      priority,
      departmentId,
    }: {
      id: number;
      status: string;
      comment: string;
      priority?: string;
      departmentId?: number;
    }) => {
      const response = await axios.patch(`/api/complaints/${id}`, {
        status,
        comment,
        priority,
        departmentId,
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] });
      queryClient.invalidateQueries({ queryKey: ['complaint', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
}
