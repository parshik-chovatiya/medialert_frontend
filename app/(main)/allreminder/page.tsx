"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { reminderApi } from "@/lib/api/reminderApi";
import { useAppSelector } from "@/store/hooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pill } from "lucide-react";
import { toast } from "sonner";
import type { Reminder } from "@/components/allreminder/types";
import { ReminderSkeleton, ReminderCard, DeleteReminderDialog } from "@/components/allreminder";

export default function AllRemindersPage() {
    const router = useRouter();

    const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [loading, setLoading] = useState(false);
    const [toggleLoading, setToggleLoading] = useState<number | null>(null);
    const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [reminderToDelete, setReminderToDelete] = useState<number | null>(null);

    useEffect(() => {
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
            await reminderApi.deleteReminder(reminderToDelete.toString());
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

    if (loading && isAuthenticated) {
        return (
            <div className="container mx-auto p-6 max-w-7xl overflow-x-hidden overflow-y-hidden h-145 [&::-webkit-scrollbar]:pt-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar]:h-3 [&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-thumb]:rounded-full">
                <div className="mb-8">
                    <div className="h-9 w-48 bg-gray-200 rounded animate-pulse mb-2" />
                    <div className="h-5 w-64 bg-gray-200 rounded animate-pulse" />
                </div>
                <ReminderSkeleton />
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
                        <ReminderCard
                            key={reminder.id}
                            reminder={reminder}
                            onViewDetails={handleViewDetails}
                            onToggleActive={handleToggleActive}
                            onDeleteClick={handleDeleteClick}
                            toggleLoading={toggleLoading}
                            deleteLoading={deleteLoading}
                            formatTime={formatTime}
                            formatDate={formatDate}
                        />
                    ))}
                </div>
            )}

            <DeleteReminderDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={handleDeleteConfirm}
            />
        </div>
    );
}