import { NavLink, Outlet } from "react-router-dom";
import { 
  LayoutDashboard, 
  Baby, 
  Settings,
  Menu
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import { useState } from "react";

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  collapsed?: boolean;
}

function NavItem({ to, icon, label, collapsed }: NavItemProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-slate-100",
          isActive
            ? "bg-slate-100 text-slate-900 font-medium"
            : "text-slate-500",
          collapsed && "justify-center px-2"
        )
      }
    >
      {icon}
      {!collapsed && <span>{label}</span>}
    </NavLink>
  );
}

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false);
  
  return (
    <div className="flex h-screen bg-slate-50">
      {/* 侧边栏 */}
      <aside
        className={cn(
          "flex flex-col border-r border-slate-200 bg-white transition-all duration-300",
          collapsed ? "w-16" : "w-60"
        )}
      >
        {/* 顶部 Logo 区域 */}
        <div className="flex h-14 items-center border-b border-slate-200 px-4">
          {!collapsed && (
            <h1 className="text-lg font-semibold truncate">婴儿头型测量</h1>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={cn("ml-auto", collapsed && "mx-auto")}
            onClick={() => setCollapsed(!collapsed)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 space-y-1 p-2">
          <NavItem
            to="/"
            icon={<LayoutDashboard className="h-5 w-5" />}
            label="首页"
            collapsed={collapsed}
          />
          <NavItem
            to="/infant"
            icon={<Baby className="h-5 w-5" />}
            label="婴儿管理"
            collapsed={collapsed}
          />
        </nav>

        {/* 底部设置 */}
        <div className="border-t border-slate-200 p-2">
          <NavItem
            to="/settings"
            icon={<Settings className="h-5 w-5" />}
            label="系统设置"
            collapsed={collapsed}
          />
        </div>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
