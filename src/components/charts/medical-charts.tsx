import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceArea,
} from "recharts";
import { formatCorrectedAge } from "@/lib/calculators";
import type { Measurement } from "@/types";

// ----- Gauge Chart Components -----

interface Range {
  min: number;
  max: number;
  color: string;
  label?: string; // e.g. "正常", "轻度"
}

interface GaugeProps {
  value: number;
  label: string; // e.g. "斜头指数 CVAI (%)"
  valLabel: string; // e.g. "4.5"
  ranges: Range[];
  min: number;
  max: number;
  unit?: string; // "%" or ""
  ticks?: number[]; // custom ticks to show below
  tickFormatter?: (value: number) => string;
}

export function CranialIndexGauge({
  value,
  label,
  valLabel,
  ranges,
  min,
  max,
  unit = "",
  ticks,
  tickFormatter,
}: GaugeProps) {
  // Calculate percentage position for the pointer
  // Clamp value between min and max
  const clampedValue = Math.min(Math.max(value, min), max);
  const percentage = ((clampedValue - min) / (max - min)) * 100;

  return (
    <div className="flex items-center gap-6 py-4">
      {/* Left: Label and Value Box */}
      <div className="w-48 flex-shrink-0">
        <div className="text-sm font-medium text-slate-700 mb-1">{label}</div>
        <div className="inline-block bg-[#5aaeb1] text-white px-3 py-1 rounded text-lg font-bold">
          {valLabel}{unit}
        </div>
      </div>

      {/* Right: Gauge Bar */}
      <div className="flex-1 relative pt-6 pb-2">
        {/* The Bar */}
        <div className="h-4 w-full flex rounded-full overflow-hidden relative z-0">
          {ranges.map((range, idx) => {
            const rangeWidth = ((range.max - range.min) / (max - min)) * 100;
            return (
              <div
                key={idx}
                style={{ width: `${rangeWidth}%`, backgroundColor: range.color }}
                className="h-full border-r border-white/20 last:border-0"
              />
            );
          })}
        </div>
        
        {/* Ticks & Labels */}
        <div className="relative h-6 mt-1 text-xs text-slate-500 font-medium">
          {ticks?.map((tick) => {
            const pos = ((tick - min) / (max - min)) * 100;
            // Don't show ticks too close to edges to avoid overflow
            if (pos < 0 || pos > 100) return null;
            return (
              <div
                key={tick}
                className="absolute top-0 -translate-x-1/2 flex flex-col items-center"
                style={{ left: `${pos}%` }}
              >
                <div className="h-1.5 w-px bg-slate-300 mb-0.5"></div>
                <span>{tickFormatter ? tickFormatter(tick) : tick.toFixed(2).replace(/\.?0+$/, "")}</span>
              </div>
            );
          })}
        </div>

        {/* Pointer Triangle */}
        <div
          className="absolute top-4 -translate-x-1/2 z-10 drop-shadow-md transition-all duration-500"
          style={{ left: `${percentage}%` }}
        >
          {/* Triangle pointing up */}
          <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[12px] border-b-black" />
        </div>
      </div>
    </div>
  );
}

// ----- Scatter Chart Component -----

const CustomScatterShape = (props: any) => {
  const { cx, cy, payload } = props;
  // Pin shape: Circle centered slightly above the analytical point (cx, cy)
  // cy is the data point. We want the pin tip to be at cy.
  const r = 12;
  const pinHeight = 8;
  const centerCy = cy - r - pinHeight;

  return (
    <g style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>
       {/* Pin Pointer - slightly larger for better visibility */}
       <path 
         d={`M ${cx} ${cy} L ${cx - 5} ${centerCy + r * 0.5} L ${cx + 5} ${centerCy + r * 0.5} Z`} 
         fill="white" stroke="#1f2937" strokeWidth={1.5} 
       />
       {/* Circle Body - with thicker border for better visibility */}
       <circle cx={cx} cy={centerCy} r={r} fill="white" stroke="#1f2937" strokeWidth={2} />
       {/* Index Number */}
       <text x={cx} y={centerCy} dy={4} textAnchor="middle" fontSize={11} fill="#000" fontWeight="bold">
         {payload.index}
       </text>
    </g>
  );
};


