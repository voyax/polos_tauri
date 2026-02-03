import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Edit, 
  Trash2, 
  Plus, 
  Calendar, 
  Phone, 
  Clock, 
  Ruler,
  TrendingUp,
  FileText,
  X,
} from "lucide-react";
import { Button, Card, CardContent, CardHeader } from "@/components/ui";
import { useInfant, useMeasurementsByInfant, useDeleteInfant, useDeleteMeasurement } from "@/hooks";
import { GradeBadge } from "@/components/common";
import { TrendCharts } from "@/components/charts";
import { MeasurementReport } from "@/components/report";
import { gradeAll, formatGestationalAge, formatCorrectedAge } from "@/lib/calculators";
import { formatDate, calculateAge } from "@/lib/utils";
import { NewMeasurementDialog } from "../measurement/new-measurement-dialog";
import { EditMeasurementDialog } from "../measurement/edit-measurement-dialog";
import type { Measurement, Infant } from "@/types";

interface Props {
  infantId: number;
  onEdit?: () => void;
}

export function InfantDetailPanel({ infantId, onEdit }: Props) {
  const navigate = useNavigate();
  const { data: infant, isLoading } = useInfant(infantId);
  const { data: measurements = [] } = useMeasurementsByInfant(infantId);
  const deleteMutation = useDeleteInfant();
  
  const [showMeasurementDialog, setShowMeasurementDialog] = useState(false);
  const [editMeasurementId, setEditMeasurementId] = useState<number | null>(null);
  const [reportMeasurementId, setReportMeasurementId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"records" | "trends">("records");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        加载中...
      </div>
    );
  }

  if (!infant) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        婴儿档案不存在
      </div>
    );
  }

  const age = calculateAge(infant.birthDate);
  const isPremature = infant.gestationalDays < 259; // 37周

  const handleDelete = async () => {
    if (confirm(`确定要删除「${infant.name}」的档案吗？\n\n此操作将同时删除该宝宝的所有测量记录，且不可恢复。`)) {
      await deleteMutation.mutateAsync(infantId);
      navigate("/infant");
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* 基本信息卡片 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            {/* 左侧：头像和基本信息 */}
            <div className="flex gap-4">
              {/* 头像 */}
              <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-medium ${
                infant.gender === "male" 
                  ? "bg-blue-50 text-blue-600" 
                  : "bg-pink-50 text-pink-600"
              }`}>
                {infant.name[0]}
              </div>
              
              {/* 信息 */}
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="text-xl font-semibold">{infant.name}</h2>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    infant.gender === "male" 
                      ? "bg-blue-50 text-blue-600" 
                      : "bg-pink-50 text-pink-600"
                  }`}>
                    {infant.gender === "male" ? "男" : "女"}
                  </span>
                </div>
                
                {/* 年龄徽章 */}
                <div className="flex gap-2">
                  <span className="text-sm px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    月龄 {age.months}月{age.days}天
                  </span>
                  {isPremature && (
                    <span className="text-sm px-2 py-0.5 rounded bg-indigo-50 text-indigo-600">
                      矫正 {formatCorrectedAge(calculateCorrectedAgeDays(infant))}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* 右侧：操作按钮 */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit className="w-4 h-4 mr-1" />
                编辑
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-red-500 hover:bg-red-50"
                onClick={handleDelete}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                删除
              </Button>
            </div>
          </div>

          {/* 详细信息 */}
          <div className="grid grid-cols-4 gap-6 mt-6 pt-6 border-t border-slate-100">
            <InfoItem 
              icon={<Calendar className="w-4 h-4" />}
              label="出生日期"
              value={formatDate(infant.birthDate)}
            />
            <InfoItem 
              icon={<Clock className="w-4 h-4" />}
              label="孕周"
              value={formatGestationalAge(infant.gestationalDays)}
            />
            <InfoItem 
              icon={<Phone className="w-4 h-4" />}
              label="联系电话"
              value={infant.phone}
            />
            <InfoItem 
              icon={<Calendar className="w-4 h-4" />}
              label="建档时间"
              value={formatDate(infant.createdAt)}
            />
          </div>
        </CardContent>
      </Card>

      {/* 测量记录 / 发育趋势 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between py-4 border-b">
          {/* Tab 切换 */}
          <div className="flex gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === "records"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              onClick={() => setActiveTab("records")}
            >
              <Ruler className="w-4 h-4 inline mr-1.5" />
              测量记录
            </button>
            <button
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === "trends"
                  ? "bg-white text-indigo-600 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              onClick={() => setActiveTab("trends")}
            >
              <TrendingUp className="w-4 h-4 inline mr-1.5" />
              发育趋势
            </button>
          </div>

          {/* 新增按钮 */}
          {activeTab === "records" && (
            <Button size="sm" onClick={() => setShowMeasurementDialog(true)}>
              <Plus className="w-4 h-4 mr-1" />
              新增记录
            </Button>
          )}
        </CardHeader>

        <CardContent className="p-4">
          {activeTab === "records" ? (
            <MeasurementList 
              measurements={measurements} 
              infant={infant}
              onEdit={(id) => setEditMeasurementId(id)}
              onReport={(id) => setReportMeasurementId(id)}
            />
          ) : (
            <TrendCharts measurements={measurements} gender={infant?.gender === 'male' ? '男' : '女'} />
          )}
        </CardContent>
      </Card>

      {/* 新建测量弹窗 */}
      {infant && (
        <NewMeasurementDialog
          open={showMeasurementDialog}
          onOpenChange={setShowMeasurementDialog}
          infant={infant}
        />
      )}

      {/* 编辑测量弹窗 */}
      {infant && editMeasurementId && (
        <EditMeasurementDialog
          open={true}
          onOpenChange={(open) => !open && setEditMeasurementId(null)}
          measurementId={editMeasurementId}
          infant={infant}
          onSuccess={() => setEditMeasurementId(null)}
        />
      )}

      {/* 报告弹窗 */}
      {infant && reportMeasurementId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* 遮罩 */}
          <div 
            className="absolute inset-0 bg-black/50"
            onClick={() => setReportMeasurementId(null)}
          />
          {/* 弹窗内容 */}
          <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto m-4">
            <button
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 z-10"
              onClick={() => setReportMeasurementId(null)}
            >
              <X className="w-5 h-5" />
            </button>
            <div className="p-6">
              <MeasurementReport 
                infant={infant} 
                measurements={measurements}
                currentMeasurement={measurements.find(m => m.id === reportMeasurementId)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 信息项组件
function InfoItem({ 
  icon, 
  label, 
  value 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-slate-400 mb-1">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="font-medium text-slate-900">{value}</p>
    </div>
  );
}

// 测量记录列表
function MeasurementList({ 
  measurements,
  infant,
  onEdit,
  onReport,
}: { 
  measurements: Measurement[];
  infant: Infant;
  onEdit: (id: number) => void;
  onReport: (id: number) => void;
}) {
  if (measurements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400">
        <Ruler className="w-12 h-12 mb-3 stroke-1" />
        <p className="text-sm">暂无测量记录</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {measurements.map((m) => (
        <MeasurementCard 
          key={m.id} 
          measurement={m} 
          infant={infant}
          onEdit={() => onEdit(m.id)}
          onReport={() => onReport(m.id)}
        />
      ))}
    </div>
  );
}

// 测量记录卡片
function MeasurementCard({ 
  measurement, 
  infant: _infant, // 保留用于未来功能
  onEdit,
  onReport,
}: { 
  measurement: Measurement;
  infant: Infant;
  onEdit: () => void;
  onReport: () => void;
}) {
  const m = measurement;
  const grades = gradeAll({ cr: m.cr, diff: m.diff, cvai: m.cvai });
  const deleteMutation = useDeleteMeasurement();

  const handleDelete = async () => {
    if (confirm("确定要删除这条测量记录吗？\n\n此操作不可恢复。")) {
      await deleteMutation.mutateAsync(m.id);
    }
  };

  return (
    <div className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
      {/* 顶部：日期和操作 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Calendar className="w-4 h-4" />
          {formatDate(m.measureDate, "datetime")}
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={onReport}>
            <FileText className="w-3.5 h-3.5 mr-1" />
            报告
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 px-2 text-xs"
            onClick={onEdit}
          >
            <Edit className="w-3.5 h-3.5 mr-1" />
            编辑
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-7 px-2 text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={handleDelete}
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" />
            删除
          </Button>
        </div>
      </div>

      {/* 指标数据 */}
      <div className="grid grid-cols-5 gap-4">
        <div>
          <p className="text-xs text-slate-500 mb-1">CR (头颅指数)</p>
          <GradeBadge 
            grade={grades.cr} 
            value={`${(m.cr * 100).toFixed(1)}%`} 
          />
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">CVAI (%)</p>
          <GradeBadge 
            grade={grades.cvai} 
            value={`${m.cvai.toFixed(1)}%`} 
          />
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">Diff (mm)</p>
          <GradeBadge 
            grade={grades.diff} 
            value={`${m.diff.toFixed(1)}mm`} 
          />
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">头围 (cm)</p>
          <span className="text-sm font-medium text-slate-700">
            {m.headCircumference.toFixed(1)}
          </span>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-1">矫正月龄</p>
          <span className="text-sm font-medium text-slate-700">
            {formatCorrectedAge(m.correctedAgeDays)}
          </span>
        </div>
      </div>
    </div>
  );
}

// 计算矫正天龄的辅助函数
function calculateCorrectedAgeDays(infant: { birthDate: string; gestationalDays: number }): number {
  const fullTermDays = 280;
  const pretermDays = Math.max(0, fullTermDays - infant.gestationalDays);
  const now = new Date();
  const birth = new Date(infant.birthDate);
  const actualDays = Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(0, actualDays - pretermDays);
}
