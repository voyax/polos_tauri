import { AlertTriangle, X } from "lucide-react";
import { Button, Card } from "@/components/ui";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void | Promise<void>;
  variant?: "default" | "destructive";
  isLoading?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText = "确认",
  cancelText = "取消",
  onConfirm,
  variant = "default",
  isLoading = false,
}: ConfirmDialogProps) {
  if (!open) return null;

  const handleConfirm = async () => {
    await onConfirm();
    onOpenChange(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 遮罩层 */}
      <div 
        className="absolute inset-0 bg-black/50"
        onClick={() => !isLoading && onOpenChange(false)}
      />
      
      {/* 弹窗内容 */}
      <Card className="relative w-[400px] p-6">
        {/* 关闭按钮 */}
        <button
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
          onClick={() => onOpenChange(false)}
          disabled={isLoading}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex gap-4">
          {/* 图标 */}
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
            variant === "destructive" 
              ? "bg-red-100 text-red-600" 
              : "bg-indigo-100 text-indigo-600"
          }`}>
            <AlertTriangle className="w-5 h-5" />
          </div>

          {/* 内容 */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            <p className="mt-2 text-sm text-slate-500 whitespace-pre-line">{description}</p>
          </div>
        </div>

        {/* 按钮 */}
        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant === "destructive" ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? "处理中..." : confirmText}
          </Button>
        </div>
      </Card>
    </div>
  );
}
