export interface MedicineFormData {
  medicine_name: string;
  medicine_type: string;
  dose_count_daily: number;
  notification_methods: string[];
  email?: string;
  country_code?: string;
  mobile_number?: string;
  phone_number?: string; // This will be the combined value
  browser_permission?: boolean;
  start_date: string;
  quantity: number;
  refill_reminder: boolean;
  refill_threshold?: number;
  dose_schedules: DoseSchedule[];
}

export interface DoseSchedule {
  dose_number: number;
  amount: number;
  time: string;
}

export interface MedicineType {
  value: string;
  label: string;
  icon: any;
  bgColor: string;
}

export interface NotificationOption {
  value: string;
  label: string;
}