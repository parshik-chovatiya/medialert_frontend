"use client";

import { useEffect, useState, useCallback } from "react";
import DateStrip from "@/components/date-strip";
import OnboardingDialog from "@/components/onboarding/OnboardingDialog";
import AuthComponent from "@/components/AuthComponent";
import Image from "next/image";
import Link from "next/link";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { setOnboardingData } from "@/store/slices/onboardingSlice";
import type { OnboardingData } from "@/lib/api/authApi";
import axiosClient from "@/lib/axiosClient";
import { Button } from "@/components/ui/button";

interface Reminder {
    reminder_id: number;
    medicine_name: string;
    medicine_type: string;
    amount: string;
    dose_number: number;
    notification_methods: string[];
    quantity_remaining: string;
    is_active: boolean;
}

interface DoseTime {
    time: string;
    reminders: Reminder[];
}

interface DashboardResponse {
    selected_date: string;
    day_name: string;
    total_doses: number;
    total_reminders: number;
    doses: DoseTime[];
    date_range: {
        min_date: string;
        max_date: string;
        available_dates: string[];
    };
}

interface Dose {
    id: string;
    name: string;
    instruction: string;
    time: string;
    medicineType: string;
    notificationMethods: string[];
}

const TabletIcon: React.FC = () => (
    <svg className="w-10 h-10 text-primary" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M4.22,11.29L11.29,4.22C13.64,1.88 17.43,1.88 19.78,4.22C22.12,6.56 22.12,10.36 19.78,12.71L12.71,19.78C10.36,22.12 6.56,22.12 4.22,19.78C1.88,17.43 1.88,13.64 4.22,11.29M5.64,12.71C4.59,13.75 4.24,15.24 4.6,16.57L10.59,10.59L14.83,14.83L18.36,11.29C19.93,9.73 19.93,7.2 18.36,5.64C16.8,4.07 14.27,4.07 12.71,5.64L5.64,12.71Z" />
    </svg>
);

const CapsuleIcon: React.FC = () => (
    <svg className="w-10 h-10 text-primary" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M4.22,11.29L11.29,4.22C13.64,1.88 17.43,1.88 19.78,4.22C22.12,6.56 22.12,10.36 19.78,12.71L12.71,19.78C10.36,22.12 6.56,22.12 4.22,19.78C1.88,17.43 1.88,13.64 4.22,11.29M5.64,12.71C4.59,13.75 4.24,15.24 4.6,16.57L10.59,10.59L14.83,14.83L18.36,11.29C19.93,9.73 19.93,7.2 18.36,5.64C16.8,4.07 14.27,4.07 12.71,5.64L5.64,12.71Z M9,7L7,9L11,13L17,7L15,5L11,9L9,7Z" />
    </svg>
);

const InjectionIcon: React.FC = () => (
    <svg className="w-10 h-10 text-primary" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M14.84,16.26L17.26,13.84L16.07,12.65L14.66,14.06L13.54,12.94L14.96,11.53L13.77,10.34L12.35,11.76L11.23,10.64L12.65,9.23L11.46,8.04L9.04,10.46L7.63,9.04L8.34,8.34L7.28,7.28L5.57,9L4.5,7.92L3.79,8.63L5.57,10.41L2.81,13.17C1.97,14 1.97,15.35 2.81,16.19L4.41,17.79L7.58,21L9.19,22.6C10.03,23.44 11.38,23.44 12.22,22.6L14.97,19.84L16.75,21.62L17.46,20.91L16.39,19.84L18.1,18.13L17.04,17.07L16.34,17.78L14.84,16.26M11.16,21.54C10.78,21.92 10.16,21.92 9.77,21.54L4.46,16.23C4.08,15.84 4.08,15.22 4.46,14.84L7.22,12.08L11.92,16.78L11.16,21.54M13.36,15.32L8.66,10.62L9.85,9.43L14.55,14.13L13.36,15.32M21.11,2.86L19.68,1.44L17.91,3.22L16.8,2.1L16.09,2.81L19.28,6L20,5.28L18.87,4.16L21.11,2.86Z" />
    </svg>
);

