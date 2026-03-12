"use client";

import { useEffect, useState, useCallback } from "react";
import { useAppSelector } from "@/store/hooks";
import {
    inventoryApi,
    type InventoryItem,
} from "@/lib/api/inventoryApi";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Archive,
    Plus,
    PackageOpen,
    AlertTriangle,
    CalendarX2,
    Clock3,
    Lock,
} from "lucide-react";
import { toast } from "sonner";
import type { Tab, TabDef } from "@/components/inventory/types";
import {
    InventorySkeleton,
    ItemFormDialog,
    AdjustStockDialog,
    ItemCard,
    DeleteConfirmDialog,
} from "@/components/inventory";
import AuthComponent from "@/components/AuthComponent";

export default function InventoryPage() {
    const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

    const [activeTab, setActiveTab] = useState<Tab>("all");
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);

    // Modals
    const [formOpen, setFormOpen] = useState(false);
    const [editItem, setEditItem] = useState<InventoryItem | null>(null);
    const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null);
    const [adjustOpen, setAdjustOpen] = useState(false);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

    const tabs: TabDef[] = [
        {
            key: "all",
            label: "All Items",
            icon: <Archive className="w-4 h-4" />,
            fetcher: inventoryApi.getInventory,
            emptyMessage: "No inventory items yet. Add your first item!",
        },
        {
            key: "low_stock",
            label: "Low Stock",
            icon: <AlertTriangle className="w-4 h-4" />,
            fetcher: inventoryApi.getLowStock,
            emptyMessage: "Great! No items are running low.",
        },
        {
            key: "expired",
            label: "Expired",
            icon: <CalendarX2 className="w-4 h-4" />,
            fetcher: inventoryApi.getExpired,
            emptyMessage: "No expired items found.",
        },
        {
            key: "expiring_soon",
            label: "Expiring Soon",
            icon: <Clock3 className="w-4 h-4" />,
            fetcher: inventoryApi.getExpiringSoon,
            emptyMessage: "No items are expiring soon.",
        },
    ];

    const currentTab = tabs.find((t) => t.key === activeTab)!;

    const fetchItems = useCallback(async () => {
        if (!isAuthenticated) return;
        setLoading(true);
        try {
            const res = await currentTab.fetcher();
            const nested = res.data?.data ?? res.data;
            const raw = nested?.inventory ?? nested;
            setItems(Array.isArray(raw) ? raw : []);
        } catch {
            toast.error("Failed to load inventory");
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, activeTab]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const handleDeleteConfirm = async () => {
        if (!deleteId) return;
        setDeleteLoading(deleteId);
        try {
            await inventoryApi.deleteInventoryItem(deleteId);
            toast.success("Item deleted");
            fetchItems();
        } catch {
            toast.error("Failed to delete item");
        } finally {
            setDeleteLoading(null);
            setDeleteId(null);
        }
    };

    return (
        <div className="relative">
            <div className={`transition-all ${!isAuthenticated ? "blur-sm pointer-events-none select-none" : ""}`}>
                <div className="container mx-auto p-6 max-w-7xl overflow-y-auto h-145 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar]:h-4 [&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-thumb]:rounded-full">

                    {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Inventory</h1>
                    <p className="text-muted-foreground text-sm mt-1">Track your medicine stock and expiry dates</p>
                </div>
                <Button
                    onClick={() => { setEditItem(null); setFormOpen(true); }}
                    className="flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Add Item
                </Button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 bg-muted p-1 rounded-xl w-fit mb-6">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.key
                            ? "bg-white shadow text-primary"
                            : "text-muted-foreground hover:text-foreground"
                            }`}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            {loading ? (
                <InventorySkeleton />
            ) : items.length === 0 ? (
                <Card className="text-center py-16">
                    <CardContent>
                        <PackageOpen className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">{currentTab.emptyMessage}</h3>
                        {activeTab === "all" && (
                            <Button
                                className="mt-2"
                                onClick={() => { setEditItem(null); setFormOpen(true); }}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add First Item
                            </Button>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item) => (
                        <ItemCard
                            key={item.id}
                            item={item}
                            onEdit={() => { setEditItem(item); setFormOpen(true); }}
                            onDelete={() => setDeleteId(item.id)}
                            onAdjust={() => { setAdjustItem(item); setAdjustOpen(true); }}
                            deleteLoading={deleteLoading === item.id}
                        />
                    ))}
                </div>
            )}

            {/* Add / Edit Dialog */}
            <ItemFormDialog
                open={formOpen}
                onOpenChange={setFormOpen}
                initial={editItem}
                onSaved={fetchItems}
            />

            {/* Adjust Stock Dialog */}
            <AdjustStockDialog
                open={adjustOpen}
                onOpenChange={setAdjustOpen}
                item={adjustItem}
                onAdjusted={fetchItems}
            />

            {/* Delete Confirm */}
            <DeleteConfirmDialog
                deleteId={deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDeleteConfirm}
            />
                </div>
            </div>

            {/* Auth Overlay */}
            {!isAuthenticated && (
                <div className="absolute inset-0 z-30 flex items-center justify-center rounded-2xl">
                    <div className="absolute inset-0" />
                    <div className="relative z-40 bg-white shadow-lg flex flex-col items-center gap-3 rounded-xl px-12 py-8 border border-gray-100">
                        <Lock className="h-14 w-14 text-primary" />
                        <p className="text-3xl font-medium text-foreground font-semibold">
                            You are not logged in
                        </p>
                        <p>To view your inventory, please log in.</p>
                        <button
                            onClick={() => setShowAuthModal(true)}
                            className="rounded-md bg-primary/20 px-4 py-2 text-sm font-medium text-black hover:bg-primary hover:text-white hover:cursor-pointer transition mt-2"
                        >
                            Login
                        </button>
                    </div>
                </div>
            )}

            {/* Auth Modal */}
            <AuthComponent
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
            />
        </div>
    );
}
