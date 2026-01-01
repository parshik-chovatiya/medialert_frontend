"use client";

import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { MedicineFormData } from "../types";

const NOTIFICATION_OPTIONS = [
    { value: "email", label: "Email" },
    { value: "sms", label: "SMS" },
    { value: "push", label: "Browser Notification" },
];

interface Step5Props {
    form: UseFormReturn<MedicineFormData>;
    onSubmit: () => void;
}

export function Step5Review({ form, onSubmit }: Step5Props) {
    const formData = form.watch();

    const getMedicineTypeLabel = (type: string) => {
        const types: Record<string, string> = {
            tablet: "tablet",
            capsule: "capsule",
            injection: "injection",
            syrup: "ml",
        };
        return types[type] || type;
    };

    const formatTime = (time: string) => {
        if (!time) return "";
        const [hours, minutes] = time.split(":");
        return `${hours}:${minutes}`;
    };

    return (
        <div className="space-y-3 h-full flex flex-col">
            <div className="space-y-2 text-xs bg-gray-50 p-3 rounded-lg border overflow-y-auto flex-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar]:h-4 [&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-thumb]:rounded-full">
                <div className="flex justify-between">
                    <span className="text-gray-600">Medicine :</span>
                    <span className="font-medium">{formData.medicine_name}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Medicine Type :</span>
                    <span className="font-medium capitalize">{formData.medicine_type}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Notification Type :</span>
                    <span className="font-medium capitalize">
                        {(formData.notification_methods || [])
                            .map((type: string) => {
                                const option = NOTIFICATION_OPTIONS.find((opt) => opt.value === type);
                                return option ? option.label : type;
                            })
                            .join(", ")}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Start Date :</span>
                    <span className="font-medium">
                        {formData.start_date
                            ? new Date(formData.start_date).toLocaleDateString()
                            : ""}
                    </span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Doses per day :</span>
                    <span className="font-medium">
                        {formData.dose_count_daily}{" "}
                        {formData.dose_count_daily === 1 ? "time" : "times"} Daily
                    </span>
                </div>
                <div className="border-t pt-2 mt-2">
                    <span className="text-gray-600 font-medium">Schedule :</span>
                    {(formData.dose_schedules || []).map((schedule, i) => (
                        <div key={i} className="flex justify-between mt-1 ml-2">
                            <span className="text-gray-600">Dose {i + 1}:</span>
                            <span className="font-medium">
                                {schedule.amount} {getMedicineTypeLabel(formData.medicine_type)}
                                {schedule.amount > 1 ? "s" : ""} at {formatTime(schedule.time)}
                            </span>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Total quantity :</span>
                    <span className="font-medium">{formData.quantity}</span>
                </div>
                {formData.refill_reminder && formData.refill_threshold && (
                    <div className="flex justify-between">
                        <span className="text-gray-600">Refill alert at :</span>
                        <span className="font-medium">{formData.refill_threshold}</span>
                    </div>
                )}
            </div>
            <Button className="w-full h-9" onClick={onSubmit} type="button">
                Set Reminder
            </Button>
        </div>
    );
}