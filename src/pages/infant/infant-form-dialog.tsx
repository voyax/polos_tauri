import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, AlertCircle } from "lucide-react";
import { Button, Card, Input } from "@/components/ui";
import { useCreateInfant, useUpdateInfant, useInfant } from "@/hooks";
import { totalDaysToGestational } from "@/lib/calculators";

// 表单验证 schema
const infantSchema = z.object({
  name: z.string().min(1, "请输入姓名"),
  gender: z.enum(["male", "female"]),
  birthDate: z.string().min(1, "请选择出生日期"),
  gestationalWeeks: z.number().min(28, "孕周不能小于28周").max(42, "孕周不能大于42周"),
  gestationalDays: z.number().min(0).max(6, "孕天应在0-6之间"),
  phone: z.string().min(11, "请输入有效的手机号").max(11, "手机号应为11位"),
});

type InfantFormData = z.infer<typeof infantSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editId?: number;
  prefillPhone?: string;
  prefillName?: string;
  onSuccess?: (id: number) => void;
}

export function InfantFormDialog({
  open,
  onOpenChange,
  editId,
  prefillPhone,
  prefillName,
  onSuccess,
}: Props) {
  const isEdit = !!editId;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  
  // 获取编辑数据
  const { data: infant } = useInfant(editId ?? null);
  
  // Mutations
  const createMutation = useCreateInfant();
  const updateMutation = useUpdateInfant();

  // 表单
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<InfantFormData>({
    resolver: zodResolver(infantSchema),
    defaultValues: {
      name: prefillName ?? "",
      gender: "male",
      birthDate: new Date().toISOString().split("T")[0],
      gestationalWeeks: 40,
      gestationalDays: 0,
      phone: prefillPhone ?? "",
    },
  });

  // 加载编辑数据
  useState(() => {
    if (infant) {
      const gest = totalDaysToGestational(infant.gestationalDays);
      reset({
        name: infant.name,
        gender: infant.gender,
        birthDate: infant.birthDate.split("T")[0],
        gestationalWeeks: gest.weeks,
        gestationalDays: gest.days,
        phone: infant.phone,
      });
    }
  });

  const onSubmit = async (data: InfantFormData) => {
    setIsSubmitting(true);
    setServerError(null);
    try {
      if (isEdit && editId) {
        await updateMutation.mutateAsync({ id: editId, data });
        onSuccess?.(editId);
      } else {
        const newId = await createMutation.mutateAsync(data);
        onSuccess?.(newId);
      }
      onOpenChange(false);
      reset();
    } catch (error) {
      console.error("保存失败:", error);
      
      let errorMessage = "保存失败，请重试";
      
      // 统一转换为字符串处理
      const errorStr = String(error);
      console.log("捕获到的错误:", error, typeof error); // 调试用

      if (errorStr.includes("UNIQUE constraint failed") || errorStr.includes("Unique constraint failed") || errorStr.includes("already exists")) {
        errorMessage = "该宝宝的档案已存在，请勿重复创建";
      } else {
        // 尝试提取有用的错误信息
        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (typeof error === 'string') {
          errorMessage = error;
        } else {
          errorMessage = errorStr;
        }
      }
      
      setServerError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedGender = watch("gender");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 遮罩层 */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      
      {/* 弹窗内容 */}
      <Card className="relative w-[480px] max-h-[90vh] overflow-auto">
        {/* 关闭按钮 */}
        <button
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
          onClick={() => onOpenChange(false)}
        >
          <X className="w-5 h-5" />
        </button>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-6">
              {isEdit ? "编辑宝宝信息" : "新建宝宝档案"}
            </h2>

            <div className="space-y-4">
              {/* 后端错误提示 */}
              {serverError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600 mb-4">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">{serverError}</span>
                </div>
              )}

              {/* 姓名 */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">姓名</label>
                <Input
                  {...register("name")}
                  placeholder="请输入宝宝姓名"
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-xs text-red-500">{errors.name.message}</p>
                )}
              </div>

              {/* 性别 */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">性别</label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    className={`flex-1 py-2 rounded-lg border transition-colors ${
                      selectedGender === "male"
                        ? "border-blue-500 bg-blue-50 text-blue-600"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                    onClick={() => setValue("gender", "male")}
                  >
                    男
                  </button>
                  <button
                    type="button"
                    className={`flex-1 py-2 rounded-lg border transition-colors ${
                      selectedGender === "female"
                        ? "border-pink-500 bg-pink-50 text-pink-600"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                    onClick={() => setValue("gender", "female")}
                  >
                    女
                  </button>
                </div>
              </div>

              {/* 出生日期 */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">出生日期</label>
                <Input
                  type="date"
                  {...register("birthDate")}
                  className={errors.birthDate ? "border-red-500" : ""}
                />
                {errors.birthDate && (
                  <p className="text-xs text-red-500">{errors.birthDate.message}</p>
                )}
              </div>

              {/* 孕周 */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">孕周</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    {...register("gestationalWeeks", { valueAsNumber: true })}
                    className={`w-20 ${errors.gestationalWeeks ? "border-red-500" : ""}`}
                    min={28}
                    max={42}
                  />
                  <span className="text-slate-500">周</span>
                  <span className="text-slate-300">+</span>
                  <Input
                    type="number"
                    {...register("gestationalDays", { valueAsNumber: true })}
                    className={`w-20 ${errors.gestationalDays ? "border-red-500" : ""}`}
                    min={0}
                    max={6}
                  />
                  <span className="text-slate-500">天</span>
                </div>
                {(errors.gestationalWeeks || errors.gestationalDays) && (
                  <p className="text-xs text-red-500">
                    {errors.gestationalWeeks?.message || errors.gestationalDays?.message}
                  </p>
                )}
              </div>

              {/* 联系电话 */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-slate-700">联系电话</label>
                <Input
                  {...register("phone")}
                  placeholder="请输入手机号"
                  maxLength={11}
                  className={errors.phone ? "border-red-500" : ""}
                />
                {errors.phone && (
                  <p className="text-xs text-red-500">{errors.phone.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* 底部按钮 */}
          <div className="px-6 py-4 bg-slate-50 border-t flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              取消
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "保存中..." : "保存"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
