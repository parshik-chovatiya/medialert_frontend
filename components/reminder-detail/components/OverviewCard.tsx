import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import type { OverviewCardProps } from "@/components/reminder-detail/types";

export function OverviewCard({ reminder, isEditing, editData }: OverviewCardProps) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Overview
                </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-6">
                <div>
                    <p className="text-sm text-gray-500 mb-1">Start Date</p>
                    <p className="text-lg font-semibold">
                        {formatDate(reminder.start_date)}
                    </p>
                </div>
                <div>
                    <p className="text-sm text-gray-500 mb-1">Daily Doses</p>
                    <p className="text-lg font-semibold">
                        {isEditing ? editData.dose_schedules.length : reminder.dose_count_daily} times per day
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
