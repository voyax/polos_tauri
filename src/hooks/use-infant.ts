// 婴儿数据 Hooks

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  searchInfants, 
  getInfants, 
  getInfantById, 
  createInfant, 
  updateInfant, 
  deleteInfant 
} from "@/lib/database";
import { gestationalToTotalDays } from "@/lib/calculators";
import type { InfantFormData } from "@/types";

// 查询键
export const infantKeys = {
  all: ["infants"] as const,
  lists: () => [...infantKeys.all, "list"] as const,
  list: (filters: { keyword?: string }) => [...infantKeys.lists(), filters] as const,
  details: () => [...infantKeys.all, "detail"] as const,
  detail: (id: number) => [...infantKeys.details(), id] as const,
};

/**
 * 搜索婴儿
 */
export function useSearchInfants(keyword: string) {
  return useQuery({
    queryKey: infantKeys.list({ keyword }),
    queryFn: () => (keyword.trim() ? searchInfants(keyword.trim()) : getInfants()),
    staleTime: 1000 * 30, // 30秒内不重新请求
  });
}

/**
 * 获取婴儿列表
 */
export function useInfants() {
  return useQuery({
    queryKey: infantKeys.lists(),
    queryFn: () => getInfants(),
    staleTime: 1000 * 60, // 1分钟
  });
}

/**
 * 获取单个婴儿详情
 */
export function useInfant(id: number | null) {
  return useQuery({
    queryKey: infantKeys.detail(id!),
    queryFn: () => getInfantById(id!),
    enabled: id !== null,
  });
}

/**
 * 创建婴儿
 */
export function useCreateInfant() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: InfantFormData) => createInfant({
      name: data.name,
      gender: data.gender,
      birthDate: data.birthDate,
      gestationalDays: gestationalToTotalDays(data.gestationalWeeks, data.gestationalDays),
      phone: data.phone,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: infantKeys.lists() });
    },
  });
}

/**
 * 更新婴儿
 */
export function useUpdateInfant() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<InfantFormData> }) => {
      const updateData: Parameters<typeof updateInfant>[1] = {};
      if (data.name) updateData.name = data.name;
      if (data.gender) updateData.gender = data.gender;
      if (data.birthDate) updateData.birthDate = data.birthDate;
      if (data.gestationalWeeks !== undefined && data.gestationalDays !== undefined) {
        updateData.gestationalDays = gestationalToTotalDays(data.gestationalWeeks, data.gestationalDays);
      }
      if (data.phone) updateData.phone = data.phone;
      return updateInfant(id, updateData);
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: infantKeys.lists() });
      queryClient.invalidateQueries({ queryKey: infantKeys.detail(id) });
    },
  });
}

/**
 * 删除婴儿
 */
export function useDeleteInfant() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => deleteInfant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: infantKeys.lists() });
    },
  });
}