interface ZoneChartProps {
  data: Measurement[];
}

export function CranialScatterChart({ data }: ZoneChartProps) {
  const scatterData = data.map((m, index) => ({
    x: Number(m.cr.toFixed(3)),
    y: Number(m.cvai.toFixed(2)),
    index: index + 1,                   
    date: m.measureDate,
    age: formatCorrectedAge(m.correctedAgeDays),
  }));

  const xDomain: [number, number] = [0.70, 1.02]; 
  const yDomain: [number, number] = [0, 16];

  const colors = {
      bgRed: "#fca5a5",
      yellowFill: "#fde68a",
      yellowStroke: "#f59e0b",
      blueFill: "#a5f3fc",
      blueStroke: "#06b6d4",
      greenFill: "#4ade80",
      greenStroke: "#16a34a",
  };

  // All ticks from 0.70 to 1.02 at 0.01 intervals for dense grid lines
  const xTicks = Array.from({ length: 33 }, (_, i) => Number((0.70 + i * 0.01).toFixed(2)));

  // Chart margins - minimized left margin
  const chartMargin = { top: 15, right: 15, bottom: 25, left: 5 };

  return (
    <div className="w-full bg-white rounded-lg relative">
      {/* Legend - Top Right */}
      <div className="flex justify-end gap-4 text-sm font-medium mb-1 px-2">
        <div className="flex items-center gap-1.5">
            <div className="w-4 h-3 rounded" style={{ backgroundColor: colors.greenFill }}></div>
            <span className="text-xs">正常</span>
        </div>
        <div className="flex items-center gap-1.5">
            <div className="w-4 h-3 rounded" style={{ backgroundColor: colors.blueFill }}></div>
            <span className="text-xs">轻度</span>
        </div>
        <div className="flex items-center gap-1.5">
            <div className="w-4 h-3 rounded" style={{ backgroundColor: colors.yellowFill }}></div>
            <span className="text-xs">中度</span>
        </div>
        <div className="flex items-center gap-1.5">
            <div className="w-4 h-3 rounded" style={{ backgroundColor: colors.bgRed }}></div>
            <span className="text-xs">重度</span>
        </div>
      </div>

      {/* Chart Container */}
      <div className="relative h-[380px]">
        {/* CVAI label */}
        <div className="absolute left-0 top-0 text-[10px] font-medium text-gray-500 z-10">CVAI(%)</div>

        {/* === HTML OVERLAY LABELS (z-20 ensures visibility above chart) === */}

        {/* Plagiocephaly Label - at CR=0.845 */}
        <div 
          className="absolute z-20 flex flex-col items-center justify-center px-3 py-1.5 bg-white/90 rounded-full border border-red-400 shadow-sm pointer-events-none"
          style={{ left: '50%', top: '20px', transform: 'translateX(-50%)' }}>
          <span className="text-xs font-bold text-gray-800 leading-tight">斜头</span>
          <span className="text-[9px] text-red-500 font-semibold leading-tight">Plagiocephaly</span>
        </div>

        {/* Arrow line (CSS) - from below label to X-axis */}
        <div 
          className="absolute z-10 pointer-events-none bg-gray-700"
          style={{ 
            left: '50%', 
            top: '68px',
            bottom: '56px',
            width: '2px',
            transform: 'translateX(-50%)'
          }}
        />
        {/* Arrowhead pointing up */}
        <div 
          className="absolute z-15 pointer-events-none"
          style={{ 
            left: '50%', 
            top: '58px', 
            transform: 'translateX(-50%)',
            width: 0, height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderBottom: '10px solid #374151'
          }}
        />

        {/* Scaphocephaly Label - positioned inside the red zone on far left */}
        <div 
          className="absolute z-20 flex flex-col items-center justify-center px-3 py-1.5 bg-white/90 rounded-full border border-red-400 shadow-sm pointer-events-none"
          style={{ left: '15%', top: '50%', transform: 'translateY(-50%)' }}>
          <span className="text-xs font-bold text-gray-800 leading-tight">长头</span>
          <span className="text-[9px] text-red-500 font-semibold leading-tight">Scaphocephaly</span>
        </div>

        {/* Brachycephaly Label - at CR=0.985, CVAI=7.5 (right side in red zone) */}
        <div 
          className="absolute z-20 flex flex-col items-center justify-center px-3 py-1.5 bg-white/90 rounded-full border border-red-400 shadow-sm pointer-events-none"
          style={{ right: '5%', top: '50%', transform: 'translateY(-50%)' }}>
          <span className="text-xs font-bold text-gray-800 leading-tight">扁头</span>
          <span className="text-[9px] text-red-500 font-semibold leading-tight">Brachycephaly</span>
        </div>

        {/* Left Triangle (pointing left) - at extreme left edge */}
        <div 
          className="absolute z-15 pointer-events-none"
          style={{ left: '2px', bottom: '40px', width: 0, height: 0,
            borderTop: '6px solid transparent', borderBottom: '6px solid transparent',
            borderRight: '10px solid #374151' }}
        />

        {/* Right Triangle (pointing right) - at extreme right edge */}
        <div 
          className="absolute z-15 pointer-events-none"
          style={{ right: '0px', bottom: '40px', width: 0, height: 0,
            borderTop: '6px solid transparent', borderBottom: '6px solid transparent',
            borderLeft: '10px solid #374151' }}
        />

        {/* The Chart */}
        <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={chartMargin}>
            
            {/* Grid */}
            <CartesianGrid strokeDasharray="2 2" stroke="#fecaca" strokeOpacity={0.8} />
            
            {/* X Axis - show label only every 0.02 but grid line every 0.01 */}
            <XAxis 
                type="number" 
                dataKey="x" 
                name="CR" 
                domain={xDomain}
                ticks={xTicks}
                tick={{ fontSize: 8, fill: "#374151" }}
                tickFormatter={(v) => {
                  // Only show label for even ticks (0.70, 0.72, 0.74...)
                  const cents = Math.round((v - 0.70) * 100);
                  return cents % 2 === 0 ? v.toFixed(2) : '';
                }}
                axisLine={{ stroke: '#9ca3af' }}
                tickLine={{ stroke: '#9ca3af' }}
            />
            
            {/* Y Axis */}
            <YAxis 
                type="number" 
                dataKey="y" 
                name="CVAI" 
                domain={yDomain} 
                ticks={[0, 2, 4, 6, 8, 10, 12, 14, 16]}
                tick={{ fontSize: 9, fill: "#374151" }}
                axisLine={{ stroke: '#9ca3af' }}
                tickLine={{ stroke: '#9ca3af' }}
                width={22}
            />

            <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip />} />

            {/* ZONES */}
            <ReferenceArea x1={0.70} x2={1.02} y1={0} y2={16} fill={colors.bgRed} fillOpacity={0.6} stroke="none" />
            <ReferenceArea x1={0.76} x2={0.95} y1={0} y2={8.75} fill={colors.yellowFill} fillOpacity={0.85} stroke={colors.yellowStroke} strokeWidth={2} />
            <ReferenceArea x1={0.79} x2={0.92} y1={0} y2={6.25} fill={colors.blueFill} fillOpacity={0.85} stroke={colors.blueStroke} strokeWidth={2} />
            <ReferenceArea x1={0.82} x2={0.87} y1={0} y2={3.5} fill={colors.greenFill} fillOpacity={1} stroke={colors.greenStroke} strokeWidth={2} />


            {/* Data Points */}
            <Scatter 
                name="Measurements" 
                data={scatterData} 
                shape={<CustomScatterShape />}
                isAnimationActive={false}
            />
            
            </ScatterChart>
        </ResponsiveContainer>

        {/* CR(%) label */}
        <div className="absolute bottom-0 right-4 text-[10px] font-medium text-gray-500">CR(%)</div>
      </div>
    </div>
  );
}


const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="bg-white p-2 border border-slate-200 shadow-lg rounded-lg text-xs">
                <p className="font-bold mb-1 text-gray-800">第 {data.index} 次测量</p>
                <p className="text-gray-600">CR: <span className="font-mono font-bold">{data.x.toFixed(3)}</span></p>
                <p className="text-gray-600">CVAI: <span className="font-mono font-bold">{data.y.toFixed(2)}</span></p>
            </div>
        );
    }
    return null;
};
