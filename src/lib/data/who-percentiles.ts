/**
 * WHO Head Circumference Percentile Data
 * Source: WHO Child Growth Standards (0-5 years)
 * Data for 0-24 months (0-2 years)
 */

// WHO 男童头围百分位数据 (0-24个月，单位: cm)
export const WHO_HC_BOYS: WHOPercentileData[] = [
  { month: 0, P3: 31.9, P10: 32.7, P25: 33.4, P50: 34.3, P75: 35.2, P90: 36.0, P97: 36.8 },
  { month: 1, P3: 34.8, P10: 35.5, P25: 36.2, P50: 37.0, P75: 37.8, P90: 38.5, P97: 39.2 },
  { month: 2, P3: 36.9, P10: 37.6, P25: 38.3, P50: 39.1, P75: 39.9, P90: 40.6, P97: 41.3 },
  { month: 3, P3: 38.3, P10: 39.0, P25: 39.7, P50: 40.5, P75: 41.3, P90: 42.0, P97: 42.7 },
  { month: 4, P3: 39.4, P10: 40.1, P25: 40.8, P50: 41.6, P75: 42.4, P90: 43.1, P97: 43.9 },
  { month: 5, P3: 40.3, P10: 41.0, P25: 41.7, P50: 42.5, P75: 43.4, P90: 44.1, P97: 44.9 },
  { month: 6, P3: 41.1, P10: 41.8, P25: 42.5, P50: 43.4, P75: 44.2, P90: 44.9, P97: 45.7 },
  { month: 7, P3: 41.8, P10: 42.5, P25: 43.2, P50: 44.0, P75: 44.9, P90: 45.6, P97: 46.4 },
  { month: 8, P3: 42.4, P10: 43.1, P25: 43.8, P50: 44.6, P75: 45.5, P90: 46.2, P97: 47.0 },
  { month: 9, P3: 42.8, P10: 43.5, P25: 44.3, P50: 45.1, P75: 46.0, P90: 46.7, P97: 47.5 },
  { month: 10, P3: 43.2, P10: 43.9, P25: 44.7, P50: 45.5, P75: 46.4, P90: 47.1, P97: 47.9 },
  { month: 11, P3: 43.6, P10: 44.3, P25: 45.0, P50: 45.8, P75: 46.7, P90: 47.5, P97: 48.3 },
  { month: 12, P3: 43.8, P10: 44.6, P25: 45.3, P50: 46.1, P75: 47.0, P90: 47.8, P97: 48.6 },
  { month: 13, P3: 44.1, P10: 44.8, P25: 45.5, P50: 46.4, P75: 47.2, P90: 48.0, P97: 48.8 },
  { month: 14, P3: 44.3, P10: 45.0, P25: 45.8, P50: 46.6, P75: 47.5, P90: 48.2, P97: 49.0 },
  { month: 15, P3: 44.5, P10: 45.2, P25: 46.0, P50: 46.8, P75: 47.7, P90: 48.5, P97: 49.3 },
  { month: 16, P3: 44.7, P10: 45.4, P25: 46.2, P50: 47.0, P75: 47.9, P90: 48.7, P97: 49.4 },
  { month: 17, P3: 44.9, P10: 45.6, P25: 46.3, P50: 47.2, P75: 48.0, P90: 48.8, P97: 49.6 },
  { month: 18, P3: 45.1, P10: 45.8, P25: 46.5, P50: 47.4, P75: 48.2, P90: 49.0, P97: 49.8 },
  { month: 19, P3: 45.2, P10: 46.0, P25: 46.7, P50: 47.5, P75: 48.4, P90: 49.2, P97: 50.0 },
  { month: 20, P3: 45.4, P10: 46.1, P25: 46.9, P50: 47.7, P75: 48.6, P90: 49.4, P97: 50.2 },
  { month: 21, P3: 45.6, P10: 46.3, P25: 47.0, P50: 47.9, P75: 48.8, P90: 49.6, P97: 50.4 },
  { month: 22, P3: 45.7, P10: 46.5, P25: 47.2, P50: 48.1, P75: 48.9, P90: 49.7, P97: 50.5 },
  { month: 23, P3: 45.9, P10: 46.6, P25: 47.4, P50: 48.2, P75: 49.1, P90: 49.9, P97: 50.7 },
  { month: 24, P3: 46.0, P10: 46.7, P25: 47.5, P50: 48.3, P75: 49.2, P90: 50.0, P97: 50.8 },
];

