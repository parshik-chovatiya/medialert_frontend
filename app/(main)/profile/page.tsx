"use client";

import { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { updateUser } from "@/store/slices/authSlice";
import { authApi, type ProfileUpdateData, type PasswordChangeData } from "@/lib/api/authApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";
import { Edit, Save, X, Lock, Loader2, CalendarIcon, User, Mail, Phone, Cake, Users } from "lucide-react";
import { format } from "date-fns";

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Edit state
  const [editData, setEditData] = useState({
    name: "",
    birthdate: "",
    gender: "male",
    country_code: "+91",
    mobile_number: "",
  });

  // Password state
  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password: "",
    new_password2: "",
  });

  // ✅ Helper function to parse phone number
  const parsePhoneNumber = (phoneNumber: string | null) => {
    let countryCode = "+91";
    let mobileNumber = "";

    if (phoneNumber) {
      // More robust parsing for different formats
      const cleanPhone = phoneNumber.trim();
      
      // Try to match country code (1-4 digits after +)
      const phoneMatch = cleanPhone.match(/^(\+\d{1,4})(\d+)$/);
      
      if (phoneMatch) {
        countryCode = phoneMatch[1];
        mobileNumber = phoneMatch[2];
      } else if (cleanPhone.startsWith("+")) {
        // Has + but didn't match - try splitting manually
        const plusIndex = cleanPhone.indexOf("+");
        const restOfNumber = cleanPhone.substring(plusIndex + 1);
        
        // Assume first 1-3 digits are country code
        if (restOfNumber.length >= 10) {
          // Try common country code lengths
          if (restOfNumber.startsWith("91")) {
            countryCode = "+91";
            mobileNumber = restOfNumber.substring(2);
          } else if (restOfNumber.startsWith("1")) {
            countryCode = "+1";
            mobileNumber = restOfNumber.substring(1);
          } else {
            mobileNumber = restOfNumber;
          }
        } else {
          mobileNumber = restOfNumber;
        }
      } else {
        // No + sign, assume it's just the mobile number
        mobileNumber = cleanPhone;
      }
    }

    return { countryCode, mobileNumber };
  };

  // ✅ Sync editData whenever user changes (from Redux)
  useEffect(() => {
    if (user) {
      const { countryCode, mobileNumber } = parsePhoneNumber(user.phone_number);

      setEditData({
        name: user.name || "",
        birthdate: user.birthdate || "",
        gender: user.gender || "male",
        country_code: countryCode,
        mobile_number: mobileNumber,
      });
    }
  }, [user]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (user) {
      const { countryCode, mobileNumber } = parsePhoneNumber(user.phone_number);

      setEditData({
        name: user.name || "",
        birthdate: user.birthdate || "",
        gender: user.gender || "male",
        country_code: countryCode,
        mobile_number: mobileNumber,
      });
    }
    setIsEditing(false);
  };

  const handleSave = async () => {
    // Validation
    if (!editData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (!editData.birthdate) {
      toast.error("Birthdate is required");
      return;
    }

    if (!editData.mobile_number || editData.mobile_number.length < 10) {
      toast.error("Valid phone number is required");
      return;
    }

    try {
      setLoading(true);

      const updatePayload: ProfileUpdateData = {
        name: editData.name,
        birthdate: editData.birthdate,
        gender: editData.gender,
        phone_number: `${editData.country_code}${editData.mobile_number}`,
      };

      const response = await authApi.updateProfile(updatePayload);
      
      // ✅ DEBUG: Log the response to see structure
      console.log("API Response:", response.data);
      
      // ✅ Extract user correctly - check if it's nested or not
      let updatedUser;
      if (response.data.data.user) {
        // If response has data.user structure
        updatedUser = response.data.data.user;
      } else {
        // If response is data directly
        updatedUser = response.data.data;
      }

      console.log("Extracted User:", updatedUser);

      // ✅ Make sure we're not passing nested objects
      const cleanUser = {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        birthdate: updatedUser.birthdate,
        gender: updatedUser.gender,
        timezone: updatedUser.timezone,
        phone_number: updatedUser.phone_number,
        is_onboarded: updatedUser.is_onboarded,
        date_joined: updatedUser.date_joined,
        last_login: updatedUser.last_login,
      };

      console.log("Clean User to dispatch:", cleanUser);

      // ✅ Update Redux store with clean user object
      dispatch(updateUser(cleanUser));

      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || "Failed to update profile";
      toast.error(errorMsg);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    // Validation
    if (!passwordData.old_password) {
      toast.error("Current password is required");
      return;
    }

    if (!passwordData.new_password) {
      toast.error("New password is required");
      return;
    }

    if (passwordData.new_password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    if (passwordData.new_password !== passwordData.new_password2) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setPasswordLoading(true);

      await authApi.changePassword(passwordData);

      toast.success("Password changed successfully");
      setShowPasswordDialog(false);
      setPasswordData({
        old_password: "",
        new_password: "",
        new_password2: "",
      });
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || "Failed to change password";
      toast.error(errorMsg);
      console.error(error);
    } finally {
      setPasswordLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-1">Manage your account information</p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={handleCancel} disabled={loading}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setShowPasswordDialog(true)}>
                <Lock className="w-4 h-4 mr-2" />
                Change Password
              </Button>
              <Button onClick={handleEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Name */}
            <div className="grid grid-cols-3 gap-4 items-center">
              <Label className="text-right font-medium">Name</Label>
              <div className="col-span-2">
                {isEditing ? (
                  <Input
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    placeholder="Enter your name"
                  />
                ) : (
                  <p className="text-gray-900">{user.name || "Not set"}</p>
                )}
              </div>
            </div>

            {/* Email (Read-only) */}
            <div className="grid grid-cols-3 gap-4 items-center">
              <Label className="text-right font-medium flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </Label>
              <div className="col-span-2">
                <p className="text-gray-600">{user.email}</p>
              </div>
            </div>

            {/* Gender */}
            <div className="grid grid-cols-3 gap-4 items-start">
              <Label className="text-right font-medium pt-2 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Gender
              </Label>
              <div className="col-span-2">
                {isEditing ? (
                  <RadioGroup
                    value={editData.gender}
                    onValueChange={(value) => setEditData({ ...editData, gender: value })}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="male" id="male" />
                        <Label htmlFor="male" className="cursor-pointer font-normal">
                          Male
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="female" id="female" />
                        <Label htmlFor="female" className="cursor-pointer font-normal">
                          Female
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="other" id="other" />
                        <Label htmlFor="other" className="cursor-pointer font-normal">
                          Other
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                ) : (
                  <p className="text-gray-900 capitalize">{user.gender || "Not set"}</p>
                )}
              </div>
            </div>

            {/* Birthdate */}
            <div className="grid grid-cols-3 gap-4 items-center">
              <Label className="text-right font-medium flex items-center gap-2">
                <Cake className="w-4 h-4" />
                Birthdate
              </Label>
              <div className="col-span-2">
                {isEditing ? (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {editData.birthdate ? format(new Date(editData.birthdate), "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={editData.birthdate ? new Date(editData.birthdate) : undefined}
                        onSelect={(date) => {
                          if (date) {
                            const year = date.getFullYear();
                            const month = String(date.getMonth() + 1).padStart(2, "0");
                            const day = String(date.getDate()).padStart(2, "0");
                            setEditData({ ...editData, birthdate: `${year}-${month}-${day}` });
                          }
                        }}
                        captionLayout="dropdown"
                        fromYear={1900}
                        toYear={new Date().getFullYear()}
                      />
                    </PopoverContent>
                  </Popover>
                ) : (
                  <p className="text-gray-900">{user.birthdate ? formatDate(user.birthdate) : "Not set"}</p>
                )}
              </div>
            </div>

            {/* Phone Number */}
            <div className="grid grid-cols-3 gap-4 items-center">
              <Label className="text-right font-medium flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone
              </Label>
              <div className="col-span-2">
                {isEditing ? (
                  <div className="flex gap-2">
                    <Select
                      value={editData.country_code}
                      onValueChange={(v) => setEditData({ ...editData, country_code: v })}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="+1">+1 (US)</SelectItem>
                        <SelectItem value="+44">+44 (UK)</SelectItem>
                        <SelectItem value="+91">+91 (IN)</SelectItem>
                        <SelectItem value="+86">+86 (CN)</SelectItem>
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
                ) : (
                  <p className="text-gray-900">
                    {user.phone_number ? user.phone_number : (
                      <span className="text-gray-400">Not set</span>
                    )}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4 items-center">
              <Label className="text-right font-medium">Member Since</Label>
              <div className="col-span-2">
                <p className="text-gray-900">{formatDate(user.date_joined)}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 items-center">
              <Label className="text-right font-medium">Timezone</Label>
              <div className="col-span-2">
                <p className="text-gray-900">{user.timezone}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Password Change Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new password
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Current Password</Label>
              <Input
                type="password"
                placeholder="Enter current password"
                value={passwordData.old_password}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, old_password: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>New Password</Label>
              <Input
                type="password"
                placeholder="Enter new password (min. 8 characters)"
                value={passwordData.new_password}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, new_password: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Confirm New Password</Label>
              <Input
                type="password"
                placeholder="Confirm new password"
                value={passwordData.new_password2}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, new_password2: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowPasswordDialog(false);
                setPasswordData({
                  old_password: "",
                  new_password: "",
                  new_password2: "",
                });
              }}
              disabled={passwordLoading}
            >
              Cancel
            </Button>
            <Button onClick={handlePasswordChange} disabled={passwordLoading}>
              {passwordLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                "Change Password"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}