import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    CheckCircle2,
    XCircle,
    Edit,
    Save,
    X,
    Loader2,
    ArrowLeft,
} from "lucide-react";
import type { DetailHeaderProps } from "@/components/reminder-detail/types";

interface DetailHeaderWithNavProps extends DetailHeaderProps {
    onBack: () => void;
}

export function DetailHeader({
    reminder,
    isEditing,
    editData,
    toggleLoading,
    MedicineIcon,
    onEditDataChange,
    onEdit,
    onSave,
    onCancel,
    onBack,
}: DetailHeaderWithNavProps) {
    return (
        <div className="mb-6">
            <Button
                variant="ghost"
                onClick={onBack}
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
                                        onEditDataChange({ ...editData, medicine_name: e.target.value })
                                    }
                                    className="text-3xl font-bold h-12 mb-2 bg-white"
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
                                        onEditDataChange({ ...editData, medicine_type: value })
                                    }
                                >
                                    <SelectTrigger className="w-40 bg-white">
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
                                onClick={onSave}
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
                                onClick={onCancel}
                                disabled={toggleLoading}
                                size="sm"
                            >
                                <X className="w-4 h-4 mr-2" />
                                Cancel
                            </Button>
                        </div>
                    ) : (
                        <Button onClick={onEdit} size="sm">
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
