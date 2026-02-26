import { Button } from "@/components/ui/button";
import { Edit, Save, X, Lock, Loader2 } from "lucide-react";
import type { ProfileHeaderProps } from "@/components/profile/types";

export function ProfileHeader({
    isEditing,
    loading,
    onEdit,
    onCancel,
    onSave,
    onChangePassword,
}: ProfileHeaderProps) {
    return (
        <div className="mb-6 flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
                <p className="text-gray-600 mt-1">Manage your account information</p>
            </div>
            <div className="flex gap-2">
                {isEditing ? (
                    <>
                        <Button variant="outline" onClick={onCancel} disabled={loading}>
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                        </Button>
                        <Button onClick={onSave} disabled={loading}>
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
                        <Button variant="outline" onClick={onChangePassword}>
                            <Lock className="w-4 h-4 mr-2" />
                            Change Password
                        </Button>
                        <Button onClick={onEdit}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Profile
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}
