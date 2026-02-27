"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DoseCard } from "./DoseCard";
import type { UpcomingDosesSectionProps } from "@/components/dashboard/types";

export const UpcomingDosesSection: React.FC<UpcomingDosesSectionProps> = ({
    doses,
    loading,
    selectedDate,
    isAuthenticated,
    onLoginClick
}) => {
    // Format date to DD/MM/YYYY
    const formatDisplayDate = (dateString: string): string => {
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    };

    // Check if selected date is today
    const isToday = (): boolean => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const todayString = `${year}-${month}-${day}`;
        return selectedDate === todayString;
    };

    // Check if selected date is in the future
    const isFutureDate = (): boolean => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const selected = new Date(selectedDate);
        return selected > today;
    };

    return (
        <div className="rounded-lg bg-white p-6 overflow-hidden flex flex-col shadow-lg relative">
            <h2 className="text-2xl font-bold mb-2">Upcoming Doses</h2>

            {/* Unauthenticated overlay */}
            {!isAuthenticated && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-4 rounded-lg">
                    <p className="text-lg text-gray-700 font-medium">Please login to view your doses</p>
                    <Button size="lg" className="px-8" onClick={onLoginClick}>
                        Login
                    </Button>
                </div>
            )}

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar]:h-4 [&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-thumb]:rounded-full">
                {loading ? (
                    <div className="flex items-center justify-center h-32">
                        <p className="text-muted-foreground">Loading doses...</p>
                    </div>
                ) : doses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 gap-4">
                        {isToday() ? (
                            <p className="text-muted-foreground text-center">
                                You have no remaining dose for today
                            </p>
                        ) : isFutureDate() ? (
                            <>
                                <p className="text-muted-foreground text-center">
                                    You have no reminder on {formatDisplayDate(selectedDate)}
                                </p>
                                <Link href="/reminder">
                                    <Button>
                                        Add Reminder
                                    </Button>
                                </Link>
                            </>
                        ) : (
                            <p className="text-muted-foreground text-center">
                                No doses scheduled for this date
                            </p>
                        )}
                    </div>
                ) : (
                    doses.map((dose) => (
                        <DoseCard
                            key={dose.id}
                            dose={dose}
                            medicineType={dose.medicineType}
                            notificationMethods={dose.notificationMethods}
                        />
                    ))
                )}
            </div>
        </div>
    );
};
