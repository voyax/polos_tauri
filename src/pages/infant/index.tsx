import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { 
  Search, 
  Plus, 
  Baby, 
  ChevronRight,
} from "lucide-react";
import { Button, Input } from "@/components/ui";
import { useSearchInfants } from "@/hooks";
import { InfantFormDialog } from "./infant-form-dialog";
import { InfantDetailPanel } from "./infant-detail-panel";
import { calculateAge } from "@/lib/utils";
import type { InfantSearchResult } from "@/types";

export function InfantListPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [keyword, setKeyword] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(
    id ? parseInt(id, 10) : null
  );
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  
  // 获取列表数据
  const { data: infants = [], isLoading } = useSearchInfants(keyword);
  
  // 根据 URL 参数决定是否打开创建对话框
  useEffect(() => {
    if (searchParams.get("create") === "true") {
      setShowCreateDialog(true);
    }
  }, [searchParams]);

  // 同步 URL id 到 state
  useEffect(() => {
    if (id) {
      setSelectedId(parseInt(id, 10));
    }
  }, [id]);

  const handleSelect = useCallback((infant: InfantSearchResult) => {
    setSelectedId(infant.id);
    navigate(`/infant/${infant.id}`);
  }, [navigate]);

  const handleCreate = useCallback(() => {
    setShowCreateDialog(true);
  }, []);

  const handleCreated = useCallback((newId: number) => {
    setShowCreateDialog(false);
    setSelectedId(newId);
    navigate(`/infant/${newId}`);
  }, [navigate]);

  return (
    <div className="flex h-full">
      {/* 左侧：婴儿列表 */}
      <div className="w-80 border-r border-slate-200 bg-white flex flex-col">
        {/* 搜索栏 */}
        <div className="p-4 border-b border-slate-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="搜索姓名或手机号..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* 新建按钮 */}
        <div className="px-4 py-2">
          <Button className="w-full" onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            新建档案
          </Button>
        </div>

        {/* 婴儿列表 */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              加载中...
            </div>
          ) : infants.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Baby className="w-12 h-12 mb-3 stroke-1" />
              <p className="text-sm">暂无婴儿档案</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {infants.map((infant) => (
                <InfantListItem
                  key={infant.id}
                  infant={infant}
                  isSelected={selectedId === infant.id}
                  onClick={() => handleSelect(infant)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 右侧：详情面板 */}
      <div className="flex-1 overflow-y-auto bg-slate-50">
        {selectedId ? (
          <InfantDetailPanel 
            infantId={selectedId} 
            onEdit={() => setEditId(selectedId)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <Baby className="w-16 h-16 mb-4 stroke-1" />
            <p className="text-lg font-medium text-slate-500">选择左侧宝宝查看详情</p>
            <p className="text-sm">或点击"新建档案"添加宝宝</p>
          </div>
        )}
      </div>

      {/* 创建弹窗 */}
      <InfantFormDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        prefillPhone={searchParams.get("phone") ?? undefined}
        prefillName={searchParams.get("name") ?? undefined}
        onSuccess={handleCreated}
      />

      {/* 编辑弹窗 */}
      {editId && (
        <InfantFormDialog
          open={true}
          onOpenChange={(open) => !open && setEditId(null)}
          editId={editId}
          onSuccess={() => setEditId(null)}
        />
      )}
    </div>
  );
}

// 婴儿列表项组件
function InfantListItem({
  infant,
  isSelected,
  onClick,
}: {
  infant: InfantSearchResult;
  isSelected: boolean;
  onClick: () => void;
}) {
  const age = calculateAge(infant.birthDate);
  
  return (
    <button
      className={`w-full flex items-center gap-3 p-3 text-left transition-colors ${
        isSelected 
          ? "bg-indigo-50 border-l-2 border-indigo-500" 
          : "hover:bg-slate-50 border-l-2 border-transparent"
      }`}
      onClick={onClick}
    >
      {/* 头像 */}
      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
        infant.gender === "male" 
          ? "bg-blue-50 text-blue-600" 
          : "bg-pink-50 text-pink-600"
      }`}>
        {infant.name[0]}
      </div>
      
      {/* 信息 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-900 truncate">{infant.name}</span>
          {infant.phone && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 font-mono">
              {infant.phone.slice(-4)}
            </span>
          )}
          <span className={`text-xs px-1.5 py-0.5 rounded ${
            infant.gender === "male" 
              ? "bg-blue-50 text-blue-600" 
              : "bg-pink-50 text-pink-600"
          }`}>
            {infant.gender === "male" ? "男" : "女"}
          </span>
        </div>
        <p className="text-xs text-slate-500 mt-0.5">
          {age.months}月{age.days}天 · {infant.measurementCount}次测量
        </p>
      </div>

      <ChevronRight className="w-4 h-4 text-slate-300" />
    </button>
  );
}
