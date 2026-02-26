import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Package, AlertCircle } from "lucide-react";
import type { StockCardProps } from "@/components/reminder-detail/types";

export function StockCard({
    isEditing,
    editData,
    reminder,
    quantityPercentage,
    isLowStock,
    onEditDataChange,
}: StockCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5" />
                    Stock Status
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {isEditing ? (
                    <div>
                        <Label>Current Quantity</Label>
                        <Input
                            type="number"
                            min="1"
                            step="1"
                            value={editData.quantity}
                            onChange={(e) => {
                                const val = e.target.value;
                                const parsed = parseInt(val);
                                onEditDataChange({
                                    ...editData,
                                    quantity: isNaN(parsed) ? "" : parsed.toString(),
                                    refill_threshold: editData.refill_reminder && !isNaN(parsed)
                                        ? Math.floor(parsed / 2).toString()
                                        : editData.refill_threshold
                                });
                            }}
                            className="mt-2"
                        />
                    </div>
                ) : (
                    <div>
                        <div className="flex justify-between mb-2">
                            <span className="text-sm text-gray-600">Current Stock</span>
                            <span className="text-sm font-semibold">
                                {parseInt(reminder.quantity)} / {parseInt(reminder.initial_quantity)}
                            </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div
                                className={`h-3 rounded-full transition-all ${isLowStock ? "bg-red-500" : "bg-green-500"}`}
                                style={{ width: `${Math.min(quantityPercentage, 100)}%` }}
                            />
                        </div>
                    </div>
                )}

                {!isEditing && isLowStock && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-semibold text-red-900">Low Stock Alert</p>
                            <p className="text-xs text-red-700 mt-1">
                                Stock is below threshold of {parseInt(reminder.refill_threshold)} units
                            </p>
                        </div>
                    </div>
                )}

                <div className="pt-4 border-t space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Refill Reminder</span>
                        {isEditing ? (
                            <Switch
                                checked={editData.refill_reminder}
                                onCheckedChange={(checked) => {
                                    const qty = parseInt(editData.quantity);
                                    onEditDataChange({
                                        ...editData,
                                        refill_reminder: checked,
                                        refill_threshold: checked && !isNaN(qty)
                                            ? Math.floor(qty / 2).toString()
                                            : ""
                                    });
                                }}
                            />
                        ) : (
                            <Badge variant={reminder.refill_reminder ? "default" : "secondary"}>
                                {reminder.refill_reminder ? "Enabled" : "Disabled"}
                            </Badge>
                        )}
                    </div>

                    {(isEditing ? editData.refill_reminder : reminder.refill_reminder) && (
                        <>
                            {isEditing ? (
                                <div>
                                    <Label>Refill Threshold</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        step="1"
                                        value={editData.refill_threshold}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            const parsed = parseInt(val);
                                            onEditDataChange({
                                                ...editData,
                                                refill_threshold: isNaN(parsed) ? "" : parsed.toString(),
                                            });
                                        }}
                                        className="mt-2"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Must be less than current quantity
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Refill Threshold</span>
                                        <span className="text-sm font-semibold">
                                            {parseInt(reminder.refill_threshold)} units
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-sm text-gray-600">Reminder Sent</span>
                                        <Badge variant={reminder.refill_reminder_sent ? "default" : "outline"}>
                                            {reminder.refill_reminder_sent ? "Yes" : "No"}
                                        </Badge>
                                    </div>
                                </>
                            )}
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
