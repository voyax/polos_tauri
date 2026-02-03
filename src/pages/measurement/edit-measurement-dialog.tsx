import { useState, useEffect, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Ruler, AlertCircle } from "lucide-react";
import { Button, Card, Input, DatePicker } from "@/components/ui";
import { useUpdateMeasurement, useMeasurement } from "@/hooks";
import { calculateHeadIndices, calculateCorrectedAgeDays, gradeAll, formatCorrectedAge } from "@/lib/calculators";
import { GradeBadge } from "@/components/common";
import type { Infant } from "@/types";

// 表单验证 schema - 只验证正数，所有单位均为 cm
const measurementSchema = z.object({
  measureDate: z.string().min(1, "请选择测量日期"),
  length: z.number({ message: "请输入数值" }).positive("请输入正数"),
  width: z.number({ message: "请输入数值" }).positive("请输入正数"),
  diagonalA: z.number({ message: "请输入数值" }).positive("请输入正数"),
  diagonalB: z.number({ message: "请输入数值" }).positive("请输入正数"),
  headCircumference: z.number({ message: "请输入数值" }).positive("请输入正数"),
  remark: z.string().optional(),
});

type MeasurementFormData = z.infer<typeof measurementSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  measurementId: number;
  infant: Infant;
  onSuccess?: () => void;
}

