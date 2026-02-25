"use client";

import { useEffect, useState, useCallback } from "react";
import { useAppSelector } from "@/store/hooks";
import {
    inventoryApi,
    type InventoryItem,
    type CreateInventoryData,
    type AdjustStockData,
} from "@/lib/api/inventoryApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
    Archive,
    Plus,
    Pencil,
    Trash2,
    Loader2,
    PackageOpen,
    AlertTriangle,
    CalendarX2,
    Clock3,
    RefreshCw,
    Pill,
    Syringe,
    Droplets,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Tab = "all" | "low_stock" | "expired" | "expiring_soon";

const MEDICINE_TYPES = ["tablet", "capsule", "syrup", "injection", "drops", "other"];
const UNITS = ["tablets", "capsules", "ml", "mg", "units", "doses"];

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function InventorySkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="overflow-hidden">
                    <div className="h-1 bg-gray-200 animate-pulse" />
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
                            <div className="space-y-2 flex-1">
                                <div className="h-5 w-36 bg-gray-200 rounded animate-pulse" />
                                <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                        </div>
                        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                        <div className="flex gap-2 pt-2">
                            <div className="h-9 flex-1 bg-gray-200 rounded animate-pulse" />
                            <div className="h-9 w-14 bg-gray-200 rounded animate-pulse" />
                            <div className="h-9 w-14 bg-gray-200 rounded animate-pulse" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

// ─── Status badge helper ───────────────────────────────────────────────────────

function StatusBadge({ item }: { item: InventoryItem }) {
    if (item.is_expired)
        return <Badge variant="destructive">Expired</Badge>;
    if (item.is_low_stock)
        return <Badge className="bg-amber-500 hover:bg-amber-600 text-white">Low Stock</Badge>;
    if (item.is_expiring_soon)
        return <Badge className="bg-orange-400 hover:bg-orange-500 text-white">Expiring Soon</Badge>;
    return <Badge className="bg-green-500 hover:bg-green-600 text-white">In Stock</Badge>;
}

// ─── Icon helper ───────────────────────────────────────────────────────────────

function getMedicineIcon(type: string, className: string = "w-5 h-5 text-primary") {
    switch (type.toLowerCase()) {
        case "tablet":
        case "capsule":
            return <Pill className={className} />;
        case "syrup":
        case "drops":
            return <Droplets className={className} />;
        case "injection":
            return <Syringe className={className} />;
        default:
            return <Archive className={className} />;
    }
}

// ─── Item Form ────────────────────────────────────────────────────────────────

interface ItemFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initial?: InventoryItem | null;
    onSaved: () => void;
}

