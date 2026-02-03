// 医院配置类型定义

export interface HospitalConfig {
  id: number;
  hospitalName: string;
  logoPath?: string;
  updatedAt: string;
}

export interface HospitalConfigFormData {
  hospitalName: string;
  logoPath?: string;
}

// Dashboard 统计数据
export interface DashboardStats {
  today: PeriodStats;
  yesterday: PeriodStats;
  thisMonth: PeriodStats;
  lastMonth: PeriodStats;
}

export interface PeriodStats {
  infantCount: number;      // 新增婴儿数
  measurementCount: number; // 新增测量记录数
}
