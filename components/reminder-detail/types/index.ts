export interface DoseSchedule {
    id?: number;
    dose_number: number;
    amount: string;
    time: string;
}

export interface ReminderDetail {
    id: number;
    medicine_name: string;
    medicine_type: string;
    dose_count_daily: number;
    notification_methods: string[];
    start_date: string;
    quantity: string;
    initial_quantity: string;
    refill_reminder: boolean;
    refill_threshold: string;
    refill_reminder_sent: boolean;
    is_active: boolean;
    dose_schedules: DoseSchedule[];
    created_at: string;
    updated_at: string;
}

export interface EditData {
    medicine_name: string;
    medicine_type: string;
    quantity: string;
    refill_reminder: boolean;
    refill_threshold: string;
    notification_methods: string[];
    email: string;
    country_code: string;
    mobile_number: string;
    phone_number: string;
    dose_schedules: DoseSchedule[];
}

export interface DetailHeaderProps {
    reminder: ReminderDetail;
    isEditing: boolean;
    editData: EditData;
    toggleLoading: boolean;
    MedicineIcon: React.ComponentType<{ className?: string }>;
    onEditDataChange: (data: EditData) => void;
    onEdit: () => void;
    onSave: () => void;
    onCancel: () => void;
}

export interface OverviewCardProps {
    reminder: ReminderDetail;
    isEditing: boolean;
    editData: EditData;
}

export interface DoseScheduleCardProps {
    isEditing: boolean;
    editData: EditData;
    reminder: ReminderDetail;
    onAddDose: () => void;
    onRemoveDose: (index: number) => void;
    onUpdateDose: (index: number, field: string, value: string) => void;
    formatTime: (time: string) => string;
}

export interface NotificationCardProps {
    isEditing: boolean;
    editData: EditData;
    reminder: ReminderDetail;
    userEmail: string;
    userPhone: string;
    pushPermission: NotificationPermission;
    onToggleMethod: (method: string) => void;
    onEditDataChange: (data: EditData) => void;
    onRequestPushPermission: () => void;
}

export interface StockCardProps {
    isEditing: boolean;
    editData: EditData;
    reminder: ReminderDetail;
    quantityPercentage: number;
    isLowStock: boolean;
    onEditDataChange: (data: EditData) => void;
}

export interface ActionsCardProps {
    reminder: ReminderDetail;
    isEditing: boolean;
    toggleLoading: boolean;
    deleteLoading: boolean;
    onToggleActive: () => void;
    onDeleteClick: () => void;
}

export interface DeleteDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    medicineName: string;
    deleteLoading: boolean;
}
