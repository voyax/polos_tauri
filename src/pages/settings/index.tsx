import { useState, useRef, useEffect } from "react";
import { Building2, Upload, Save, Check, RotateCcw } from "lucide-react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from "@/components/ui";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getHospitalConfig, updateHospitalConfig, getSystemStats } from "@/lib/database";

export function SettingsPage() {
  const queryClient = useQueryClient();
  const [hospitalName, setHospitalName] = useState("");
  const [logoPath, setLogoPath] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 获取配置
  const { data: config, isLoading } = useQuery({
    queryKey: ["hospitalConfig"],
    queryFn: getHospitalConfig,
  });

  // 更新 Mutation
  const updateMutation = useMutation({
    mutationFn: updateHospitalConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hospitalConfig"] });
    },
  });

  // 加载现有配置
  useEffect(() => {
    if (config) {
      setHospitalName(config.hospitalName || "");
      setLogoPath(config.logoPath || null);
    }
  }, [config]);

  const handleLogoSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 创建预览 URL
      const url = URL.createObjectURL(file);
      setLogoPreview(url);
      
      // 将文件转换为 base64 存储
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setLogoPath(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateMutation.mutateAsync({
        hospitalName,
        logoPath: logoPath || undefined,
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      console.error("保存失败:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (config) {
      setHospitalName(config.hospitalName || "");
      setLogoPath(config.logoPath || null);
      setLogoPreview(null);
    }
  };

  const hasChanges = config && (
    hospitalName !== (config.hospitalName || "") ||
    logoPath !== (config.logoPath || null)
  );

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <p className="text-slate-400">加载中...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-semibold mb-6">系统设置</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Building2 className="w-5 h-5 text-slate-500" />
            医院信息
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* 医院名称 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">医院名称</label>
            <Input
              value={hospitalName}
              onChange={(e) => setHospitalName(e.target.value)}
              placeholder="请输入医院名称"
            />
            <p className="text-xs text-slate-400">
              医院名称将显示在测量报告上
            </p>
          </div>

          {/* 医院 Logo */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">医院 Logo</label>
            
            <div className="flex items-start gap-4">
              {/* Logo 预览 */}
              <div className="w-24 h-24 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center overflow-hidden bg-slate-50">
                {(logoPreview || logoPath) ? (
                  <img 
                    src={logoPreview || logoPath || ""} 
                    alt="医院 Logo" 
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Building2 className="w-8 h-8 text-slate-300" />
                )}
              </div>

              {/* 上传按钮 */}
              <div className="flex-1">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleLogoSelect}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  选择图片
                </Button>
                <p className="text-xs text-slate-400 mt-2">
                  建议尺寸: 200x200px，支持 PNG、JPG 格式
                </p>
              </div>
            </div>
          </div>

          {/* 保存按钮 */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            {hasChanges && (
              <Button
                variant="outline"
                onClick={handleReset}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                重置
              </Button>
            )}
            <Button
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
            >
              {saveSuccess ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  已保存
                </>
              ) : isSaving ? (
                "保存中..."
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  保存设置
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 数据统计 */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">数据统计</CardTitle>
        </CardHeader>
        <CardContent>
          <DataStats />
        </CardContent>
      </Card>

      {/* 关于信息 */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">关于</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-slate-600 space-y-1">
            <p><span className="text-slate-400">应用版本:</span> 0.1.0</p>
            <p><span className="text-slate-400">作者:</span> voya</p>
            <p><span className="text-slate-400">邮箱:</span> <a href="mailto:hi@melolib.com" className="text-indigo-600 hover:underline">hi@melolib.com</a></p>
            <p className="text-xs text-slate-400 pt-2">© {new Date().getFullYear()} voya. All rights reserved.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// 数据统计组件
function DataStats() {
  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ["systemStats"],
    queryFn: getSystemStats,
  });

  if (isLoading) {
    return <div className="text-slate-400 text-sm">加载中...</div>;
  }

  // 处理错误或无数据情况（如浏览器环境下 Tauri 插件不可用）
  const displayStats = stats || { totalInfants: 0, totalMeasurements: 0 };

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="p-4 bg-slate-50 rounded-lg">
        <p className="text-xs text-slate-500 mb-1">总档案数</p>
        <p className="text-2xl font-semibold text-slate-900">
          {isError ? "--" : displayStats.totalInfants}
        </p>
      </div>
      <div className="p-4 bg-slate-50 rounded-lg">
        <p className="text-xs text-slate-500 mb-1">总测量记录</p>
        <p className="text-2xl font-semibold text-slate-900">
          {isError ? "--" : displayStats.totalMeasurements}
        </p>
      </div>
    </div>
  );
}

