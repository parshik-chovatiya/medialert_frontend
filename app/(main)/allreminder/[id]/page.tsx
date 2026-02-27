"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { reminderApi } from "@/lib/api/reminderApi";
import { toast } from "sonner";
import { Loader2, Pill, Thermometer, Syringe, Droplet } from "lucide-react";
import type { ReminderDetail, EditData, DoseSchedule } from "@/components/reminder-detail/types";
import {
  DetailHeader,
  OverviewCard,
  DoseScheduleCard,
  NotificationCard,
  StockCard,
  ActionsCard,
  DeleteDialog,
} from "@/components/reminder-detail";

export default function ReminderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  // ✅ Fetch user data from Redux
  const user = useAppSelector((state) => state.auth.user);
  const userEmail = user?.email || "";
  const userPhone = user?.phone_number || "";
  const [reminder, setReminder] = useState<ReminderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [toggleLoading, setToggleLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Edit state
  const [editData, setEditData] = useState<EditData>({
    medicine_name: "",
    medicine_type: "tablet",
    quantity: "",
    refill_reminder: false,
    refill_threshold: "",
    notification_methods: [],
    email: "",
    country_code: "+91",
    mobile_number: "",
    phone_number: "",
    dose_schedules: [],
  });

  const [pushPermission, setPushPermission] = useState<NotificationPermission>("default");

  useEffect(() => {
    if (id) {
      fetchReminderDetail();
    }
    checkPushPermission();
  }, [id]);

  const checkPushPermission = () => {
    if ("Notification" in window) {
      setPushPermission(Notification.permission);
    }
  };

  const requestPushPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      setPushPermission(permission);
      if (permission === "granted") {
        toast.success("Push notifications enabled");
      } else {
        toast.error("Push notification permission denied");
      }
    }
  };

  // ✅ Get medicine icon based on type
  const getMedicineIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'tablet':
        return Pill;
      case 'capsule':
        return Thermometer;
      case 'injection':
        return Syringe;
      case 'syrup':
        return Droplet;
      default:
        return Pill;
    }
  };

  const fetchReminderDetail = async () => {
    try {
      setLoading(true);
      const response = await reminderApi.getReminder(parseInt(id));
      const data = response.data.data.reminder;
      setReminder(data);

      // ✅ Parse phone number
      let countryCode = "+91";
      let mobileNumber = "";

      if (userPhone) {
        const phoneMatch = userPhone.match(/^(\+\d{1,3})(.+)$/);
        if (phoneMatch) {
          countryCode = phoneMatch[1];
          mobileNumber = phoneMatch[2];
        } else {
          mobileNumber = userPhone;
        }
      }

      // Initialize edit data
      setEditData({
        medicine_name: data.medicine_name,
        medicine_type: data.medicine_type,
        quantity: parseInt(data.quantity).toString(),
        refill_reminder: data.refill_reminder,
        refill_threshold: data.refill_threshold ? parseInt(data.refill_threshold).toString() : "",
        notification_methods: data.notification_methods,
        email: userEmail,
        country_code: countryCode,
        mobile_number: mobileNumber,
        phone_number: userPhone,
        dose_schedules: data.dose_schedules.map((s: DoseSchedule) => ({
          dose_number: s.dose_number,
          amount: parseInt(s.amount).toString(),
          time: s.time,
        })),
      });
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || "Failed to fetch reminder details";
      toast.error(errorMsg);
      console.error(error);
      router.push("/allreminder");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (reminder) {
      let countryCode = "+91";
      let mobileNumber = "";

      if (userPhone) {
        const phoneMatch = userPhone.match(/^(\+\d{1,3})(.+)$/);
        if (phoneMatch) {
          countryCode = phoneMatch[1];
          mobileNumber = phoneMatch[2];
        } else {
          mobileNumber = userPhone;
        }
      }

      setEditData({
        medicine_name: reminder.medicine_name,
        medicine_type: reminder.medicine_type,
        quantity: parseInt(reminder.quantity).toString(),
        refill_reminder: reminder.refill_reminder,
        refill_threshold: reminder.refill_threshold ? parseInt(reminder.refill_threshold).toString() : "",
        notification_methods: reminder.notification_methods,
        email: userEmail,
        country_code: countryCode,
        mobile_number: mobileNumber,
        phone_number: userPhone,
        dose_schedules: reminder.dose_schedules.map((s) => ({
          dose_number: s.dose_number,
          amount: parseInt(s.amount).toString(),
          time: s.time,
        })),
      });
    }
    setIsEditing(false);
  };

  const handleSave = async () => {
    // Validation
    if (!editData.medicine_name.trim()) {
      toast.error("Medicine name is required");
      return;
    }

    const quantity = parseInt(editData.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      toast.error("Quantity must be a positive number");
      return;
    }

    if (editData.refill_reminder) {
      const threshold = parseInt(editData.refill_threshold);
      if (isNaN(threshold) || threshold <= 0) {
        toast.error("Refill threshold must be a positive number");
        return;
      }
      if (threshold >= quantity) {
        toast.error("Refill threshold must be less than current quantity");
        return;
      }
    }

    if (editData.dose_schedules.length === 0) {
      toast.error("At least one dose schedule is required");
      return;
    }

    if (editData.dose_schedules.length > 10) {
      toast.error("Maximum 10 doses allowed");
      return;
    }

    // Check for duplicate times
    const times = editData.dose_schedules.map(s => s.time);
    const uniqueTimes = new Set(times);
    if (times.length !== uniqueTimes.size) {
      toast.error("All dose times must be unique");
      return;
    }

    // Check for empty amounts or times
    for (const schedule of editData.dose_schedules) {
      const amount = parseInt(schedule.amount);
      if (isNaN(amount) || amount <= 0) {
        toast.error("All dose amounts must be positive numbers");
        return;
      }
      if (!schedule.time) {
        toast.error("All dose times are required");
        return;
      }
    }

    // ✅ Validate notification methods
    const updatedMethods = [...editData.notification_methods];

    // Check SMS
    if (updatedMethods.includes("sms")) {
      if (!editData.mobile_number || editData.mobile_number.length < 10) {
        toast.error("Valid phone number required for SMS notifications");
        return;
      }
    }

    // Check Push
    if (updatedMethods.includes("push_notification")) {
      if (pushPermission !== "granted") {
        toast.error("Browser permission required for push notifications");
        return;
      }
    }

    try {
      setToggleLoading(true);

      // ✅ Build phone_number for API
      let apiPhoneNumber = undefined;
      if (updatedMethods.includes("sms")) {
        apiPhoneNumber = `${editData.country_code}${editData.mobile_number}`;
      }

      const updatePayload = {
        medicine_name: editData.medicine_name,
        medicine_type: editData.medicine_type,
        dose_count_daily: editData.dose_schedules.length,
        notification_methods: updatedMethods,
        start_date: reminder?.start_date || new Date().toISOString().split('T')[0],
        quantity: quantity,
        refill_reminder: editData.refill_reminder,
        refill_threshold: editData.refill_reminder ? parseInt(editData.refill_threshold) : undefined,
        dose_schedules: editData.dose_schedules.map((s, idx) => ({
          dose_number: idx + 1,
          amount: parseInt(s.amount),
          time: s.time,
        })),
        phone_number: apiPhoneNumber,
      };

      await reminderApi.updateReminder(parseInt(id), updatePayload);
      toast.success("Reminder updated successfully");
      setIsEditing(false);
      fetchReminderDetail();
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || "Failed to update reminder";
      toast.error(errorMsg);
      console.error(error);
    } finally {
      setToggleLoading(false);
    }
  };

  const handleToggleActive = async () => {
    if (!reminder) return;

    try {
      setToggleLoading(true);
      if (reminder.is_active) {
        await reminderApi.deactivateReminder(reminder.id);
        toast.success("Reminder deactivated");
      } else {
        await reminderApi.activateReminder(reminder.id);
        toast.success("Reminder activated");
      }
      fetchReminderDetail();
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || "Failed to update reminder";
      toast.error(errorMsg);
      console.error(error);
    } finally {
      setToggleLoading(false);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!reminder) return;

    try {
      setDeleteLoading(true);
      await reminderApi.deleteReminder(reminder.id.toString());
      toast.success("Reminder deleted successfully");
      setShowDeleteDialog(false);
      router.push("/allreminder");
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || "Failed to delete reminder";
      toast.error(errorMsg);
      console.error(error);
      setDeleteLoading(false);
    }
  };

  const addDoseSchedule = () => {
    if (editData.dose_schedules.length >= 10) {
      toast.error("Maximum 10 doses allowed");
      return;
    }

    // ✅ Find a unique time
    const existingTimes = editData.dose_schedules.map(s => s.time);
    let newTime = "08:00";

    // Generate unique time
    for (let hour = 8; hour < 24; hour++) {
      const testTime = `${String(hour).padStart(2, '0')}:00`;
      if (!existingTimes.includes(testTime)) {
        newTime = testTime;
        break;
      }
    }

    setEditData({
      ...editData,
      dose_schedules: [
        ...editData.dose_schedules,
        {
          dose_number: editData.dose_schedules.length + 1,
          amount: "1",
          time: newTime,
        },
      ],
    });
  };

  const removeDoseSchedule = (index: number) => {
    const newSchedules = editData.dose_schedules.filter((_, i) => i !== index);
    setEditData({
      ...editData,
      dose_schedules: newSchedules.map((s, idx) => ({
        ...s,
        dose_number: idx + 1,
      })),
    });
  };

  const updateDoseSchedule = (index: number, field: string, value: string) => {
    const newSchedules = [...editData.dose_schedules];
    newSchedules[index] = { ...newSchedules[index], [field]: value };

    // ✅ Check for duplicate times when time field is updated
    if (field === "time") {
      const times = newSchedules.map(s => s.time);
      const duplicates = times.filter((time, idx) => time === value && idx !== index);

      if (duplicates.length > 0) {
        toast.error("This time is already used by another dose");
        return;
      }
    }

    setEditData({ ...editData, dose_schedules: newSchedules });
  };

  // ✅ Toggle notification method
  const toggleNotificationMethod = (method: string) => {
    const current = editData.notification_methods;
    let updated: string[];

    if (current.includes(method)) {
      updated = current.filter(m => m !== method);
    } else {
      updated = [...current, method];
    }

    setEditData({ ...editData, notification_methods: updated });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!reminder) {
    return null;
  }

  const quantityPercentage =
    (parseFloat(reminder.quantity) / parseFloat(reminder.initial_quantity)) * 100;
  const isLowStock =
    parseFloat(reminder.quantity) <= parseFloat(reminder.refill_threshold);

  const MedicineIcon = getMedicineIcon(isEditing ? editData.medicine_type : reminder.medicine_type);

  return (
    <div className="container mx-auto p-6 max-w-7xl h-145 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar]:h-4 [&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-thumb]:rounded-full">
      {/* Header */}
      <DetailHeader
        reminder={reminder}
        isEditing={isEditing}
        editData={editData}
        toggleLoading={toggleLoading}
        MedicineIcon={MedicineIcon}
        onEditDataChange={setEditData}
        onEdit={handleEdit}
        onSave={handleSave}
        onCancel={handleCancel}
        onBack={() => router.push("/allreminder")}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <OverviewCard
            reminder={reminder}
            isEditing={isEditing}
            editData={editData}
          />

          <DoseScheduleCard
            isEditing={isEditing}
            editData={editData}
            reminder={reminder}
            onAddDose={addDoseSchedule}
            onRemoveDose={removeDoseSchedule}
            onUpdateDose={updateDoseSchedule}
            formatTime={formatTime}
          />

          <NotificationCard
            isEditing={isEditing}
            editData={editData}
            reminder={reminder}
            userEmail={userEmail}
            userPhone={userPhone}
            pushPermission={pushPermission}
            onToggleMethod={toggleNotificationMethod}
            onEditDataChange={setEditData}
            onRequestPushPermission={requestPushPermission}
          />
        </div>

        {/* Right Column - Stock & Actions */}
        <div className="space-y-6">
          <StockCard
            isEditing={isEditing}
            editData={editData}
            reminder={reminder}
            quantityPercentage={quantityPercentage}
            isLowStock={isLowStock}
            onEditDataChange={setEditData}
          />

          <ActionsCard
            reminder={reminder}
            isEditing={isEditing}
            toggleLoading={toggleLoading}
            deleteLoading={deleteLoading}
            onToggleActive={handleToggleActive}
            onDeleteClick={handleDeleteClick}
          />
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDeleteConfirm}
        medicineName={reminder.medicine_name}
        deleteLoading={deleteLoading}
      />
    </div>
  );
}