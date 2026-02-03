import { NavLink, Outlet } from "react-router-dom";
import { 
  LayoutDashboard, 
  Baby, 
  Settings,
  Menu,
  Building2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import { useState } from "react";
import { useHospitalConfig } from "@/hooks";

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
  const { data: hospitalConfig } = useHospitalConfig();
  
  const hospitalName = hospitalConfig?.hospitalName || "婴儿头型测量";
  const logoPath = hospitalConfig?.logoPath;
  
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
          {collapsed ? (
            logoPath ? (
              <img src={logoPath} alt="Logo" className="h-8 w-8 object-contain mx-auto" />
            ) : (
              <Building2 className="h-6 w-6 text-slate-600 mx-auto" />
            )
          ) : (
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {logoPath ? (
                <img src={logoPath} alt="Logo" className="h-8 w-8 object-contain flex-shrink-0" />
              ) : (
                <Building2 className="h-6 w-6 text-slate-600 flex-shrink-0" />
              )}
              <span className="font-semibold text-sm truncate">{hospitalName}</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={cn("flex-shrink-0", collapsed && "hidden")}
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
