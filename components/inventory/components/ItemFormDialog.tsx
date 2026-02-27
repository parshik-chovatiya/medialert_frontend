"use client";

import { useEffect, useState } from "react";
import { inventoryApi, type CreateInventoryData } from "@/lib/api/inventoryApi";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { MEDICINE_TYPES, UNITS } from "@/components/inventory/types";
import type { ItemFormProps } from "@/components/inventory/types";

export function ItemFormDialog({ open, onOpenChange, initial, onSaved }: ItemFormProps) {
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
