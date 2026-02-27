import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Loader2, Clock3, RefreshCw } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import { getMedicineIcon } from "./MedicineIcon";
import type { ItemCardProps } from "@/components/inventory/types";

export function ItemCard({ item, onEdit, onDelete, onAdjust, deleteLoading }: ItemCardProps) {
    const topBarColor = item.is_expired
        ? "bg-red-500"
        : item.is_low_stock
            ? "bg-amber-500"
            : item.is_expiring_soon
                ? "bg-orange-400"
                : "bg-green-500";

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
