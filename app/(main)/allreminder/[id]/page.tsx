"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSelector } from "react-redux";
import { reminderApi } from "@/lib/api/reminderApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const userEmail = useSelector((state: any) => state.auth.user?.email);

  const [reminder, setReminder] = useState<ReminderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Edit state
  const [editData, setEditData] = useState({
    medicine_name: "",
    medicine_type: "tablet",
    quantity: "",
    refill_reminder: false,
    refill_threshold: "",
    notification_methods: [] as string[],
    phone_code: "+91",
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

  const fetchReminderDetail = async () => {
    try {
      setLoading(true);
      const response = await reminderApi.getReminder(parseInt(id));
      const data = response.data.data.reminder;
      setReminder(data);
      
      // Initialize edit data
      setEditData({
        medicine_name: data.medicine_name,
        medicine_type: data.medicine_type,
        quantity: data.quantity,
        refill_reminder: data.refill_reminder,
        refill_threshold: data.refill_threshold,
        notification_methods: data.notification_methods,
        phone_code: "+91",
        phone_number: "",
        dose_schedules: data.dose_schedules.map((s: DoseSchedule) => ({
          dose_number: s.dose_number,
          amount: s.amount,
          time: s.time,
        })),
      });
    } catch (error) {
      toast.error("Failed to fetch reminder details");
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
      setEditData({
        medicine_name: reminder.medicine_name,
        medicine_type: reminder.medicine_type,
        quantity: reminder.quantity,
        refill_reminder: reminder.refill_reminder,
        refill_threshold: reminder.refill_threshold,
        notification_methods: reminder.notification_methods,
        phone_code: "+91",
        phone_number: "",
        dose_schedules: reminder.dose_schedules.map((s) => ({
          dose_number: s.dose_number,
          amount: s.amount,
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

    if (parseFloat(editData.quantity) <= 0) {
      toast.error("Quantity must be greater than 0");
      return;
    }

    if (editData.refill_reminder && parseFloat(editData.refill_threshold) > parseFloat(editData.quantity)) {
      toast.error("Refill threshold cannot be more than current quantity");
      return;
    }

    if (editData.dose_schedules.length === 0) {
      toast.error("At least one dose schedule is required");
      return;
    }

    // Check for duplicate times
    const times = editData.dose_schedules.map(s => s.time);
    const uniqueTimes = new Set(times);
    if (times.length !== uniqueTimes.size) {
      toast.error("Dose times must be unique");
      return;
    }

    // Check for empty amounts or times
    for (const schedule of editData.dose_schedules) {
      if (!schedule.amount || parseFloat(schedule.amount) <= 0) {
        toast.error("All dose amounts must be greater than 0");
        return;
      }
      if (!schedule.time) {
        toast.error("All dose times are required");
        return;
      }
    }

    try {
      setActionLoading(true);

      const updatePayload = {
        medicine_name: editData.medicine_name,
        medicine_type: editData.medicine_type,
        dose_count_daily: editData.dose_schedules.length,
        notification_methods: reminder?.notification_methods || [],
        start_date: reminder?.start_date || new Date().toISOString().split('T')[0],
        quantity: parseFloat(editData.quantity),
        refill_reminder: editData.refill_reminder,
        refill_threshold: parseFloat(editData.refill_threshold),
        dose_schedules: editData.dose_schedules.map((s, idx) => ({
          dose_number: idx + 1,
          amount: parseFloat(s.amount),
          time: s.time,
        })),
      };

      await reminderApi.updateReminder(parseInt(id), updatePayload);
      toast.success("Reminder updated successfully");
      setIsEditing(false);
      fetchReminderDetail();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update reminder");
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleActive = async () => {
    if (!reminder) return;

    try {
      setActionLoading(true);
      if (reminder.is_active) {
        await reminderApi.deactivateReminder(reminder.id);
        toast.success("Reminder deactivated");
      } else {
        await reminderApi.activateReminder(reminder.id);
        toast.success("Reminder activated");
      }
      fetchReminderDetail();
    } catch (error) {
      toast.error("Failed to update reminder");
      console.error(error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!reminder) return;
    if (!confirm("Are you sure you want to delete this reminder?")) return;

    try {
      setActionLoading(true);
      await reminderApi.deleteReminder(reminder.id);
      toast.success("Reminder deleted successfully");
      router.push("/allreminder");
    } catch (error) {
      toast.error("Failed to delete reminder");
      console.error(error);
      setActionLoading(false);
    }
  };

  const addDoseSchedule = () => {
    setEditData({
      ...editData,
      dose_schedules: [
        ...editData.dose_schedules,
        {
          dose_number: editData.dose_schedules.length + 1,
          amount: "1",
          time: "08:00",
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
    setEditData({ ...editData, dose_schedules: newSchedules });
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
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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

  return (
    <div className="container mx-auto p-6 max-w-5xl">
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
                <Pill className="w-8 h-8 text-blue-600" />
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
                      <SelectItem value="drops">Drops</SelectItem>
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
                  disabled={actionLoading}
                  size="sm"
                >
                  {actionLoading ? (
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
                  disabled={actionLoading}
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
              <div>
                <p className="text-sm text-gray-500 mb-1">Created</p>
                <p className="text-sm font-medium">
                  {formatDateTime(reminder.created_at)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Last Updated</p>
                <p className="text-sm font-medium">
                  {formatDateTime(reminder.updated_at)}
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
                {isEditing && (
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
                        <span className="text-sm font-bold text-blue-600">
                          #{index + 1}
                        </span>
                      </div>
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Amount</Label>
                          <Input
                            type="number"
                            step="0.5"
                            min="0.5"
                            value={schedule.amount}
                            onChange={(e) =>
                              updateDoseSchedule(index, "amount", e.target.value)
                            }
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
                          <span className="text-sm font-bold text-blue-600">
                            #{schedule.dose_number}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            Dose {schedule.dose_number}
                          </p>
                          <p className="text-sm text-gray-600">
                            {parseFloat(schedule.amount)}{" "}
                            {reminder.medicine_type}
                            {parseFloat(schedule.amount) > 1 ? "s" : ""}
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
              <div className="flex flex-wrap gap-2">
                {reminder.notification_methods.map((method) => (
                  <Badge
                    key={method}
                    variant="outline"
                    className="px-4 py-2 text-sm capitalize"
                  >
                    {method === "push_notification" ? "Push Notification" : method}
                  </Badge>
                ))}
              </div>

              {reminder.notification_methods.includes("email") && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <strong>Email:</strong> {userEmail || "Not available"}
                  </p>
                </div>
              )}

              {reminder.notification_methods.includes("push_notification") && (
                <div className={`p-3 border rounded-lg ${
                  pushPermission === "granted"
                    ? "bg-green-50 border-green-200"
                    : "bg-yellow-50 border-yellow-200"
                }`}>
                  <p className="text-sm font-semibold mb-2">
                    Push Notifications:{" "}
                    {pushPermission === "granted" ? "Enabled" : "Disabled"}
                  </p>
                  {pushPermission !== "granted" && (
                    <Button
                      size="sm"
                      onClick={requestPushPermission}
                      variant="outline"
                    >
                      Enable Push Notifications
                    </Button>
                  )}
                </div>
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
                    step="0.5"
                    min="0"
                    value={editData.quantity}
                    onChange={(e) =>
                      setEditData({ ...editData, quantity: e.target.value })
                    }
                    className="mt-2"
                  />
                </div>
              ) : (
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Current Stock</span>
                    <span className="text-sm font-semibold">
                      {parseFloat(reminder.quantity)} /{" "}
                      {parseFloat(reminder.initial_quantity)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all ${
                        isLowStock ? "bg-red-500" : "bg-green-500"
                      }`}
                      style={{ width: `${Math.min(quantityPercentage, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {!isEditing && isLowStock && (
                <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-red-900">
                      Low Stock Alert
                    </p>
                    <p className="text-xs text-red-700 mt-1">
                      Stock is below threshold of{" "}
                      {parseFloat(reminder.refill_threshold)} units
                    </p>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Refill Reminder
                  </span>
                  {isEditing ? (
                    <Switch
                      checked={editData.refill_reminder}
                      onCheckedChange={(checked) =>
                        setEditData({ ...editData, refill_reminder: checked })
                      }
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
                          step="0.5"
                          min="0"
                          max={parseFloat(editData.quantity)}
                          value={editData.refill_threshold}
                          onChange={(e) =>
                            setEditData({
                              ...editData,
                              refill_threshold: e.target.value,
                            })
                          }
                          className="mt-2"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Must be less than or equal to current quantity
                        </p>
                      </div>
                    ) : (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">
                            Refill Threshold
                          </span>
                          <span className="text-sm font-semibold">
                            {parseFloat(reminder.refill_threshold)} units
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">
                            Reminder Sent
                          </span>
                          <Badge
                            variant={
                              reminder.refill_reminder_sent ? "default" : "outline"
                            }
                          >
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
                  disabled={actionLoading}
                >
                  {actionLoading ? (
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
                  onClick={handleDelete}
                  disabled={actionLoading}
                >
                  {actionLoading ? (
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
    </div>
  );
}