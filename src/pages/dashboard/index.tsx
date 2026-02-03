import { useState, useCallback, useRef, useEffect } from "react";
import { 
  Baby, 
  Ruler, 
  TrendingUp,
  CalendarDays,
  Users,
  AlertTriangle,
  Search,
  X,
  ChevronRight,
  Plus,
  Clock,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button, Card, CardContent, CardHeader, CardTitle, Input } from "@/components/ui";
import { useDashboardStats, useTodayMeasurements, useSearchInfants } from "@/hooks";
import { GradeBadge } from "@/components/common";
import { gradeAll } from "@/lib/calculators";
import { correctedDaysToMonths, formatPhone } from "@/lib/utils";
import type { InfantSearchResult, MeasurementWithInfant } from "@/types";

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  isLoading?: boolean;
}

function StatCard({ title, value, description, icon, isLoading }: StatCardProps) {
  return (
    <Card className="flex-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-500">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {isLoading ? "--" : value}
        </div>
        <p className="text-xs text-slate-400">{description}</p>
      </CardContent>
    </Card>
  );
}

// 搜索下拉组件
function SearchDropdown({ 
  keyword, 
  onSelect,
  onCreateNew,
  onClose,
}: { 
  keyword: string;
  onSelect: (infant: InfantSearchResult) => void;
  onCreateNew: () => void;
  onClose: () => void;
}) {
  const { data: results = [], isLoading } = useSearchInfants(keyword);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  if (!keyword.trim()) return null;

  return (
    <div 
      ref={dropdownRef}
      className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg border border-slate-200 shadow-lg z-50 overflow-hidden"
    >
      {isLoading ? (
        <div className="p-4 text-center text-slate-500 text-sm">
          搜索中...
        </div>
      ) : (
        <>
          {results.length > 0 && (
            <div className="max-h-64 overflow-y-auto border-b border-slate-100">
              {results.map((infant) => (
                <button
                  key={infant.id}
                  className="w-full flex items-center gap-3 p-3 hover:bg-slate-50 transition-colors text-left"
                  onClick={() => onSelect(infant)}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium ${
                    infant.gender === "male" 
                      ? "bg-blue-50 text-blue-600" 
                      : "bg-pink-50 text-pink-600"
                  }`}>
                    {infant.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">{infant.name}</p>
                    <p className="text-xs text-slate-500">
                      {infant.gender === "male" ? "男" : "女"} · {formatPhone(infant.phone)}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              ))}
            </div>
          )}
          
          <button
            className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors text-left"
            onClick={onCreateNew}
          >
            <div className="w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center">
              <Plus className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-slate-500">
                {results.length > 0 ? "上述都不是？" : "未找到匹配的宝宝"}
              </p>
              <p className="text-sm font-medium text-indigo-600">
                新建「{keyword}」的档案
              </p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </>
      )}
    </div>
  );
}

// 今日测量记录表格
function TodayRecordsTable() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useTodayMeasurements(page);
  const navigate = useNavigate();

  const handleRowClick = (record: MeasurementWithInfant) => {
    navigate(`/infant/${record.infantId}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-slate-500">加载中...</div>
      </div>
    );
  }

  if (!data?.data.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-slate-400">
        <Ruler className="w-12 h-12 mb-3 stroke-1" />
        <p className="text-lg font-medium text-slate-500">今日暂无测量记录</p>
        <p className="text-sm">在上方搜索框搜索宝宝开始测量</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* 表头 */}
      {/* 表头 */}
      <div className="grid grid-cols-[1.5fr_1.5fr_1.5fr_1fr_2fr_2fr_2fr] gap-4 px-4 py-2 bg-slate-50 text-sm font-medium text-slate-500 border-b">
        <div>时间</div>
        <div>姓名</div>
        <div>矫正月龄</div>
        <div>头围</div>
        <div>CR</div>
        <div>CVAI</div>
        <div>Diff</div>
      </div>

      {/* 数据行 */}
      <div className="flex-1 overflow-y-auto">
        {data.data.map((record) => {
          const grades = gradeAll({ cr: record.cr, diff: record.diff, cvai: record.cvai });
          return (
            <button
              key={record.id}
              className="w-full grid grid-cols-[1.5fr_1.5fr_1.5fr_1fr_2fr_2fr_2fr] gap-4 px-4 py-3 hover:bg-slate-50 transition-colors text-left border-b border-slate-100 items-center"
              onClick={() => handleRowClick(record)}
            >
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {new Date(record.measureDate).toLocaleTimeString("zh-CN", { 
                  hour: "2-digit", 
                  minute: "2-digit" 
                })}
              </div>
              <div className="font-medium text-slate-900 truncate">
                {record.infantName}
              </div>
              <div className="text-sm text-slate-600 truncate">
                {correctedDaysToMonths(record.correctedAgeDays)}
              </div>
              <div className="text-sm text-slate-600 font-medium tabular-nums">
                {record.headCircumference.toFixed(1)}cm
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-900 tabular-nums">{(record.cr * 100).toFixed(1)}%</span>
                <GradeBadge grade={grades.cr} className="scale-90 origin-left" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-900 tabular-nums">{record.cvai.toFixed(1)}%</span>
                <GradeBadge grade={grades.cvai} className="scale-90 origin-left" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-900 tabular-nums">{record.diff.toFixed(1)}mm</span>
                <GradeBadge grade={grades.diff} className="scale-90 origin-left" />
              </div>
            </button>
          );
        })}
      </div>

      {/* 分页 */}
      {data.total > 20 && (
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <span className="text-sm text-slate-500">
            共 {data.total} 条记录
          </span>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              上一页
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              disabled={page * 20 >= data.total}
              onClick={() => setPage(p => p + 1)}
            >
              下一页
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function DashboardPage() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  
  const { data: stats, isLoading } = useDashboardStats();

  const handleSelect = useCallback((infant: InfantSearchResult) => {
    setKeyword("");
    setShowDropdown(false);
    navigate(`/infant/${infant.id}`);
  }, [navigate]);

  const handleCreateNew = useCallback(() => {
    const query = keyword.trim();
    setKeyword("");
    setShowDropdown(false);
    // 判断是手机号还是姓名
    const isPhone = /^\d+$/.test(query);
    navigate(`/infant?create=true&${isPhone ? "phone" : "name"}=${encodeURIComponent(query)}`);
  }, [keyword, navigate]);

  return (
    <div className="flex flex-col gap-6 p-6 h-full">
      {/* 搜索栏 */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="搜索宝宝姓名或手机号..."
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setShowDropdown(true);
            }}
            className="pl-10 pr-10"
          />
          {keyword && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              onClick={() => {
                setKeyword("");
                setShowDropdown(false);
              }}
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {showDropdown && (
            <SearchDropdown
              keyword={keyword}
              onSelect={handleSelect}
              onCreateNew={handleCreateNew}
              onClose={() => setShowDropdown(false)}
            />
          )}
        </div>
        <Button variant="outline" onClick={() => navigate("/infant")}>
          <Users className="mr-2 h-4 w-4" />
          档案管理
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="flex gap-4">
        <StatCard
          title="今日测量"
          value={stats?.todayMeasurements ?? 0}
          description="今日完成测量"
          icon={<Ruler className="h-4 w-4 text-indigo-500" />}
          isLoading={isLoading}
        />
        <StatCard
          title="本周测量"
          value={stats?.weekMeasurements ?? 0}
          description="本周累计"
          icon={<CalendarDays className="h-4 w-4 text-blue-500" />}
          isLoading={isLoading}
        />
        <StatCard
          title="总档案数"
          value={stats?.totalInfants ?? 0}
          description="已建档宝宝"
          icon={<Baby className="h-4 w-4 text-green-500" />}
          isLoading={isLoading}
        />
        <StatCard
          title="异常比例"
          value={stats ? `${(stats.abnormalRatio * 100).toFixed(0)}%` : "0%"}
          description="需关注比例"
          icon={<AlertTriangle className="h-4 w-4 text-amber-500" />}
          isLoading={isLoading}
        />
      </div>

      {/* 今日测量记录 */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between py-3 border-b">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-slate-500" />
            今日测量记录
          </CardTitle>
        </CardHeader>
        <div className="flex-1 overflow-hidden">
          <TodayRecordsTable />
        </div>
      </Card>
    </div>
  );
}
