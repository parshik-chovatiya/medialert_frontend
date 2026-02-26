import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Power, PowerOff, Trash2, Loader2 } from "lucide-react";
import type { ActionsCardProps } from "@/components/reminder-detail/types";

export function ActionsCard({
    reminder,
    isEditing,
    toggleLoading,
    deleteLoading,
    onToggleActive,
    onDeleteClick,
}: ActionsCardProps) {
    if (isEditing) return null;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <Button
                    className="w-full"
                    variant={reminder.is_active ? "outline" : "default"}
                    onClick={onToggleActive}
                    disabled={toggleLoading}
                >
                    {toggleLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : reminder.is_active ? (
                        <>
                            <PowerOff className="w-4 h-4 mr-2" />
                            Deactivate Reminder
                        </>
                    ) : (
                        <>
                            <Power className="w-4 h-4 mr-2" />
                            Activate Reminder
                        </>
                    )}
                </Button>

                <Button
                    className="w-full"
                    variant="destructive"
                    onClick={onDeleteClick}
                    disabled={deleteLoading}
                >
                    {deleteLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                        <>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Reminder
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}
