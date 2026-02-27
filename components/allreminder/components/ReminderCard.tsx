import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import type { ReminderCardProps } from "@/components/allreminder/types";

export function ReminderCard({
    reminder,
    onViewDetails,
    onToggleActive,
    onDeleteClick,
    toggleLoading,
    deleteLoading,
    formatTime,
    formatDate,
}: ReminderCardProps) {
    return (
        <Card
            className={`relative overflow-hidden transition-all hover:shadow-lg cursor-pointer ${!reminder.is_active ? "opacity-60" : ""
                }`}
            onClick={() => onViewDetails(reminder.id)}
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
                            onViewDetails(reminder.id);
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
                            onToggleActive(reminder.id, reminder.is_active, e)
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
                        onClick={(e) => onDeleteClick(reminder.id, e)}
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
    );
}