const SyrupIcon: React.FC = () => (
    <svg className="w-10 h-10 text-primary" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M6,2V4H7V5H6C4.89,5 4,5.89 4,7V20C4,21.11 4.89,22 6,22H11C12.11,22 13,21.11 13,20V7C13,5.89 12.11,5 11,5H10V4H11V2H6M8,6H9V7H8V6M6,9H11V14H6V9Z" />
    </svg>
);

const ClockIcon: React.FC = () => (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
    </svg>
);

const EmailIcon: React.FC = () => (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
    </svg>
);

const SmsIcon: React.FC = () => (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 11H7V9h2v2zm4 0h-2V9h2v2zm4 0h-2V9h2v2z"/>
    </svg>
);

const DesktopIcon: React.FC = () => (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M21 2H3c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h7v2H8v2h8v-2h-2v-2h7c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H3V4h18v12z"/>
    </svg>
);

interface DoseCardProps {
    dose: Dose;
    medicineType: string;
    notificationMethods: string[];
}

const DoseCard: React.FC<DoseCardProps> = ({ dose, medicineType, notificationMethods }) => {
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

interface UpcomingDosesSectionProps {
    doses: Dose[];
    loading: boolean;
    selectedDate: string;
    isAuthenticated: boolean;
    onLoginClick: () => void;
}

const UpcomingDosesSection: React.FC<UpcomingDosesSectionProps> = ({ 
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

export default function Dashboard() {
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.auth.user);
    const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
    
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

    // Fetch doses from API using axiosClient
    const fetchDoses = useCallback(async (dateString: string) => {
        if (!isAuthenticated) {
            setDoses([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const response = await axiosClient.get('/reminders/dashboard/', {
                params: { date: dateString }
            });
            
            // ✅ Fix: Access data from response.data.data
            const data: DashboardResponse = response.data.data;
            const transformedDoses = transformApiResponse(data);
            setDoses(transformedDoses);
        } catch (error) {
            console.error('Error fetching doses:', error);
            setDoses([]);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, transformApiResponse]);

    // Fetch doses when selected date changes
    useEffect(() => {
        if (selectedDate) {
            fetchDoses(selectedDate);
        }
    }, [selectedDate, fetchDoses]);

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

    // Auto-refresh doses every minute to hide past reminders without page refresh
    useEffect(() => {
        if (!selectedDate || !isAuthenticated) return;
        
        const today = formatDate(new Date());
        // Only set up auto-refresh for today's date
        if (selectedDate !== today) return;
        
        const interval = setInterval(() => {
            // Re-fetch data to filter out past reminders
            fetchDoses(selectedDate);
        }, 60000); // Check every minute
        
        return () => clearInterval(interval);
    }, [selectedDate, fetchDoses, isAuthenticated]);

    // ✅ Fix: Onboarding popup logic
    useEffect(() => {
        // Only check for guest onboarding if not authenticated
        if (!isAuthenticated) {
            const isGuestOnboardingCompleted = localStorage.getItem('guest_onboarding_completed');
            
            if (!isGuestOnboardingCompleted) {
                setShowOnboarding(true);
            }
        }
    }, [isAuthenticated]);

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
        <div className="h-[calc(100vh-10rem)]">
            <main className="pb-4">
                <DateStrip onDateChange={handleDateChange} />
            </main>
            <div className="grid h-84 grid-cols-2 gap-4 px-4">
                {/* Left Side */}
                <UpcomingDosesSection 
                    doses={doses} 
                    loading={loading} 
                    selectedDate={selectedDate}
                    isAuthenticated={isAuthenticated}
                    onLoginClick={handleLoginClick}
                />

                {/* Right Side */}
                <div className="grid grid-cols-2 grid-rows-2 gap-4">
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