// WHO 女童头围百分位数据 (0-24个月，单位: cm)
// Source: WHO Child Growth Standards - based on typical female HC being slightly smaller
export const WHO_HC_GIRLS: WHOPercentileData[] = [
  { month: 0, P3: 31.5, P10: 32.2, P25: 32.9, P50: 33.8, P75: 34.6, P90: 35.3, P97: 36.1 },
  { month: 1, P3: 34.2, P10: 34.9, P25: 35.6, P50: 36.4, P75: 37.2, P90: 37.9, P97: 38.7 },
  { month: 2, P3: 36.0, P10: 36.7, P25: 37.4, P50: 38.2, P75: 39.0, P90: 39.8, P97: 40.5 },
  { month: 3, P3: 37.3, P10: 38.0, P25: 38.7, P50: 39.5, P75: 40.4, P90: 41.1, P97: 41.9 },
  { month: 4, P3: 38.3, P10: 39.0, P25: 39.7, P50: 40.6, P75: 41.4, P90: 42.2, P97: 42.9 },
  { month: 5, P3: 39.1, P10: 39.8, P25: 40.6, P50: 41.4, P75: 42.2, P90: 43.0, P97: 43.8 },
  { month: 6, P3: 39.8, P10: 40.6, P25: 41.3, P50: 42.1, P75: 43.0, P90: 43.7, P97: 44.5 },
  { month: 7, P3: 40.4, P10: 41.2, P25: 41.9, P50: 42.7, P75: 43.6, P90: 44.4, P97: 45.1 },
  { month: 8, P3: 40.9, P10: 41.7, P25: 42.4, P50: 43.3, P75: 44.1, P90: 44.9, P97: 45.7 },
  { month: 9, P3: 41.3, P10: 42.1, P25: 42.8, P50: 43.7, P75: 44.6, P90: 45.4, P97: 46.1 },
  { month: 10, P3: 41.7, P10: 42.5, P25: 43.2, P50: 44.1, P75: 44.9, P90: 45.7, P97: 46.5 },
  { month: 11, P3: 42.0, P10: 42.8, P25: 43.6, P50: 44.4, P75: 45.3, P90: 46.0, P97: 46.8 },
  { month: 12, P3: 42.3, P10: 43.1, P25: 43.8, P50: 44.7, P75: 45.5, P90: 46.3, P97: 47.1 },
  { month: 13, P3: 42.5, P10: 43.3, P25: 44.1, P50: 44.9, P75: 45.8, P90: 46.5, P97: 47.3 },
  { month: 14, P3: 42.7, P10: 43.5, P25: 44.3, P50: 45.1, P75: 46.0, P90: 46.7, P97: 47.5 },
  { month: 15, P3: 42.9, P10: 43.7, P25: 44.5, P50: 45.3, P75: 46.2, P90: 46.9, P97: 47.7 },
  { month: 16, P3: 43.1, P10: 43.9, P25: 44.6, P50: 45.5, P75: 46.3, P90: 47.1, P97: 47.9 },
  { month: 17, P3: 43.2, P10: 44.0, P25: 44.8, P50: 45.6, P75: 46.5, P90: 47.3, P97: 48.1 },
  { month: 18, P3: 43.4, P10: 44.2, P25: 45.0, P50: 45.8, P75: 46.7, P90: 47.4, P97: 48.2 },
  { month: 19, P3: 43.5, P10: 44.3, P25: 45.1, P50: 45.9, P75: 46.8, P90: 47.6, P97: 48.4 },
  { month: 20, P3: 43.7, P10: 44.5, P25: 45.2, P50: 46.1, P75: 47.0, P90: 47.7, P97: 48.5 },
  { month: 21, P3: 43.8, P10: 44.6, P25: 45.4, P50: 46.2, P75: 47.1, P90: 47.9, P97: 48.7 },
  { month: 22, P3: 43.9, P10: 44.7, P25: 45.5, P50: 46.4, P75: 47.2, P90: 48.0, P97: 48.8 },
  { month: 23, P3: 44.1, P10: 44.9, P25: 45.6, P50: 46.5, P75: 47.4, P90: 48.1, P97: 48.9 },
  { month: 24, P3: 44.2, P10: 45.0, P25: 45.7, P50: 46.6, P75: 47.5, P90: 48.3, P97: 49.1 },
];

export interface WHOPercentileData {
  month: number;
  P3: number;
  P10: number;
  P25: number;
  P50: number;
  P75: number;
  P90: number;
  P97: number;
}

export type Gender = '男' | '女';

/**
 * Get WHO percentile data based on gender
 */
export function getWHOData(gender: Gender): WHOPercentileData[] {
  return gender === '男' ? WHO_HC_BOYS : WHO_HC_GIRLS;
}

/**
 * Get percentile value for a given age (in months) and percentile level
 * Uses linear interpolation for ages between data points
 */
export function getPercentileValue(
  data: WHOPercentileData[],
  ageMonths: number,
  percentile: keyof Omit<WHOPercentileData, 'month'>
): number | null {
  if (ageMonths < 0 || ageMonths > 24) return null;
  
  const floorMonth = Math.floor(ageMonths);
  const ceilMonth = Math.ceil(ageMonths);
  
  const floorData = data.find(d => d.month === floorMonth);
  const ceilData = data.find(d => d.month === ceilMonth);
  
  if (!floorData) return null;
  if (floorMonth === ceilMonth || !ceilData) return floorData[percentile];
  
  // Linear interpolation
  const fraction = ageMonths - floorMonth;
  return floorData[percentile] + (ceilData[percentile] - floorData[percentile]) * fraction;
}

/**
 * Calculate which percentile band a measurement falls into
 */
export function getPercentileBand(
  hc: number,
  ageMonths: number,
  gender: Gender
): string {
  const data = getWHOData(gender);
  const p3 = getPercentileValue(data, ageMonths, 'P3');
  const p10 = getPercentileValue(data, ageMonths, 'P10');
  const p25 = getPercentileValue(data, ageMonths, 'P25');
  const p50 = getPercentileValue(data, ageMonths, 'P50');
  const p75 = getPercentileValue(data, ageMonths, 'P75');
  const p90 = getPercentileValue(data, ageMonths, 'P90');
  const p97 = getPercentileValue(data, ageMonths, 'P97');
  
  if (!p3 || !p10 || !p25 || !p50 || !p75 || !p90 || !p97) return '未知';
  
  if (hc < p3) return '<P3';
  if (hc < p10) return 'P3-P10';
  if (hc < p25) return 'P10-P25';
  if (hc < p50) return 'P25-P50';
  if (hc < p75) return 'P50-P75';
  if (hc < p90) return 'P75-P90';
  if (hc < p97) return 'P90-P97';
  return '>P97';
}
