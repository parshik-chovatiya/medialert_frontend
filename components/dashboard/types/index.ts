export interface Reminder {
    reminder_id: number;
    medicine_name: string;
    medicine_type: string;
    amount: string;
    dose_number: number;
    notification_methods: string[];
    quantity_remaining: string;
    is_active: boolean;
}

export interface DoseTime {
    time: string;
    reminders: Reminder[];
}

export interface DashboardResponse {
    selected_date: string;
    day_name: string;
    total_doses: number;
    total_reminders: number;
    doses: DoseTime[];
    date_range: {
        min_date: string;
        max_date: string;
        available_dates: string[];
    };
}

export interface Dose {
    id: string;
    name: string;
    instruction: string;
    time: string;
    medicineType: string;
    notificationMethods: string[];
}

export interface DoseCardProps {
    dose: Dose;
    medicineType: string;
    notificationMethods: string[];
}

export interface UpcomingDosesSectionProps {
    doses: Dose[];
    loading: boolean;
    selectedDate: string;
    isAuthenticated: boolean;
    onLoginClick: () => void;
}
