"use client";

import { useState, useEffect } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { updateUser } from "@/store/slices/authSlice";
import { authApi, type ProfileUpdateData, type PasswordChangeData } from "@/lib/api/authApi";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { ProfileEditData, PasswordData } from "@/components/profile/types";
import {
  ProfileHeader,
  PersonalInfoCard,
  AccountInfoCard,
  PasswordDialog,
} from "@/components/profile";

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Edit state
  const [editData, setEditData] = useState<ProfileEditData>({
    name: "",
    birthdate: "",
    gender: "male",
    country_code: "+91",
    mobile_number: "",
  });

  // Password state
  const [passwordData, setPasswordData] = useState<PasswordData>({
    old_password: "",
    new_password: "",
    new_password2: "",
  });

  // ✅ Helper function to parse phone number
  const parsePhoneNumber = (phoneNumber: string | null) => {
    let countryCode = "+91";
    let mobileNumber = "";

    if (phoneNumber) {
      const cleanPhone = phoneNumber.trim();

      const phoneMatch = cleanPhone.match(/^(\+\d{1,4})(\d+)$/);

      if (phoneMatch) {
        countryCode = phoneMatch[1];
        mobileNumber = phoneMatch[2];
      } else if (cleanPhone.startsWith("+")) {
        const plusIndex = cleanPhone.indexOf("+");
        const restOfNumber = cleanPhone.substring(plusIndex + 1);

        if (restOfNumber.length >= 10) {
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
        updatedUser = response.data.data.user;
      } else {
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
      <ProfileHeader
        isEditing={isEditing}
        loading={loading}
        onEdit={handleEdit}
        onCancel={handleCancel}
        onSave={handleSave}
        onChangePassword={() => setShowPasswordDialog(true)}
      />

      <div className="grid gap-6">
        <PersonalInfoCard
          user={user}
          isEditing={isEditing}
          editData={editData}
          onEditDataChange={setEditData}
          formatDate={formatDate}
        />

        <AccountInfoCard
          user={user}
          formatDate={formatDate}
        />
      </div>

      <PasswordDialog
        open={showPasswordDialog}
        onOpenChange={setShowPasswordDialog}
        passwordData={passwordData}
        onPasswordDataChange={setPasswordData}
        onSubmit={handlePasswordChange}
        loading={passwordLoading}
      />
    </div>
  );
}