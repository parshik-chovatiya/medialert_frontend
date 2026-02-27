import { Badge } from "@/components/ui/badge";
import type { InventoryItem } from "@/lib/api/inventoryApi";

export function StatusBadge({ item }: { item: InventoryItem }) {
    if (item.is_expired)
        return <Badge variant="destructive">Expired</Badge>;
    if (item.is_low_stock)
        return <Badge className="bg-amber-500 hover:bg-amber-600 text-white">Low Stock</Badge>;
    if (item.is_expiring_soon)
        return <Badge className="bg-orange-400 hover:bg-orange-500 text-white">Expiring Soon</Badge>;
    return <Badge className="bg-green-500 hover:bg-green-600 text-white">In Stock</Badge>;
}