function ItemFormDialog({ open, onOpenChange, initial, onSaved }: ItemFormProps) {
    const isEdit = !!initial;
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState<CreateInventoryData>({
        medicine_name: "",
        medicine_type: "tablet",
        current_quantity: 0,
        unit: "tablets",
        notes: "",
    });

    useEffect(() => {
        if (initial) {
            setForm({
                medicine_name: initial.medicine_name,
                medicine_type: initial.medicine_type,
                current_quantity: Number(initial.current_quantity) || 0,
                unit: initial.unit,
                notes: initial.notes ?? "",
            });
        } else {
            setForm({
                medicine_name: "",
                medicine_type: "tablet",
                current_quantity: 0,
                unit: "tablets",
                notes: "",
            });
        }
    }, [initial, open]);

    const set = (key: keyof CreateInventoryData, value: string | number) =>
        setForm((f) => ({ ...f, [key]: value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload: CreateInventoryData = {
                ...form,
                notes: form.notes || undefined,
            };
            if (isEdit && initial) {
                await inventoryApi.updateInventoryItem(initial.id, payload);
                toast.success("Item updated successfully");
            } else {
                await inventoryApi.createInventoryItem(payload);
                toast.success("Item added successfully");
            }
            onSaved();
            onOpenChange(false);
        } catch {
            toast.error(isEdit ? "Failed to update item" : "Failed to add item");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[520px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Edit Item" : "Add Inventory Item"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    {/* Medicine Name */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Medicine Name *</label>
                        <input
                            required
                            value={form.medicine_name}
                            onChange={(e) => set("medicine_name", e.target.value)}
                            placeholder="e.g. Paracetamol"
                            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                        />
                    </div>

                    {/* Type + Unit row */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Medicine Type *</label>
                            <select
                                value={form.medicine_type}
                                onChange={(e) => set("medicine_type", e.target.value)}
                                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white capitalize"
                            >
                                {MEDICINE_TYPES.map((t) => (
                                    <option key={t} value={t} className="capitalize">{t}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Unit *</label>
                            <select
                                value={form.unit}
                                onChange={(e) => set("unit", e.target.value)}
                                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white"
                            >
                                {UNITS.map((u) => (
                                    <option key={u} value={u}>{u}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Quantity */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Current Quantity *</label>
                        <input
                            required
                            type="number"
                            min={0}
                            step="any"
                            value={form.current_quantity}
                            onChange={(e) => set("current_quantity", Number(e.target.value))}
                            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                        />
                    </div>

                    {/* Notes */}
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Notes</label>
                        <textarea
                            rows={2}
                            value={form.notes}
                            onChange={(e) => set("notes", e.target.value)}
                            placeholder="Optional notes..."
                            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={saving}>
                            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {isEdit ? "Save Changes" : "Add Item"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ─── Adjust Stock Dialog ───────────────────────────────────────────────────────

interface AdjustDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    item: InventoryItem | null;
    onAdjusted: () => void;
}

function AdjustStockDialog({ open, onOpenChange, item, onAdjusted }: AdjustDialogProps) {
    const [saving, setSaving] = useState(false);
    const [adjustment, setAdjustment] = useState<number>(0);
    const [notes, setNotes] = useState("");

    useEffect(() => {
        if (open) { setAdjustment(0); setNotes(""); }
    }, [open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!item) return;
        if (adjustment === 0) { toast.error("Adjustment cannot be zero"); return; }
        setSaving(true);
        try {
            const data: AdjustStockData = { adjustment, notes: notes || undefined };
            await inventoryApi.adjustStock(item.id, data);
            toast.success(
                adjustment > 0
                    ? `Added ${adjustment} ${item.unit}`
                    : `Removed ${Math.abs(adjustment)} ${item.unit}`
            );
            onAdjusted();
            onOpenChange(false);
        } catch {
            toast.error("Failed to adjust stock");
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[420px]">
                <DialogHeader>
                    <DialogTitle>Adjust Stock — {item?.medicine_name}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Adjustment amount *</label>
                        <div className="flex items-center gap-2">
                            <input
                                required
                                type="number"
                                step="any"
                                value={adjustment}
                                onChange={(e) => setAdjustment(Number(e.target.value))}
                                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                                placeholder="e.g. -5 to reduce, 10 to add"
                            />
                            <span className="text-sm text-muted-foreground whitespace-nowrap">{item?.unit}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Use a negative number to record consumption.</p>
                    </div>
                    <div className="space-y-1">
                        <label className="text-sm font-medium">Notes</label>
                        <textarea
                            rows={2}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Reason for adjustment..."
                            className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                        />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={saving}>
                            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            Confirm Adjustment
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

// ─── Item Card ─────────────────────────────────────────────────────────────────

interface ItemCardProps {
    item: InventoryItem;
    onEdit: () => void;
    onDelete: () => void;
    onAdjust: () => void;
    deleteLoading: boolean;
}

function ItemCard({ item, onEdit, onDelete, onAdjust, deleteLoading }: ItemCardProps) {
    const topBarColor = item.is_expired
        ? "bg-red-500"
        : item.is_low_stock
            ? "bg-amber-500"
            : item.is_expiring_soon
                ? "bg-orange-400"
                : "bg-green-500";

    const formatDate = (d: string | null) =>
        d
            ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
            : "—";

    return (
        <Card className="relative overflow-hidden transition-all hover:shadow-lg">
            <div className={`absolute top-0 left-0 right-0 h-1 ${topBarColor}`} />
            <CardHeader className="pb-3 pt-5">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="shrink-0 p-2 bg-primary/10 rounded-lg">
                            {getMedicineIcon(item.medicine_type)}
                        </div>
                        <div className="min-w-0">
                            <CardTitle className="text-base font-bold capitalize truncate">
                                {item.medicine_name}
                            </CardTitle>
                            <p className="text-xs text-muted-foreground capitalize">{item.medicine_type}</p>
                        </div>
                    </div>
                    <StatusBadge item={item} />
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3 text-sm">
                    <div className="bg-muted/40 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-0.5">Quantity</p>
                        <p className="font-semibold text-lg">
                            {parseFloat(item.current_quantity ?? "0")}{" "}
                            <span className="font-normal text-muted-foreground text-xs">{item.unit}</span>
                        </p>
                    </div>
                </div>

                {item.linked_reminder_name && (
                    <div className="text-xs flex items-center gap-1.5 p-2 bg-blue-50 text-blue-700 rounded-md border border-blue-100">
                        <Clock3 className="w-3.5 h-3.5 shrink-0" />
                        <span>Linked to: <strong>{item.linked_reminder_name}</strong></span>
                    </div>
                )}



                {item.notes && (
                    <p className="text-xs text-muted-foreground border-t pt-2 line-clamp-2">{item.notes}</p>
                )}

                <div className="flex gap-2 pt-1">
                    <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={onAdjust}
                    >
                        <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                        Adjust
                    </Button>
                    <Button variant="outline" size="sm" onClick={onEdit}>
                        <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={onDelete}
                        disabled={deleteLoading}
                    >
                        {deleteLoading ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

// ─── Tab config ────────────────────────────────────────────────────────────────

interface TabDef {
    key: Tab;
    label: string;
    icon: React.ReactNode;
    fetcher: () => Promise<any>;
    emptyMessage: string;
}
