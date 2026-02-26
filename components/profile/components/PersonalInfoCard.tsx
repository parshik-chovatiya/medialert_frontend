"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, User, Mail, Phone, Cake, Users } from "lucide-react";
import { format } from "date-fns";
import type { PersonalInfoCardProps } from "@/components/profile/types";

export function PersonalInfoCard({
    user,
    isEditing,
    editData,
    onEditDataChange,
    formatDate,
}: PersonalInfoCardProps) {
    return (
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
                                onChange={(e) => onEditDataChange({ ...editData, name: e.target.value })}
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
                                onValueChange={(value) => onEditDataChange({ ...editData, gender: value })}
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
                                                onEditDataChange({ ...editData, birthdate: `${year}-${month}-${day}` });
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
                                    onValueChange={(v) => onEditDataChange({ ...editData, country_code: v })}
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
                                        onEditDataChange({ ...editData, mobile_number: val });
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
    );
}
