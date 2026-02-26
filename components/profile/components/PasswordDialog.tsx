import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import type { PasswordDialogProps } from "@/components/profile/types";

export function PasswordDialog({
    open,
    onOpenChange,
    passwordData,
    onPasswordDataChange,
    onSubmit,
    loading,
}: PasswordDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
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
                                onPasswordDataChange({ ...passwordData, old_password: e.target.value })
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
                                onPasswordDataChange({ ...passwordData, new_password: e.target.value })
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
                                onPasswordDataChange({ ...passwordData, new_password2: e.target.value })
                            }
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => {
                            onOpenChange(false);
                            onPasswordDataChange({
                                old_password: "",
                                new_password: "",
                                new_password2: "",
                            });
                        }}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button onClick={onSubmit} disabled={loading}>
                        {loading ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            "Change Password"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
