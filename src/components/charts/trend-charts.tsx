import { useMemo } from "react";
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { formatCorrectedAge } from "@/lib/calculators";
import { getWHOData, type Gender } from "@/lib/data/who-percentiles";
import { CranialScatterChart } from "./medical-charts";
import type { Measurement } from "@/types";

interface Props {
  measurements: Measurement[];
  gender?: Gender;
}

// Percentile line styles
const PERCENTILE_STYLES = {
  P3: { stroke: '#ef4444', strokeWidth: 1.5, strokeDasharray: '4 2' },
  P10: { stroke: '#f97316', strokeWidth: 1, strokeDasharray: '3 3' },
  P25: { stroke: '#eab308', strokeWidth: 1, strokeDasharray: '2 2' },
  P50: { stroke: '#22c55e', strokeWidth: 2, strokeDasharray: '0' },
  P75: { stroke: '#eab308', strokeWidth: 1, strokeDasharray: '2 2' },
  P90: { stroke: '#f97316', strokeWidth: 1, strokeDasharray: '3 3' },
  P97: { stroke: '#ef4444', strokeWidth: 1.5, strokeDasharray: '4 2' },
};

export function TrendCharts({ measurements, gender = '男' }: Props) {
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
        // 矫正月龄（用于对齐WHO曲线）
        ageMonths: m.correctedAgeDays / 30.44,
      }));
  }, [measurements]);

  // 合并 WHO 百分位数据和宝宝数据
  const chartData = useMemo(() => {
    const whoData = getWHOData(gender);
    
    // 创建月龄为基准的数据集
    const dataByMonth: Record<number, any> = {};
    
    // 添加 WHO 数据点 (0-24个月)
    whoData.forEach(d => {
      dataByMonth[d.month] = {
        month: d.month,
        P3: d.P3,
        P10: d.P10,
        P25: d.P25,
        P50: d.P50,
        P75: d.P75,
        P90: d.P90,
        P97: d.P97,
        babyHC: null,
      };
    });
    
    // 添加宝宝的测量数据
    sortedData.forEach((m, idx) => {
      const roundedMonth = Math.round(m.ageMonths * 10) / 10;
      const nearestMonth = Math.round(m.ageMonths);
      
      // 如果该月龄已有 WHO 数据，直接添加宝宝数据
      if (dataByMonth[nearestMonth]) {
        // 创建一个新的数据点用于宝宝的精确月龄
        const whoPoint = whoData.find(d => d.month === nearestMonth);
        dataByMonth[roundedMonth] = {
          month: roundedMonth,
          P3: whoPoint?.P3,
          P10: whoPoint?.P10,
          P25: whoPoint?.P25,
          P50: whoPoint?.P50,
          P75: whoPoint?.P75,
          P90: whoPoint?.P90,
          P97: whoPoint?.P97,
          babyHC: m.headCircumference,
          measureIndex: idx + 1,
        };
      } else {
        // 插值获取该月龄的百分位值
        const floorMonth = Math.floor(m.ageMonths);
        const ceilMonth = Math.ceil(m.ageMonths);
        const floorData = whoData.find(d => d.month === floorMonth);
        const ceilData = whoData.find(d => d.month === ceilMonth);
        
        if (floorData && ceilData) {
          const fraction = m.ageMonths - floorMonth;
          dataByMonth[roundedMonth] = {
            month: roundedMonth,
            P3: floorData.P3 + (ceilData.P3 - floorData.P3) * fraction,
            P10: floorData.P10 + (ceilData.P10 - floorData.P10) * fraction,
            P25: floorData.P25 + (ceilData.P25 - floorData.P25) * fraction,
            P50: floorData.P50 + (ceilData.P50 - floorData.P50) * fraction,
            P75: floorData.P75 + (ceilData.P75 - floorData.P75) * fraction,
            P90: floorData.P90 + (ceilData.P90 - floorData.P90) * fraction,
            P97: floorData.P97 + (ceilData.P97 - floorData.P97) * fraction,
            babyHC: m.headCircumference,
            measureIndex: idx + 1,
          };
        }
      }
    });
    
    // 转换为数组并按月龄排序
    return Object.values(dataByMonth).sort((a, b) => a.month - b.month);
  }, [sortedData, gender]);

  // 计算Y轴范围
  const yDomain = useMemo(() => {
    const allValues = chartData.flatMap(d => [d.P3, d.P97, d.babyHC].filter(Boolean));
    const min = Math.floor(Math.min(...allValues) - 1);
    const max = Math.ceil(Math.max(...allValues) + 1);
    return [min, max];
  }, [chartData]);

  // 计算X轴范围（基于宝宝实际年龄）
  const xDomain = useMemo(() => {
    if (sortedData.length === 0) return [0, 12];
    const maxAge = Math.max(...sortedData.map(d => d.ageMonths));
    // 扩展一点范围，最小显示12个月
    return [0, Math.max(12, Math.ceil(maxAge) + 1)];
  }, [sortedData]);

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
      <Card className="overflow-visible">
        <CardHeader>
          <CardTitle className="text-base font-medium">发育趋势分布</CardTitle>
          <p className="text-xs text-slate-500">追踪头型变化轨迹 (1, 2, 3...代表测量顺序)</p>
        </CardHeader>
        <CardContent className="overflow-visible">
          <CranialScatterChart data={measurements} />
        </CardContent>
      </Card>

      {/* 2. 头围生长曲线 (带WHO百分位) */}
      <Card>
        <CardHeader className="py-3">
          <CardTitle className="text-base font-medium">{gender}童头围生长曲线</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 25 }}>
              <defs>
                {/* 正常范围渐变填充 (P3-P97) */}
                <linearGradient id="normalRange" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22c55e" stopOpacity={0.1} />
                  <stop offset="50%" stopColor="#22c55e" stopOpacity={0.15} />
                  <stop offset="100%" stopColor="#22c55e" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              
              <XAxis 
                dataKey="month" 
                type="number"
                domain={xDomain}
                tick={{ fontSize: 10 }}
                stroke="#94a3b8"
                tickFormatter={(v) => `${v}月`}
                label={{ value: '矫正月龄', position: 'bottom', offset: 10, fontSize: 11, fill: '#64748b' }}
              />
              
              <YAxis 
                domain={yDomain}
                tick={{ fontSize: 10 }}
                stroke="#94a3b8"
                tickFormatter={(v) => `${v}`}
                label={{ value: '头围 (cm)', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#64748b' }}
              />
              
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const data = payload[0]?.payload;
                  return (
                    <div className="bg-white rounded-lg shadow-lg border border-slate-200 p-3 text-xs">
                      <div className="font-medium text-slate-700 mb-2">
                        矫正月龄: {typeof label === 'number' ? label.toFixed(1) : label} 个月
                      </div>
                      {data?.babyHC && (
                        <div className="flex items-center gap-2 text-blue-600 font-bold mb-2">
                          <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                          宝宝头围: {data.babyHC.toFixed(1)} cm
                        </div>
                      )}
                      <div className="space-y-0.5 text-slate-500">
                        <div>P97: {data?.P97?.toFixed(1)} cm</div>
                        <div>P50: {data?.P50?.toFixed(1)} cm</div>
                        <div>P3: {data?.P3?.toFixed(1)} cm</div>
                      </div>
                    </div>
                  );
                }}
              />

              {/* 正常范围区域 (P10-P90) - 用 Area 填充 */}
              <Area
                type="monotone"
                dataKey="P90"
                stroke="none"
                fill="url(#normalRange)"
                fillOpacity={1}
              />

              {/* WHO 百分位线 */}
              <Line 
                type="monotone" 
                dataKey="P3" 
                {...PERCENTILE_STYLES.P3}
                dot={false}
                isAnimationActive={false}
              />
              <Line 
                type="monotone" 
                dataKey="P10" 
                {...PERCENTILE_STYLES.P10}
                dot={false}
                isAnimationActive={false}
              />
              <Line 
                type="monotone" 
                dataKey="P25" 
                {...PERCENTILE_STYLES.P25}
                dot={false}
                isAnimationActive={false}
              />
              <Line 
                type="monotone" 
                dataKey="P50" 
                {...PERCENTILE_STYLES.P50}
                dot={false}
                isAnimationActive={false}
              />
              <Line 
                type="monotone" 
                dataKey="P75" 
                {...PERCENTILE_STYLES.P75}
                dot={false}
                isAnimationActive={false}
              />
              <Line 
                type="monotone" 
                dataKey="P90" 
                {...PERCENTILE_STYLES.P90}
                dot={false}
                isAnimationActive={false}
              />
              <Line 
                type="monotone" 
                dataKey="P97" 
                {...PERCENTILE_STYLES.P97}
                dot={false}
                isAnimationActive={false}
              />

              {/* 宝宝的生长曲线 - 突出显示 */}
              <Line
                type="monotone"
                dataKey="babyHC"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ r: 5, fill: "#2563eb", strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 7, fill: "#2563eb", strokeWidth: 2, stroke: "#fff" }}
                connectNulls
                isAnimationActive={true}
              />
            </ComposedChart>
          </ResponsiveContainer>
          
          {/* 百分位图例 */}
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-3 text-[10px] text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-4 h-0.5" style={{ backgroundColor: '#ef4444' }}></span> P3/P97
            </span>
            <span className="flex items-center gap-1">
              <span className="w-4 h-0.5" style={{ backgroundColor: '#f97316' }}></span> P10/P90
            </span>
            <span className="flex items-center gap-1">
              <span className="w-4 h-0.5" style={{ backgroundColor: '#eab308' }}></span> P25/P75
            </span>
            <span className="flex items-center gap-1">
              <span className="w-4 h-0.5" style={{ backgroundColor: '#22c55e' }}></span> P50
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: '#2563eb' }}></span> 宝宝
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
