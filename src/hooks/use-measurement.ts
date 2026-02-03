// 测量记录数据 Hooks

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMeasurementsByInfantId,
  getMeasurementById,
  createMeasurement,
  updateMeasurement,
  deleteMeasurement,
} from "@/lib/database";
import { calculateHeadIndices, calculateCorrectedAgeDays } from "@/lib/calculators";
import type { MeasurementFormData, Infant } from "@/types";

// 查询键
export const measurementKeys = {
  all: ["measurements"] as const,
  lists: () => [...measurementKeys.all, "list"] as const,
  byInfant: (infantId: number) => [...measurementKeys.lists(), { infantId }] as const,
  details: () => [...measurementKeys.all, "detail"] as const,
  detail: (id: number) => [...measurementKeys.details(), id] as const,
};

/**
 * 获取婴儿的测量记录列表
 */
export function useMeasurementsByInfant(infantId: number | null) {
  return useQuery({
    queryKey: measurementKeys.byInfant(infantId!),
    queryFn: () => getMeasurementsByInfantId(infantId!),
    enabled: infantId !== null,
  });
}

/**
 * 获取单个测量记录
 */
export function useMeasurement(id: number | null) {
  return useQuery({
    queryKey: measurementKeys.detail(id!),
    queryFn: () => getMeasurementById(id!),
    enabled: id !== null,
  });
}

/**
 * 创建测量记录
 */
export function useCreateMeasurement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      infantId,
      infant,
      data,
    }: {
      infantId: number;
      infant: Infant;
      data: MeasurementFormData;
    }) => {
      // 计算指标
      const indices = calculateHeadIndices({
        length: data.length,
        width: data.width,
        diagonalA: data.diagonalA,
        diagonalB: data.diagonalB,
      });

      // 计算矫正月龄
      const correctedAgeDays = calculateCorrectedAgeDays(
        new Date(infant.birthDate),
        infant.gestationalDays,
        new Date(data.measureDate)
      );

      return createMeasurement({
        infantId,
        measureDate: data.measureDate,
        length: data.length,
        width: data.width,
        diagonalA: data.diagonalA,
        diagonalB: data.diagonalB,
        headCircumference: data.headCircumference,
        cr: indices.cr,
        diff: indices.diff,
        cvai: indices.cvai,
        correctedAgeDays,
        remark: data.remark,
      });
    },
    onSuccess: (_, { infantId }) => {
      queryClient.invalidateQueries({ queryKey: measurementKeys.byInfant(infantId) });
      // 也刷新 dashboard 数据
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

/**
 * 更新测量记录
 */
export function useUpdateMeasurement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      infantId,
      infant,
      data,
    }: {
      id: number;
      infantId: number;
      infant: Infant;
      data: Partial<MeasurementFormData>;
    }) => {
      // infantId 用于 onSuccess 缓存失效
      void infantId;
      
      const updateData: Parameters<typeof updateMeasurement>[1] = {};

      // 如果有测量值更新，重新计算指标
      if (
        data.length !== undefined ||
        data.width !== undefined ||
        data.diagonalA !== undefined ||
        data.diagonalB !== undefined
      ) {
        // 需要所有测量值
        const indices = calculateHeadIndices({
          length: data.length!,
          width: data.width!,
          diagonalA: data.diagonalA!,
          diagonalB: data.diagonalB!,
        });
        updateData.cr = indices.cr;
        updateData.diff = indices.diff;
        updateData.cvai = indices.cvai;
      }

      if (data.measureDate) {
        updateData.measureDate = data.measureDate;
        updateData.correctedAgeDays = calculateCorrectedAgeDays(
          new Date(infant.birthDate),
          infant.gestationalDays,
          new Date(data.measureDate)
        );
      }

      if (data.length !== undefined) updateData.length = data.length;
      if (data.width !== undefined) updateData.width = data.width;
      if (data.diagonalA !== undefined) updateData.diagonalA = data.diagonalA;
      if (data.diagonalB !== undefined) updateData.diagonalB = data.diagonalB;
      if (data.headCircumference !== undefined) updateData.headCircumference = data.headCircumference;
      if (data.remark !== undefined) updateData.remark = data.remark;

      return updateMeasurement(id, updateData);
    },
    onSuccess: (_, { id, infantId }) => {
      queryClient.invalidateQueries({ queryKey: measurementKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: measurementKeys.byInfant(infantId) });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}

/**
 * 删除测量记录
 */
export function useDeleteMeasurement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteMeasurement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: measurementKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
