"use client";

import { useEffect, useState } from "react";
import { inventoryApi, type AdjustStockData } from "@/lib/api/inventoryApi";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { AdjustDialogProps } from "@/components/inventory/types";

export function AdjustStockDialog({ open, onOpenChange, item, onAdjusted }: AdjustDialogProps) {
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
