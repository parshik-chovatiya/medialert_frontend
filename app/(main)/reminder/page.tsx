"use client";

import ReminderWizard from "@/components/reminder/ReminderWizard";
import { reminderApi } from "@/lib/api/reminderApi";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function ReminderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: any) => {
    setLoading(true)

    try {
      const apiData = {
        medicine_name: formData.medicine_name,
        medicine_type: formData.medicine_type,
        dose_count_daily: formData.dose_count_daily,
        notification_methods: formData.notification_methods || [],
        start_date: formData.start_date,
        quantity: Number(formData.quantity),
        refill_reminder: formData.refill_reminder || false,
        refill_threshold: formData.refill_reminder && formData.refill_threshold 
          ? Number(formData.refill_threshold) 
          : undefined,
        dose_schedules: formData.dose_schedules,
        phone_number: formData.phone_number || undefined,
      }

      const response = await reminderApi.createReminder(apiData)

      toast.success("Medicine reminder created successfully")

      setTimeout(() => {
        router.push("/")
      }, 1000);
    } catch (error: any) {
      console.error("Failed to create reminder", error)

      const errorMsg = error?.response?.data?.message ||
        error?.response?.data?.medicine_name?.[0] ||
        error?.response?.data?.dose_schedules?.[0] ||
        error?.response?.data?.notification_methods?.[0] ||
        error?.response?.data?.detail ||
        "Failed to create reminder";

      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="py-8">
      <ReminderWizard onSubmit={handleSubmit} />
    </div>
  );
}