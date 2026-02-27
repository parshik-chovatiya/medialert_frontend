export interface Reminder {
    id: number;
    medicine_name: string;
    medicine_type: string;
    dose_count_daily: number;
    quantity: string;
    is_active: boolean;
    dose_count: number;
    next_dose_time: string;
    created_at: string;
}

export interface ReminderCardProps {
    reminder: Reminder;
    onViewDetails: (id: number) => void;
    onToggleActive: (id: number, isActive: boolean, e: React.MouseEvent) => void;
    onDeleteClick: (id: number, e: React.MouseEvent) => void;
    toggleLoading: number | null;
    deleteLoading: number | null;
    formatTime: (time: string) => string;
    formatDate: (dateString: string) => string;
}

export interface DeleteReminderDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
}
