import { useMemo } from "react";
import { format } from "date-fns";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui";
import { CranialScatterChart } from "@/components/charts/medical-charts";
import { getWHOData } from "@/lib/data/who-percentiles";
import { formatCorrectedAge, gradeAll } from "@/lib/calculators";
import { useHospitalConfig } from "@/hooks";
import type { Infant, Measurement } from "@/types";

interface ReportProps {
  infant: Infant;
  measurements: Measurement[];
  currentMeasurement?: Measurement;
}

export function MeasurementReport({ infant, measurements, currentMeasurement }: ReportProps) {
  const { data: hospitalConfig } = useHospitalConfig();
  const measurement = currentMeasurement || measurements[measurements.length - 1];
  
  const grades = useMemo(() => {
    if (!measurement) return null;
    return gradeAll({ cr: measurement.cr, cvai: measurement.cvai, diff: measurement.diff });
  }, [measurement]);

  const genderLabel = infant.gender === "male" ? "男" : "女";
  const birthDateFormatted = format(new Date(infant.birthDate), "yyyy年MM月dd日");
  const measureDateFormatted = measurement 
    ? format(new Date(measurement.measureDate), "yyyy年MM月dd日")
    : "-";
  const ageLabel = measurement ? formatCorrectedAge(measurement.correctedAgeDays) : "-";

  const getDiagnosis = () => {
    if (!grades) return { conditions: [], isNormal: true, worstGrade: "正常", worstLevel: 1 };
    
    const conditions: string[] = [];
    let maxLevel = 1;
    
    if (grades.cr.name !== "正常") {
      if (measurement.cr < 0.76) conditions.push("舟状头");
      else if (measurement.cr > 0.90) conditions.push("短头");
      if (grades.cr.level > maxLevel) maxLevel = grades.cr.level;
    }
    
    if (grades.cvai.name !== "正常") {
      conditions.push("斜头");
      if (grades.cvai.level > maxLevel) maxLevel = grades.cvai.level;
    }
    
    const gradeNameMap: Record<number, string> = {
      1: "正常", 2: "轻度", 3: "中度", 4: "重度", 5: "极重度"
    };
    
    return { conditions, isNormal: maxLevel === 1, worstGrade: gradeNameMap[maxLevel], worstLevel: maxLevel };
  };

  const diagnosis = getDiagnosis();
  const hospitalName = hospitalConfig?.hospitalName || "儿童保健中心";
  const logoPath = hospitalConfig?.logoPath;

  if (!measurement) {
    return <div className="p-8 text-center text-slate-500">暂无测量记录</div>;
  }

  const reportId = `HC${format(new Date(measurement.measureDate), 'yyyyMMdd')}${measurement.id.toString().padStart(4, '0')}`;

  return (
    <div className="bg-white">
      <div className="print:hidden mb-4 flex justify-end">
        <Button onClick={() => window.print()} variant="outline" size="sm">
          <Printer className="h-4 w-4 mr-2" />
          打印报告
        </Button>
      </div>

      {/* 报告内容 */}
      <div className="report-content bg-white mx-auto print:mx-0" style={{ width: '700px', padding: '40px', fontFamily: '"SimSun", "宋体", serif' }}>
        
        {/* 标题区域 */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-2">
            {logoPath && (
              <img src={logoPath} alt="医院Logo" className="h-12 w-12 object-contain" />
            )}
            <p className="text-base">{hospitalName}</p>
          </div>
          <h1 className="text-2xl font-bold mb-2">婴儿头颅形态检查报告单</h1>
          <p className="text-sm text-gray-600">报告编号：{reportId}</p>
        </div>

        {/* 基本信息表格 */}
        <table className="w-full mb-6" style={{ borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <TD header>姓名</TD>
              <TD>{infant.name}</TD>
              <TD header>性别</TD>
              <TD>{genderLabel}</TD>
              <TD header>出生日期</TD>
              <TD>{birthDateFormatted}</TD>
            </tr>
            <tr>
              <TD header>月龄</TD>
              <TD>{ageLabel}</TD>
              <TD header>联系电话</TD>
              <TD>{infant.phone}</TD>
              <TD header>检查日期</TD>
              <TD>{measureDateFormatted}</TD>
            </tr>
          </tbody>
        </table>

        {/* 一、头颅指标测量 */}
        <Section title="一、头颅指标测量">
          <table className="w-full" style={{ borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <TD header width="120px">头围</TD>
                <TD width="180px">
                  <strong>{measurement.headCircumference.toFixed(1)}</strong> cm
                </TD>
                <TD header width="160px">头颅宽长比（CR）</TD>
                <TD>
                  <strong>{measurement.cr.toFixed(3)}</strong>
                  <span className="text-gray-500 text-sm ml-2">（参考范围 0.76～0.90）</span>
                </TD>
              </tr>
              <tr>
                <TD header>斜径差（Diff）</TD>
                <TD>
                  <strong>{measurement.diff.toFixed(1)}</strong> mm
                  <span className="text-gray-500 text-sm ml-2">（参考范围＜6mm）</span>
                </TD>
                <TD header>头颅不对称指数（CVAI）</TD>
                <TD>
                  <strong>{measurement.cvai.toFixed(2)}</strong> %
                  <span className="text-gray-500 text-sm ml-2">（参考范围＜3.5%）</span>
                </TD>
              </tr>
            </tbody>
          </table>
        </Section>

        {/* 二、初步诊断及程度 */}
        <Section title="二、初步诊断及程度">
          <table className="w-full" style={{ borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td className="p-3" style={{ border: '1px solid #000' }}>
                  <div className="flex items-center gap-6 flex-wrap">
                    <label className="flex items-center gap-2">
                      <Checkbox checked={diagnosis.isNormal} />
                      <span>无异常</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <Checkbox checked={!diagnosis.isNormal} />
                      <span>有异常：</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <Checkbox checked={diagnosis.conditions.includes("斜头")} />
                      <span>斜头</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <Checkbox checked={diagnosis.conditions.includes("短头")} />
                      <span>短头</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <Checkbox checked={diagnosis.conditions.includes("舟状头")} />
                      <span>舟状头</span>
                    </label>
                  </div>
                  {!diagnosis.isNormal && (
                    <p className="mt-3 pt-3 border-t border-gray-300">
                      程度判定：<strong>{diagnosis.worstGrade}</strong>
                    </p>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </Section>

        {/* 三、指导意见 */}
        <Section title="三、指导意见">
          <table className="w-full" style={{ borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td className="p-3" style={{ border: '1px solid #000' }}>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <Checkbox checked={true} />
                      <span>醒时多俯趴、多抬头，锻炼颈背肌力量</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <Checkbox checked={diagnosis.worstLevel >= 3} />
                      <span>建议矫正治疗</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <Checkbox checked={false} />
                      <span>建议神外就诊</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <Checkbox checked={!diagnosis.isNormal} />
                      <span>____1____ 月后复查</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <Checkbox checked={false} />
                      <span>其他：____________________</span>
                    </label>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </Section>

        {/* 四、头型评估图 */}
        <Section title="四、头型评估图">
          <table className="w-full" style={{ borderCollapse: 'collapse', overflow: 'visible' }}>
            <tbody>
              <tr>
                <td style={{ border: '1px solid #000', padding: '12px', verticalAlign: 'top', overflow: 'visible' }}>
                  <p className="text-sm text-center text-gray-600 mb-2">发育趋势分布（CR-CVAI）</p>
                  <CranialScatterChart data={measurements} />
                </td>
              </tr>
              <tr>
                <td style={{ border: '1px solid #000', padding: '12px', verticalAlign: 'top', overflow: 'visible' }}>
                  <p className="text-sm text-center text-gray-600 mb-2">{genderLabel}童头围生长曲线</p>
                  <HeadCircumferenceChart 
                    measurements={measurements} 
                    gender={infant.gender === "male" ? "男" : "女"}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </Section>

        {/* 签名区域 */}
        <div className="mt-8 flex justify-between items-end">
          <div className="space-y-4">
            <p>检测人员：________________</p>
            <p>审核医师：________________</p>
          </div>
          <div className="text-right">
            <p className="mb-4">报告日期：{format(new Date(), "yyyy年MM月dd日")}</p>
            <div 
              className="inline-block border border-dashed border-gray-400 text-gray-400 text-center"
              style={{ width: '90px', height: '90px', lineHeight: '90px' }}
            >
              （公章）
            </div>
          </div>
        </div>

        {/* 备注 */}
        <div className="mt-6 pt-4 border-t border-gray-300 text-xs text-gray-500 space-y-1">
          <p>备注：</p>
          <p>1. CR参考标准：0.76-0.90为正常，＜0.76为舟状头倾向，＞0.90为短头倾向</p>
          <p>2. CVAI参考标准：＜3.5%为正常，数值越高表示不对称程度越严重</p>
          <p>3. 本报告仅供参考，最终诊断以医师意见为准</p>
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          .report-content, .report-content * { visibility: visible; }
          .report-content { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100% !important;
            padding: 15mm !important;
          }
          @page { size: A4; margin: 0; }
        }
      `}</style>
    </div>
  );
}

// 表格单元格组件
function TD({ 
  children, 
  header, 
  width 
}: { 
  children: React.ReactNode; 
  header?: boolean; 
  width?: string;
}) {
  return (
    <td 
      style={{ 
        border: '1px solid #000', 
        padding: '10px 12px',
        backgroundColor: header ? '#f5f5f5' : 'white',
        width: width,
        fontSize: '14px'
      }}
    >
      {children}
    </td>
  );
}

// 章节组件
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <p className="font-bold mb-2" style={{ fontSize: '15px' }}>{title}</p>
      {children}
    </div>
  );
}

// 复选框组件
function Checkbox({ checked }: { checked: boolean }) {
  return (
    <span 
      style={{ 
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '14px', 
        height: '14px', 
        border: '1.5px solid #000',
        fontSize: '11px',
        fontWeight: 'bold'
      }}
    >
      {checked ? "✓" : ""}
    </span>
  );
}

// 头围曲线图 - 与发育趋势页面样式一致
import { Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ComposedChart, Area } from "recharts";

// 百分位线样式
const PERCENTILE_STYLES = {
  P3: { stroke: '#ef4444', strokeWidth: 1, strokeDasharray: '4 2' },
  P10: { stroke: '#f97316', strokeWidth: 1, strokeDasharray: '3 3' },
  P50: { stroke: '#22c55e', strokeWidth: 1.5, strokeDasharray: '0' },
  P90: { stroke: '#f97316', strokeWidth: 1, strokeDasharray: '3 3' },
  P97: { stroke: '#ef4444', strokeWidth: 1, strokeDasharray: '4 2' },
};

function HeadCircumferenceChart({ measurements, gender }: { measurements: Measurement[]; gender: "男" | "女" }) {
  const sortedData = useMemo(() => {
    return [...measurements]
      .sort((a, b) => new Date(a.measureDate).getTime() - new Date(b.measureDate).getTime())
      .map((m) => ({ ...m, ageMonths: m.correctedAgeDays / 30.44 }));
  }, [measurements]);

  const chartData = useMemo(() => {
    const whoData = getWHOData(gender);
    const dataByMonth: Record<number, any> = {};
    
    whoData.forEach(d => {
      dataByMonth[d.month] = { 
        month: d.month, 
        P3: d.P3, 
        P10: d.P10,
        P50: d.P50, 
        P90: d.P90,
        P97: d.P97, 
        babyHC: null 
      };
    });
    
    sortedData.forEach((m) => {
      const roundedMonth = Math.round(m.ageMonths * 10) / 10;
      const nearestMonth = Math.round(m.ageMonths);
      const whoPoint = whoData.find(d => d.month === nearestMonth);
      dataByMonth[roundedMonth] = {
        month: roundedMonth,
        P3: whoPoint?.P3, 
        P10: whoPoint?.P10,
        P50: whoPoint?.P50, 
        P90: whoPoint?.P90,
        P97: whoPoint?.P97,
        babyHC: m.headCircumference,
      };
    });
    
    return Object.values(dataByMonth).sort((a, b) => a.month - b.month);
  }, [sortedData, gender]);

  const yDomain = useMemo(() => {
    const allValues = chartData.flatMap(d => [d.P3, d.P97, d.babyHC].filter(Boolean));
    // 向下取整到最近的2.5，再减2.5作为最小值
    const min = Math.floor(Math.min(...allValues) / 2.5) * 2.5 - 2.5;
    // 向上取整到最近的2.5，再加2.5作为最大值
    const max = Math.ceil(Math.max(...allValues) / 2.5) * 2.5 + 2.5;
    return [min, max];
  }, [chartData]);

  // 生成Y轴刻度 (2.5cm 间隔)
  const yTicks = useMemo(() => {
    const [min, max] = yDomain;
    const ticks = [];
    for (let v = min; v <= max; v += 2.5) {
      ticks.push(v);
    }
    return ticks;
  }, [yDomain]);

  // X轴固定刻度 (0-24月，每月一个)
  const xTicks = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24];

  return (
    <div>
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 5, bottom: 25 }}>
          <defs>
            <linearGradient id="reportNormalRange" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity={0.1} />
              <stop offset="50%" stopColor="#22c55e" stopOpacity={0.15} />
              <stop offset="100%" stopColor="#22c55e" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis 
            dataKey="month" 
            type="number" 
            domain={[0, 24]}
            ticks={xTicks}
            interval={0}
            tick={{ fontSize: 10 }} 
            stroke="#94a3b8"
            tickFormatter={(v) => `${v}`}
            label={{ value: '矫正月龄（月）', position: 'bottom', offset: 10, fontSize: 10, fill: '#666' }}
          />
          <YAxis 
            domain={yDomain}
            ticks={yTicks}
            tick={{ fontSize: 10 }} 
            stroke="#94a3b8"
            label={{ value: '头围 (cm)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#666', dx: -5 }}
          />
          
          {/* 正常范围区域 */}
          <Area type="monotone" dataKey="P90" stroke="none" fill="url(#reportNormalRange)" fillOpacity={1} />
          
          {/* WHO 百分位线 */}
          <Line type="monotone" dataKey="P3" {...PERCENTILE_STYLES.P3} dot={false} />
          <Line type="monotone" dataKey="P10" {...PERCENTILE_STYLES.P10} dot={false} />
          <Line type="monotone" dataKey="P50" {...PERCENTILE_STYLES.P50} dot={false} />
          <Line type="monotone" dataKey="P90" {...PERCENTILE_STYLES.P90} dot={false} />
          <Line type="monotone" dataKey="P97" {...PERCENTILE_STYLES.P97} dot={false} />
          
          {/* 宝宝生长曲线 */}
          <Line 
            type="monotone" 
            dataKey="babyHC" 
            stroke="#2563eb" 
            strokeWidth={2.5} 
            dot={{ r: 4, fill: "#2563eb", strokeWidth: 2, stroke: "#fff" }} 
            connectNulls 
          />
        </ComposedChart>
      </ResponsiveContainer>
      
      {/* 图例 */}
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-1 text-[9px] text-gray-500">
        <span className="flex items-center gap-1">
          <span className="w-3 h-0.5" style={{ backgroundColor: '#ef4444' }}></span> P3/P97
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-0.5" style={{ backgroundColor: '#f97316' }}></span> P10/P90
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-0.5" style={{ backgroundColor: '#22c55e' }}></span> P50
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#2563eb' }}></span> 宝宝
        </span>
      </div>
    </div>
  );
}