export function EditMeasurementDialog({
  open,
  onOpenChange,
  measurementId,
  infant,
  onSuccess,
}: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: measurement } = useMeasurement(measurementId);
  const updateMutation = useUpdateMeasurement();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    control,
  } = useForm<MeasurementFormData>({
    resolver: zodResolver(measurementSchema),
  });

  // 加载测量数据到表单（数据库存储为 mm，转换为 cm 显示）
  useEffect(() => {
    if (measurement) {
      reset({
        measureDate: measurement.measureDate.split("T")[0],
        length: measurement.length / 10, // mm -> cm
        width: measurement.width / 10,
        diagonalA: measurement.diagonalA / 10,
        diagonalB: measurement.diagonalB / 10,
        headCircumference: measurement.headCircumference, // 已经是 cm
        remark: measurement.remark || "",
      });
    }
  }, [measurement, reset]);

  // 监听表单值用于实时计算
  const formValues = watch();

  // 实时计算指标（输入为 cm，转换为 mm 进行计算）
  const calculations = useMemo(() => {
    const { length, width, diagonalA, diagonalB, measureDate } = formValues;
    
    if (!length || !width || !diagonalA || !diagonalB) {
      return null;
    }

    // cm 转 mm 进行计算
    const indices = calculateHeadIndices({ 
      length: length * 10, 
      width: width * 10, 
      diagonalA: diagonalA * 10, 
      diagonalB: diagonalB * 10 
    });
    const correctedAgeDays = measureDate 
      ? calculateCorrectedAgeDays(
          new Date(infant.birthDate),
          infant.gestationalDays,
          new Date(measureDate)
        )
      : 0;
    const grades = gradeAll(indices);

    return {
      ...indices,
      correctedAgeDays,
      grades,
    };
  }, [formValues, infant]);

  const onSubmit = async (data: MeasurementFormData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      // 存储时转换为 mm（颅长、颅宽、斜径），headCircumference 保持 cm
      const dataToSave = {
        ...data,
        length: data.length * 10,
        width: data.width * 10,
        diagonalA: data.diagonalA * 10,
        diagonalB: data.diagonalB * 10,
      };
      await updateMutation.mutateAsync({
        id: measurementId,
        infantId: infant.id,
        infant,
        data: dataToSave,
      });
      onOpenChange(false);
      onSuccess?.();
    } catch (err) {
      console.error("保存失败:", err);
      setError(err instanceof Error ? err.message : "保存失败，请重试");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 遮罩层 */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      
      {/* 弹窗内容 */}
      <Card className="relative w-[520px] max-h-[90vh] flex flex-col overflow-hidden">
        {/* 关闭按钮 */}
        <button
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 z-10"
          onClick={() => onOpenChange(false)}
        >
          <X className="w-5 h-5" />
        </button>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col min-h-0 flex-1">
          {/* 可滚动的内容区域 */}
          <div className="p-6 overflow-y-auto flex-1">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Ruler className="w-5 h-5 text-slate-400" />
              编辑测量记录
            </h2>

            {/* 错误提示 */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* 婴儿信息 */}
            <div className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg mb-6 border border-indigo-100">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                infant.gender === "male" 
                  ? "bg-blue-100 text-blue-600" 
                  : "bg-pink-100 text-pink-600"
              }`}>
                {infant.name[0]}
              </div>
              <div>
                <p className="font-medium text-slate-900">{infant.name}</p>
                <p className="text-xs text-slate-500">
                  {infant.gender === "male" ? "男" : "女"} · {infant.phone}
                </p>
              </div>
            </div>

            {/* 测量数据 - 紧凑网格布局 */}
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 mb-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-slate-500">测量记录</p>
                <p className="text-xs text-slate-400">单位: cm</p>
              </div>

              {/* 测量日期 - 独占一行 */}
              <div className="mb-4">
                <label className="text-sm text-slate-600 mb-1 block">
                  测量日期
                </label>
                <Controller
                  name="measureDate"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="选择测量日期"
                      error={!!errors.measureDate}
                      maxDate={new Date()}
                    />
                  )}
                />
                {errors.measureDate && (
                  <p className="text-xs text-red-500 mt-1">{errors.measureDate.message}</p>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {/* 颅长 (前后径) */}
                <div>
                  <label className="text-sm text-slate-600 mb-1 block">
                    颅长 <span className="text-slate-400 text-xs">(前后径)</span>
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.1"
                      {...register("length", { valueAsNumber: true })}
                      placeholder="例如: 14.5"
                      className={`pr-10 ${errors.length ? "border-red-500" : ""}`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">cm</span>
                  </div>
                  {errors.length && (
                    <p className="text-xs text-red-500 mt-1">{errors.length.message}</p>
                  )}
                </div>

                {/* 颅宽 (左右径) */}
                <div>
                  <label className="text-sm text-slate-600 mb-1 block">
                    颅宽 <span className="text-slate-400 text-xs">(左右径)</span>
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.1"
                      {...register("width", { valueAsNumber: true })}
                      placeholder="例如: 12.0"
                      className={`pr-10 ${errors.width ? "border-red-500" : ""}`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">cm</span>
                  </div>
                  {errors.width && (
                    <p className="text-xs text-red-500 mt-1">{errors.width.message}</p>
                  )}
                </div>

                {/* 左前-右后斜径 */}
                <div>
                  <label className="text-sm text-slate-600 mb-1 block">
                    左前-右后斜径
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.1"
                      {...register("diagonalA", { valueAsNumber: true })}
                      placeholder="例如: 13.5"
                      className={`pr-10 ${errors.diagonalA ? "border-red-500" : ""}`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">cm</span>
                  </div>
                  {errors.diagonalA && (
                    <p className="text-xs text-red-500 mt-1">{errors.diagonalA.message}</p>
                  )}
                </div>

                {/* 右前-左后斜径 */}
                <div>
                  <label className="text-sm text-slate-600 mb-1 block">
                    右前-左后斜径
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.1"
                      {...register("diagonalB", { valueAsNumber: true })}
                      placeholder="例如: 13.8"
                      className={`pr-10 ${errors.diagonalB ? "border-red-500" : ""}`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">cm</span>
                  </div>
                  {errors.diagonalB && (
                    <p className="text-xs text-red-500 mt-1">{errors.diagonalB.message}</p>
                  )}
                </div>

                {/* 头围 */}
                <div>
                  <label className="text-sm text-slate-600 mb-1 block">
                    头围
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      step="0.1"
                      {...register("headCircumference", { valueAsNumber: true })}
                      placeholder="例如: 42.5"
                      className={`pr-10 ${errors.headCircumference ? "border-red-500" : ""}`}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">cm</span>
                  </div>
                  {errors.headCircumference && (
                    <p className="text-xs text-red-500 mt-1">{errors.headCircumference.message}</p>
                  )}
                </div>
              </div>
            </div>

            {/* 计算结果预览 */}
            {calculations && (
              <div className="mb-6 pt-4 border-t border-slate-200">
                <p className="text-xs text-slate-400 uppercase tracking-wider mb-4">计算结果</p>
                
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-semibold text-slate-900 tabular-nums">
                        {(calculations.cr * 100).toFixed(1)}
                      </span>
                      <span className="text-sm text-slate-400">%</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-500">CI</span>
                      <GradeBadge grade={calculations.grades.cr} />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-semibold text-slate-900 tabular-nums">
                        {calculations.cvai.toFixed(2)}
                      </span>
                      <span className="text-sm text-slate-400">%</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-500">CVAI</span>
                      <GradeBadge grade={calculations.grades.cvai} />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-semibold text-slate-900 tabular-nums">
                        {calculations.diff.toFixed(1)}
                      </span>
                      <span className="text-sm text-slate-400">mm</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-500">CVA</span>
                      <GradeBadge grade={calculations.grades.diff} />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                  <span className="text-xs text-slate-400">矫正月龄</span>
                  <span className="text-sm font-medium text-slate-700">
                    {formatCorrectedAge(calculations.correctedAgeDays)}
                  </span>
                </div>
              </div>
            )}

            {/* 备注 */}
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">
                备注 <span className="text-slate-400 font-normal">(可选)</span>
              </label>
              <textarea
                {...register("remark")}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows={2}
                placeholder="输入备注信息..."
              />
            </div>
          </div>

          {/* 固定底部按钮 */}
          <div className="px-6 py-4 bg-slate-50 border-t flex justify-end gap-3 flex-shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              取消
            </Button>
            <Button type="submit" disabled={isSubmitting || !calculations}>
              {isSubmitting ? "保存中..." : "保存修改"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
