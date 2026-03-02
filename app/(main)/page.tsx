"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import DateStrip from "@/components/date-strip";
import OnboardingDialog from "@/components/onboarding/OnboardingDialog";
import AuthComponent from "@/components/AuthComponent";
import Image from "next/image";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setOnboardingData } from "@/store/slices/onboardingSlice";
import type { OnboardingData } from "@/lib/api/authApi";
import axiosClient from "@/lib/axiosClient";
import { useAuthLoading } from "@/components/AuthProvider";
import type { DashboardResponse, Dose } from "@/components/dashboard";
import { UpcomingDosesSection } from "@/components/dashboard";

export default function Dashboard() {
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.auth.user);
    const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
    const isAuthLoading = useAuthLoading(); // true while session check is in flight

    // Keep a ref so fetchDoses can read the latest auth state
    // without being listed as a useCallback dependency.
    const isAuthenticatedRef = useRef(isAuthenticated);
    useEffect(() => {
        isAuthenticatedRef.current = isAuthenticated;
    }, [isAuthenticated]);

    const [showOnboarding, setShowOnboarding] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState<string>("");
    const [doses, setDoses] = useState<Dose[]>([]);
    const [loading, setLoading] = useState(false);

    // Format date to YYYY-MM-DD
    const formatDate = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Convert 24-hour time to 12-hour format
    const formatTime = (time: string): string => {
        const [hours, minutes] = time.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'pm' : 'am';
        const displayHour = hour % 12 || 12;
        return `${String(displayHour).padStart(2, '0')}:${minutes} ${ampm}`;
    };

    // Check if a time string is in the future (for today's date only)
    const isTimeFuture = (timeString: string, dateString: string): boolean => {
        const today = formatDate(new Date());

        // If the selected date is not today, show all doses
        if (dateString !== today) {
            return true;
        }

        // For today, check if time is in the future
        const now = new Date();
        const [hours, minutes] = timeString.split(':').map(Number);
        const doseTime = new Date();
        doseTime.setHours(hours, minutes, 0, 0);

        return doseTime > now;
    };

    // Transform API response to Dose array
    const transformApiResponse = useCallback((data: DashboardResponse): Dose[] => {
        const transformedDoses: Dose[] = [];

        data.doses.forEach((doseTime) => {
            // Only include doses that are in the future (for today)
            if (isTimeFuture(doseTime.time, data.selected_date)) {
                doseTime.reminders.forEach((reminder) => {
                    const medicineType = reminder.medicine_type.charAt(0).toUpperCase() + reminder.medicine_type.slice(1);
                    const instruction = `Take ${reminder.amount} ${medicineType}${parseFloat(reminder.amount) > 1 ? 's' : ''}`;

                    transformedDoses.push({
                        id: `${reminder.reminder_id}-${reminder.dose_number}-${doseTime.time}`,
                        name: reminder.medicine_name,
                        instruction: instruction,
                        time: formatTime(doseTime.time),
                        medicineType: reminder.medicine_type,
                        notificationMethods: reminder.notification_methods
                    });
                });
            }
        });

        return transformedDoses;
    }, []);

    // Fetch doses from API using axiosClient.
    // Uses isAuthenticatedRef so the function reference stays stable
    // and doesn't re-trigger every useEffect that depends on it.
    const fetchDoses = useCallback(async (dateString: string) => {
        if (!isAuthenticatedRef.current) {
            setDoses([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const response = await axiosClient.get('/reminders/dashboard/', {
                params: { date: dateString }
            });

            const data: DashboardResponse = response.data.data;
            const transformedDoses = transformApiResponse(data);
            setDoses(transformedDoses);
        } catch (error) {
            console.error('Error fetching doses:', error);
            setDoses([]);
        } finally {
            setLoading(false);
        }
    }, [transformApiResponse]); // stable — no isAuthenticated dep

    // Re-fetch when the selected date changes (user taps a date on the strip).
    useEffect(() => {
        if (selectedDate) {
            fetchDoses(selectedDate);
        }
    }, [selectedDate]); // fetchDoses is now stable, safe to omit

    // Re-fetch when auth state changes (login / logout).
    // Kept separate so it fires exactly once on auth change,
    // without interfering with the date-change effect above.
    useEffect(() => {
        if (selectedDate) {
            fetchDoses(selectedDate);
        }
    }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

    // Handle date selection from DateStrip - using useCallback to prevent infinite loop
    const handleDateChange = useCallback((date: Date) => {
        const dateString = formatDate(date);
        setSelectedDate(dateString);
    }, []);

    // Initialize with today's date
    useEffect(() => {
        const today = formatDate(new Date());
        setSelectedDate(today);
    }, []);

    // Auto-refresh doses every minute to hide past reminders without page refresh.
    // fetchDoses is now stable, so this effect only re-runs when selectedDate
    // or isAuthenticated genuinely change — not on every render.
    useEffect(() => {
        if (!selectedDate || !isAuthenticated) return;

        const today = formatDate(new Date());
        // Only set up auto-refresh for today's date
        if (selectedDate !== today) return;

        const interval = setInterval(() => {
            fetchDoses(selectedDate);
        }, 60000); // Check every minute

        return () => clearInterval(interval);
    }, [selectedDate, isAuthenticated]); // fetchDoses is stable, safe to omit

    useEffect(() => {
        // Wait until AuthProvider has finished verifying the session.
        // Without this guard a new visitor briefly has isAuthenticated=false
        // while the /me request is still in-flight, which incorrectly
        // triggers the onboarding dialog and causes the reload loop.
        if (isAuthLoading) return;

        if (!isAuthenticated) {
            const isGuestOnboardingCompleted = localStorage.getItem('guest_onboarding_completed');
            if (!isGuestOnboardingCompleted) {
                setShowOnboarding(true);
            }
        }
    }, [isAuthenticated, isAuthLoading]);

    const handleOnboardingComplete = (data: OnboardingData) => {
        dispatch(setOnboardingData(data));
        localStorage.setItem('guest_onboarding_completed', 'true');
        setShowOnboarding(false);
    };

    const handleLoginClick = () => {
        setShowAuthModal(true);
    };

    const handleAuthClose = () => {
        setShowAuthModal(false);
    };

    return (
        <div className="min-h-0">
            <main className="pb-4">
                <DateStrip onDateChange={handleDateChange} />
            </main>
            <div className="flex flex-col md:grid md:grid-cols-2 gap-4 px-2 sm:px-4">
                {/* Left Side */}
                <UpcomingDosesSection
                    doses={doses}
                    loading={loading}
                    selectedDate={selectedDate}
                    isAuthenticated={isAuthenticated}
                    onLoginClick={handleLoginClick}
                />

                {/* Right Side */}
                <div className="grid grid-cols-2 grid-rows-2 gap-2 sm:gap-4">
                    <div className="rounded-lg bg-white flex items-center justify-center shadow-lg">
                        Right 1
                    </div>
                    <div className="rounded-lg bg-white flex items-center justify-center shadow-lg">
                        Right 2
                    </div>
                    <div className="rounded-lg bg-white flex items-center justify-center shadow-lg">
                        Right 3
                    </div>
                    <div className="relative rounded-2xl bg-white shadow-lg overflow-hidden p-6 flex flex-col justify-between">
                        {/* Bulb */}
                        <Image
                            src="/bulb.svg"
                            alt="Tip"
                            width={42}
                            height={42}
                            className="absolute top-4 right-2"
                        />

                        {/* Content */}
                        <div className="relative z-10">
                            <h3
                                className="text-2xl text-blue-600 mb-2"
                                style={{ fontFamily: "Caveat, cursive" }}
                            >
                                Health Tip of the Day
                            </h3>

                            <Image
                                src="/underline.svg"
                                alt=""
                                width={140}
                                height={10}
                                className="-mt-2 mb-2"
                            />

                            <p className="text-sm text-gray-800 leading-relaxed max-w-[90%] font-semibold">
                                Don't skip doses even if you feel better—finish the course.
                            </p>
                        </div>

                        {/* Wave */}
                        <div className="absolute -bottom-7 left-0 w-full h-[65%]">
                            <Image
                                src="/bottom-wave.svg"
                                alt=""
                                fill
                                className="object-cover object-bottom pointer-events-none"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Onboarding Dialog */}
            <OnboardingDialog
                open={showOnboarding}
                onOpenChange={setShowOnboarding}
                onComplete={handleOnboardingComplete}
            />

            {/* Auth Modal */}
            <AuthComponent
                isOpen={showAuthModal}
                onClose={handleAuthClose}
            />
        </div>
    );
}