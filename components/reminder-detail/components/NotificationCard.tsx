import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell } from "lucide-react";
import type { NotificationCardProps } from "@/components/reminder-detail/types";

export function NotificationCard({
    isEditing,
    editData,
    reminder,
    userEmail,
    userPhone,
    pushPermission,
    onToggleMethod,
    onEditDataChange,
    onRequestPushPermission,
}: NotificationCardProps) {
    return (
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
                                    onClick={() => onToggleMethod("email")}
                                >
                                    Email
                                </Button>
                                <Button
                                    type="button"
                                    variant={editData.notification_methods.includes("sms") ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => onToggleMethod("sms")}
                                >
                                    SMS
                                </Button>
                                <Button
                                    type="button"
                                    variant={editData.notification_methods.includes("push_notification") ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => onToggleMethod("push_notification")}
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
                                        onValueChange={(v) => onEditDataChange({ ...editData, country_code: v })}
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
                                            onEditDataChange({ ...editData, mobile_number: val });
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
                                    <Button size="sm" onClick={onRequestPushPermission} variant="outline">
                                        Enable Push Notifications
                                    </Button>
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        {/* Show all notification methods */}
                        <div className="flex flex-wrap gap-2">
                            {reminder.notification_methods.map((method) => (
                                <Badge key={method} variant="outline" className="px-4 py-2 text-sm capitalize">
                                    {method === "push_notification" ? "Push Notification" : method}
                                </Badge>
                            ))}
                        </div>

                        {/* Show Email if enabled */}
                        {reminder.notification_methods.includes("email") && (
                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm text-blue-900">
                                    <strong>Email:</strong> {userEmail || "Not available"}
                                </p>
                            </div>
                        )}

                        {/* Show SMS/Phone if enabled */}
                        {reminder.notification_methods.includes("sms") && (
                            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                <p className="text-sm text-green-900">
                                    <strong>Phone:</strong> {userPhone || "Not available"}
                                </p>
                            </div>
                        )}

                        {/* Show Push if enabled */}
                        {reminder.notification_methods.includes("push_notification") && (
                            <div className={`p-3 border rounded-lg ${pushPermission === "granted" ? "bg-green-50 border-green-200" : "bg-yellow-50 border-yellow-200"}`}>
                                <p className="text-sm font-semibold mb-2">
                                    Push Notifications: {pushPermission === "granted" ? "Enabled" : "Disabled"}
                                </p>
                                {pushPermission !== "granted" && (
                                    <Button size="sm" onClick={onRequestPushPermission} variant="outline">
                                        Enable Push Notifications
                                    </Button>
                                )}
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}
