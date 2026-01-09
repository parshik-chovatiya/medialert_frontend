"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { reminderApi } from "@/lib/api/reminderApi";
import { useAppSelector } from "@/store/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    Pill,
    Clock,
    Calendar,
    Package,
    Power,
    PowerOff,
    Trash2,
    Loader2,
    Eye,
} from "lucide-react";

interface Reminder {
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

export default function AllRemindersPage() {
    const router = useRouter();
    
    // ✅ Get auth state from Redux
    const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
    
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [loading, setLoading] = useState(false);
    const [toggleLoading, setToggleLoading] = useState<number | null>(null);
    const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [reminderToDelete, setReminderToDelete] = useState<number | null>(null);

    useEffect(() => {
        // ✅ Only fetch if authenticated
        if (isAuthenticated) {
            fetchReminders();
        }
    }, [isAuthenticated]);

    const fetchReminders = async () => {
        try {
            setLoading(true);
            const response = await reminderApi.getReminders();
            setReminders(response.data.data.reminders);
        } catch (error) {
            toast.error("Failed to fetch reminders");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActive = async (id: number, isActive: boolean, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            setToggleLoading(id);
            if (isActive) {
                await reminderApi.deactivateReminder(id);
                toast.success("Reminder deactivated");
            } else {
                await reminderApi.activateReminder(id);
                toast.success("Reminder activated");
            }
            fetchReminders();
        } catch (error) {
            toast.error("Failed to update reminder");
            console.error(error);
        } finally {
            setToggleLoading(null);
        }
    };

    const handleDeleteClick = (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setReminderToDelete(id);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!reminderToDelete) return;

        try {
            setDeleteLoading(reminderToDelete);
            await reminderApi.deleteReminder(reminderToDelete);
            toast.success("Reminder deleted successfully");
            fetchReminders();
            setDeleteDialogOpen(false);
        } catch (error) {
            toast.error("Failed to delete reminder");
            console.error(error);
        } finally {
            setDeleteLoading(null);
            setReminderToDelete(null);
        }
    };

    const handleViewDetails = (id: number) => {
        router.push(`/allreminder/${id}`);
    };

    const formatTime = (time: string) => {
        const [hours, minutes] = time.split(":");
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? "PM" : "AM";
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    // ✅ Show loading only if authenticated
    if (loading && isAuthenticated) {
        return (
            <div className="container mx-auto p-6 max-w-7xl overflow-x-hidden overflow-y-hidden h-145 [&::-webkit-scrollbar]:pt-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar]:h-3 [&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-thumb]:rounded-full">
                <div className="mb-8">
                    <div className="h-9 w-48 bg-gray-200 rounded animate-pulse mb-2" />
                    <div className="h-5 w-64 bg-gray-200 rounded animate-pulse" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Card key={i} className="overflow-hidden">
                            <div className="h-1 bg-gray-200 animate-pulse" />
                            <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 bg-gray-200 rounded-lg animate-pulse" />
                                        <div className="space-y-2">
                                            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
                                            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                                        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                                        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                                    </div>
                                </div>
                                <div className="pt-2 border-t space-y-2">
                                    <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                                    <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                                </div>
                                <div className="pt-2 border-t">
                                    <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <div className="h-9 flex-1 bg-gray-200 rounded animate-pulse" />
                                </div>
                                <div className="flex gap-2">
                                    <div className="h-9 flex-1 bg-gray-200 rounded animate-pulse" />
                                    <div className="h-9 w-16 bg-gray-200 rounded animate-pulse" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 max-w-7xl overflow-y-auto h-145 [&::-webkit-scrollbar]:pt-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar]:h-3 [&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-thumb]:rounded-full">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    All Reminders
                </h1>
            </div>

            {/* ✅ Show "No reminders" for both auth and non-auth users */}
            {(!isAuthenticated || reminders.length === 0) ? (
                <Card className="text-center py-12">
                    <CardContent>
                        <Pill className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            No Reminders Yet
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {!isAuthenticated 
                                ? "Please login to view your reminders"
                                : "Start by creating your first medicine reminder"
                            }
                        </p>
                        <Button onClick={() => router.push("/reminder")}>
                            {isAuthenticated ? "Create Reminder" : "Get Started"}
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reminders.map((reminder) => (
                        <Card
                            key={reminder.id}
                            className={`relative overflow-hidden transition-all hover:shadow-lg cursor-pointer ${!reminder.is_active ? "opacity-60" : ""
                                }`}
                            onClick={() => handleViewDetails(reminder.id)}
                        >
                            <div
                                className={`absolute top-0 left-0 right-0 h-1 ${reminder.is_active ? "bg-green-500" : "bg-gray-400"
                                    }`}
                            />

                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <Pill className="w-5 h-5 text-blue-600" />
                                        </div>

                                        <div className="flex flex-col min-w-0">
                                            <CardTitle className="text-xl capitalize truncate">
                                                {reminder.medicine_name}
                                            </CardTitle>
                                            <p className="text-sm text-gray-500 capitalize">
                                                {reminder.medicine_type}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center">
                                        <div
                                            className={`flex items-center gap-2 px-3 py-1 rounded-full border ${reminder.is_active
                                                    ? "border-green-500"
                                                    : "border-red-500"
                                                }`}
                                        >
                                            <span
                                                className={`w-2.5 h-2.5 rounded-full ${reminder.is_active ? "bg-green-500" : "bg-red-500"
                                                    }`}
                                            />
                                            <span
                                                className={`text-sm font-medium ${reminder.is_active ? "text-green-600" : "text-red-600"
                                                    }`}
                                            >
                                                {reminder.is_active ? "Active" : "Inactive"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-gray-500" />
                                        <div>
                                            <p className="text-xs text-gray-500">Next Dose</p>
                                            <p className="text-sm font-semibold">
                                                {formatTime(reminder.next_dose_time)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Package className="w-4 h-4 text-gray-500" />
                                        <div>
                                            <p className="text-xs text-gray-500">Quantity</p>
                                            <p className="text-sm font-semibold">
                                                {parseFloat(reminder.quantity)} units
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 pt-2 border-t">
                                    <Calendar className="w-4 h-4 text-gray-500" />
                                    <div>
                                        <p className="text-xs text-gray-500">Daily Doses</p>
                                        <p className="text-sm font-semibold">
                                            {reminder.dose_count_daily}x per day
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-2 border-t">
                                    <p className="text-xs text-gray-500">
                                        Created: {formatDate(reminder.created_at)}
                                    </p>
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleViewDetails(reminder.id);
                                        }}
                                    >
                                        <Eye className="w-4 h-4 mr-2" />
                                        View Details
                                    </Button>
                                </div>

                                <div className="flex gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-1"
                                        onClick={(e) =>
                                            handleToggleActive(reminder.id, reminder.is_active, e)
                                        }
                                        disabled={toggleLoading === reminder.id}
                                    >
                                        {toggleLoading === reminder.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : reminder.is_active ? (
                                            <>
                                                <PowerOff className="w-4 h-4 mr-2" />
                                                Deactivate
                                            </>
                                        ) : (
                                            <>
                                                <Power className="w-4 h-4 mr-2" />
                                                Activate
                                            </>
                                        )}
                                    </Button>

                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={(e) => handleDeleteClick(reminder.id, e)}
                                        disabled={deleteLoading === reminder.id}
                                    >
                                        {deleteLoading === reminder.id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Trash2 className="w-4 h-4" />
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Reminder</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this reminder? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteConfirm}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}