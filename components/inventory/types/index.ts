import type { InventoryItem } from "@/lib/api/inventoryApi";

export type Tab = "all" | "low_stock" | "expired" | "expiring_soon";

export interface TabDef {
    key: Tab;
    label: string;
    icon: React.ReactNode;
    fetcher: () => Promise<any>;
    emptyMessage: string;
}

export interface ItemCardProps {
    item: InventoryItem;
    onEdit: () => void;
    onDelete: () => void;
    onAdjust: () => void;
    deleteLoading: boolean;
}

export interface ItemFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initial?: InventoryItem | null;
    onSaved: () => void;
}

export interface AdjustDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    item: InventoryItem | null;
    onAdjusted: () => void;
}

export const MEDICINE_TYPES = ["tablet", "capsule", "syrup", "injection", "drops", "other"];
export const UNITS = ["tablets", "capsules", "ml", "mg", "units", "doses"];
