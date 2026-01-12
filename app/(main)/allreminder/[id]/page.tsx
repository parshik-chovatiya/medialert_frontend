"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { reminderApi } from "@/lib/api/reminderApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Bell,
  AlertCircle,
  Power,
  PowerOff,
  Trash2,
  Loader2,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Edit,
  Save,
  X,
  Plus,
  Trash,
  Thermometer,
  Syringe,
  Droplet,
} from "lucide-react";

interface DoseSchedule {
  id?: number;
  dose_number: number;
  amount: string;
  time: string;
}

interface ReminderDetail {
  id: number;
  medicine_name: string;
  medicine_type: string;
  dose_count_daily: number;
  notification_methods: string[];
  start_date: string;
  quantity: string;
  initial_quantity: string;
  refill_reminder: boolean;
  refill_threshold: string;
  refill_reminder_sent: boolean;
  is_active: boolean;
  dose_schedules: DoseSchedule[];
  created_at: string;
  updated_at: string;
}

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
  const [editData, setEditData] = useState({
    medicine_name: "",
    medicine_type: "tablet",
    quantity: "",
    refill_reminder: false,
    refill_threshold: "",
    notification_methods: [] as string[],
    email: "",
    country_code: "+91",
    mobile_number: "",
    phone_number: "",
    dose_schedules: [] as DoseSchedule[],
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
      await reminderApi.deleteReminder(reminder.id);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
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
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/allreminder")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to All Reminders
        </Button>

        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-blue-100 rounded-xl">
                <MedicineIcon className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                {isEditing ? (
                  <Input
                    value={editData.medicine_name}
                    onChange={(e) =>
                      setEditData({ ...editData, medicine_name: e.target.value })
                    }
                    className="text-3xl font-bold h-12 mb-2"
                    placeholder="Medicine name"
                  />
                ) : (
                  <h1 className="text-3xl font-bold text-gray-900 capitalize">
                    {reminder.medicine_name}
                  </h1>
                )}
                {isEditing ? (
                  <Select
                    value={editData.medicine_type}
                    onValueChange={(value) =>
                      setEditData({ ...editData, medicine_type: value })
                    }
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tablet">Tablet</SelectItem>
                      <SelectItem value="capsule">Capsule</SelectItem>
                      <SelectItem value="syrup">Syrup</SelectItem>
                      <SelectItem value="injection">Injection</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-lg text-gray-600 capitalize">
                    {reminder.medicine_type}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge
              variant={reminder.is_active ? "default" : "secondary"}
              className="text-sm px-4 py-2"
            >
              {reminder.is_active ? (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Active
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-2" />
                  Inactive
                </>
              )}
            </Badge>

            {isEditing ? (
              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  disabled={toggleLoading}
                  size="sm"
                >
                  {toggleLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={toggleLoading}
                  size="sm"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            ) : (
              <Button onClick={handleEdit} size="sm">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview Card */}
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

          {/* Dose Schedule Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Dose Schedule
                </CardTitle>
                {isEditing && editData.dose_schedules.length < 10 && (
                  <Button onClick={addDoseSchedule} size="sm" variant="outline">
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
                              updateDoseSchedule(index, "amount", isNaN(parsed) ? "" : parsed.toString());
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
                              updateDoseSchedule(index, "time", e.target.value)
                            }
                            className="mt-1"
                          />
                        </div>
                      </div>
                      {editData.dose_schedules.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDoseSchedule(index)}
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

          {/* Notification Methods Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Methods
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <>
                  {/* Method Selection */}
                  <div>
                    <Label className="text-sm mb-2 block">Select Methods</Label>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant={editData.notification_methods.includes("email") ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleNotificationMethod("email")}
                      >
                        Email
                      </Button>
                      <Button
                        type="button"
                        variant={editData.notification_methods.includes("sms") ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleNotificationMethod("sms")}
                      >
                        SMS
                      </Button>
                      <Button
                        type="button"
                        variant={editData.notification_methods.includes("push_notification") ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleNotificationMethod("push_notification")}
                      >
                        Push Notification
                      </Button>
                    </div>
                  </div>

                  {/* Email Field */}
                  {editData.notification_methods.includes("email") && (
                    <div>
                      <Label>Email Address</Label>
                      <Input
                        type="email"
                        value={editData.email}
                        disabled
                        className="mt-2 bg-gray-100"
                      />
                      <p className="text-xs text-gray-500 mt-1">Notification will sent on this Email.</p>
                    </div>
                  )}

                  {/* Phone Field */}
                  {editData.notification_methods.includes("sms") && (
                    <div>
                      <Label>Phone Number</Label>
                      <div className="flex gap-2 mt-2">
                        <Select
                          value={editData.country_code}
                          onValueChange={(v) => setEditData({ ...editData, country_code: v })}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="+1">+1</SelectItem>
                            <SelectItem value="+44">+44</SelectItem>
                            <SelectItem value="+91">+91</SelectItem>
                            <SelectItem value="+86">+86</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          type="tel"
                          placeholder="9876543210"
                          value={editData.mobile_number}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, "");
                            setEditData({ ...editData, mobile_number: val });
                          }}
                          maxLength={15}
                          className="flex-1"
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Combined: {editData.country_code}{editData.mobile_number}
                      </p>
                    </div>
                  )}

                  {/* Push Permission */}
                  {editData.notification_methods.includes("push_notification") && (
                    <div className={`p-3 border rounded-lg ${pushPermission === "granted" ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"}`}>
                      <p className="text-sm font-semibold mb-2">
                        Push Notifications: {pushPermission === "granted" ? "Enabled" : "Disabled"}
                      </p>
                      {pushPermission !== "granted" && (
                        <Button size="sm" onClick={requestPushPermission} variant="outline">
                          Enable Push Notifications
                        </Button>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* ✅ Show all notification methods */}
                  <div className="flex flex-wrap gap-2">
                    {reminder.notification_methods.map((method) => (
                      <Badge key={method} variant="outline" className="px-4 py-2 text-sm capitalize">
                        {method === "push_notification" ? "Push Notification" : method}
                      </Badge>
                    ))}
                  </div>

                  {/* ✅ Show Email if enabled */}
                  {reminder.notification_methods.includes("email") && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-900">
                        <strong>Email:</strong> {userEmail || "Not available"}
                      </p>
                    </div>
                  )}

                  {/* ✅ Show SMS/Phone if enabled */}
                  {reminder.notification_methods.includes("sms") && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-900">
                        <strong>Phone:</strong> {userPhone || "Not available"}
                      </p>
                    </div>
                  )}

                  {/* ✅ Show Push if enabled */}
                  {reminder.notification_methods.includes("push_notification") && (
                    <div className={`p-3 border rounded-lg ${pushPermission === "granted" ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"}`}>
                      <p className="text-sm font-semibold mb-2">
                        Push Notifications: {pushPermission === "granted" ? "Enabled" : "Disabled"}
                      </p>
                      {pushPermission !== "granted" && (
                        <Button size="sm" onClick={requestPushPermission} variant="outline">
                          Enable Push Notifications
                        </Button>
                      )}
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Stock & Actions */}
        <div className="space-y-6">
          {/* Stock Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Stock Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isEditing ? (
                <div>
                  <Label>Current Quantity</Label>
                  <Input
                    type="number"
                    min="1"
                    step="1"
                    value={editData.quantity}
                    onChange={(e) => {
                      const val = e.target.value;
                      const parsed = parseInt(val);
                      setEditData({ 
                        ...editData, 
                        quantity: isNaN(parsed) ? "" : parsed.toString(),
                        // Auto-update threshold if enabled
                        refill_threshold: editData.refill_reminder && !isNaN(parsed) 
                          ? Math.floor(parsed / 2).toString() 
                          : editData.refill_threshold
                      });
                    }}
                    className="mt-2"
                  />
                </div>
              ) : (
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Current Stock</span>
                    <span className="text-sm font-semibold">
                      {parseInt(reminder.quantity)} / {parseInt(reminder.initial_quantity)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${isLowStock ? "bg-red-500" : "bg-green-500"}`}
                      style={{ width: `${Math.min(quantityPercentage, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {!isEditing && isLowStock && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-red-900">Low Stock Alert</p>
                    <p className="text-xs text-red-700 mt-1">
                      Stock is below threshold of {parseInt(reminder.refill_threshold)} units
                    </p>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Refill Reminder</span>
                  {isEditing ? (
                    <Switch
                      checked={editData.refill_reminder}
                      onCheckedChange={(checked) => {
                        const qty = parseInt(editData.quantity);
                        setEditData({ 
                          ...editData, 
                          refill_reminder: checked,
                          refill_threshold: checked && !isNaN(qty) 
                            ? Math.floor(qty / 2).toString() 
                            : ""
                        });
                      }}
                    />
                  ) : (
                    <Badge variant={reminder.refill_reminder ? "default" : "secondary"}>
                      {reminder.refill_reminder ? "Enabled" : "Disabled"}
                    </Badge>
                  )}
                </div>

                {(isEditing ? editData.refill_reminder : reminder.refill_reminder) && (
                  <>
                    {isEditing ? (
                      <div>
                        <Label>Refill Threshold</Label>
                        <Input
                          type="number"
                          min="1"
                          step="1"
                          value={editData.refill_threshold}
                          onChange={(e) => {
                            const val = e.target.value;
                            const parsed = parseInt(val);
                            setEditData({
                              ...editData,
                              refill_threshold: isNaN(parsed) ? "" : parsed.toString(),
                            });
                          }}
                          className="mt-2"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Must be less than current quantity
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Refill Threshold</span>
                          <span className="text-sm font-semibold">
                            {parseInt(reminder.refill_threshold)} units
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Reminder Sent</span>
                          <Badge variant={reminder.refill_reminder_sent ? "default" : "outline"}>
                            {reminder.refill_reminder_sent ? "Yes" : "No"}
                          </Badge>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions Card */}
          {!isEditing && (
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  className="w-full"
                  variant={reminder.is_active ? "outline" : "default"}
                  onClick={handleToggleActive}
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
                  onClick={handleDeleteClick}
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
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Reminder</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this reminder for <strong>{reminder.medicine_name}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}