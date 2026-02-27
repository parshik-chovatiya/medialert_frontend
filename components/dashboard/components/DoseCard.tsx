"use client";

import React, { useState } from "react";
import { TabletIcon, CapsuleIcon, InjectionIcon, SyrupIcon } from "./MedicineIcons";
import { ClockIcon, EmailIcon, SmsIcon, DesktopIcon } from "./NotificationIcons";
import type { DoseCardProps } from "@/components/dashboard/types";

export const DoseCard: React.FC<DoseCardProps> = ({ dose, medicineType, notificationMethods }) => {
    const [isHovered, setIsHovered] = useState(false);

    const getMedicineIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case 'tablet':
                return <TabletIcon />;
            case 'capsule':
                return <CapsuleIcon />;
            case 'injection':
                return <InjectionIcon />;
            case 'syrup':
                return <SyrupIcon />;
            default:
                return <TabletIcon />;
        }
    };

    const getNotificationIcon = (method: string) => {
        switch (method.toLowerCase()) {
            case 'email':
                return (
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <EmailIcon className="w-5 h-5 text-blue-600" />
                    </div>
                );
            case 'sms':
                return (
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <SmsIcon className="w-5 h-5 text-green-600" />
                    </div>
                );
            case 'desktop':
                return (
                    <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                        <DesktopIcon className="w-5 h-5 text-purple-600" />
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div
            className="flex items-center gap-4 py-2 pr-4 pl-2 border rounded-full transition-all duration-200 hover:shadow-md hover:border-primary/30"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="shrink-0 w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                {getMedicineIcon(medicineType)}
            </div>
            <div className="flex flex-1 items-center justify-between min-w-0">
                <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">{dose.instruction}</p>
                    <h3 className="text-base font-bold text-foreground">{dose.name}</h3>
                </div>
                <div className="shrink-0 ml-4">
                    <div className="text-sm text-muted-foreground flex items-center gap-2 transition-opacity duration-200">
                        {isHovered ? (
                            <div className="flex items-center gap-2">
                                {notificationMethods.map((method) => (
                                    <div key={method}>
                                        {getNotificationIcon(method)}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center gap-1">
                                <ClockIcon className="w-4 h-4" />
                                <span>{dose.time}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
