// 婴儿信息类型定义

export interface Infant {
  id: number;
  name: string;
  gender: "male" | "female";
  birthDate: string; // ISO date string
  gestationalDays: number; // 孕期总天数
  phone: string;
  createdAt: string;
  updatedAt: string;
}

export interface InfantFormData {
  name: string;
  gender: "male" | "female";
  birthDate: string;
  gestationalWeeks: number; // 孕周
  gestationalDays: number; // 孕天
  phone: string;
}

export interface InfantSearchResult {
  id: number;
  name: string;
  gender: "male" | "female";
  birthDate: string;
  phone: string;
  lastMeasureDate?: string;
  measurementCount: number;
}

// 性别显示名称
export const GENDER_LABELS: Record<Infant["gender"], string> = {
  male: "男",
  female: "女",
};
