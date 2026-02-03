import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { formatCorrectedAge } from "@/lib/calculators";
import { CranialScatterChart } from "./medical-charts";
import type { Measurement } from "@/types";

interface Props {
  measurements: Measurement[];
}

export function TrendCharts({ measurements }: Props) {
  // 按日期排序（升序）
  const sortedData = useMemo(() => {
    return [...measurements]
      .sort((a, b) => new Date(a.measureDate).getTime() - new Date(b.measureDate).getTime())
      .map((m) => ({
        ...m,
        // 格式化显示
        dateLabel: new Date(m.measureDate).toLocaleDateString("zh-CN", {
          month: "numeric",
          day: "numeric",
        }),
        ageLabel: formatCorrectedAge(m.correctedAgeDays),
        // 将 CR 转换为百分比便于显示
        crPercent: m.cr * 100,
      }));
  }, [measurements]);

  if (measurements.length < 1) {
    return (
      <div className="py-12 text-center text-slate-400">
        <p>暂无测量记录</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. 发育趋势分布 (CR vs CVAI) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-medium">发育趋势分布</CardTitle>
          <p className="text-xs text-slate-500">追踪头型变化轨迹 (1, 2, 3...代表测量顺序)</p>
        </CardHeader>
        <CardContent>
          <CranialScatterChart data={measurements} />
        </CardContent>
      </Card>

      {/* 2. 头围生长趋势 */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-base font-medium">头围生长趋势</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={sortedData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="ageLabel" 
                tick={{ fontSize: 11 }}
                stroke="#94a3b8"
                label={{ value: '矫正月龄', position: 'bottom', offset: 0, fontSize: 12, fill: '#94a3b8' }}
              />
              <YAxis 
                domain={["dataMin - 2", "dataMax + 2"]} 
                tick={{ fontSize: 11 }}
                stroke="#94a3b8"
                tickFormatter={(v) => `${v}cm`}
                label={{ value: '头围 (cm)', angle: -90, position: 'left', fontSize: 12, fill: '#94a3b8' }}
              />
              <Tooltip 
                formatter={(value) => [`${Number(value).toFixed(1)}cm`, "头围"]}
                labelFormatter={(label) => `矫正月龄: ${label}`}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
              />
              <Line
                type="monotone"
                dataKey="headCircumference"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 4, fill: "#10b981", strokeWidth: 0 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
