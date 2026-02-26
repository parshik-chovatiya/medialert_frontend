import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Clock, Plus, Trash } from "lucide-react";
import type { DoseScheduleCardProps } from "@/components/reminder-detail/types";

export function DoseScheduleCard({
    isEditing,
    editData,
    reminder,
    onAddDose,
    onRemoveDose,
    onUpdateDose,
    formatTime,
}: DoseScheduleCardProps) {
    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        Dose Schedule
                    </CardTitle>
                    {isEditing && editData.dose_schedules.length < 10 && (
                        <Button onClick={onAddDose} size="sm" variant="outline">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Dose
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {isEditing ? (
                        editData.dose_schedules.map((schedule, index) => (
                            <div
                                key={index}
                                className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg"
                            >
                                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full flex-shrink-0">
                                    <span className="text-lg font-bold text-blue-600">
                                        {index + 1}
                                    </span>
                                </div>
                                <div className="flex-1 grid grid-cols-2 gap-3">
                                    <div>
                                        <Label className="text-xs">Amount</Label>
                                        <Input
                                            type="number"
                                            min="1"
                                            step="1"
                                            value={schedule.amount}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                const parsed = parseInt(val);
                                                onUpdateDose(index, "amount", isNaN(parsed) ? "" : parsed.toString());
                                            }}
                                            className="mt-1"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs">Time</Label>
                                        <Input
                                            type="time"
                                            value={schedule.time}
                                            onChange={(e) =>
                                                onUpdateDose(index, "time", e.target.value)
                                            }
                                            className="mt-1"
                                        />
                                    </div>
                                </div>
                                {editData.dose_schedules.length > 1 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => onRemoveDose(index)}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                        <Trash className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        ))
                    ) : (
                        reminder.dose_schedules.map((schedule) => (
                            <div
                                key={schedule.id}
                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                                        <span className="text-lg font-bold text-blue-600">
                                            {schedule.dose_number}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900">
                                            Dose {schedule.dose_number}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            {parseInt(schedule.amount)}{" "}
                                            {reminder.medicine_type}
                                            {parseInt(schedule.amount) > 1 ? "s" : ""}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-gray-900">
                                        {formatTime(schedule.time)}
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
