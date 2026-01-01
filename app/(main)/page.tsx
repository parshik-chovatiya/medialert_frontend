"use client";
import DateStrip from "@/components/date-strip";
import OnboardingDialog from "@/components/onboarding/OnboardingDialog";
import Image from "next/image";
import { use, useState } from "react";
interface Dose {
    id: number;
    name: string;
    instruction: string;
    time: string;
}

const upcomingDoses: Dose[] = [
    { id: 1, name: "Multivitamin", instruction: "Take 1 pill after eat", time: "09:00 am" },
    { id: 2, name: "Vitamin D", instruction: "Take 1 pill before eat", time: "08:00 am" },
    { id: 3, name: "Pain Relief", instruction: "Take 1 pill after eat", time: "12:00 pm" },
    { id: 4, name: "Calcium", instruction: "Take 1 pill after eat", time: "07:00 pm" },
    { id: 5, name: "Omega-3", instruction: "Take 2 pills after eat", time: "09:00 am" },
    { id: 6, name: "Vitamin C", instruction: "Take 1 pill before eat", time: "08:30 am" },
    { id: 7, name: "Magnesium", instruction: "Take 1 pill after eat", time: "10:00 pm" },
    { id: 8, name: "Zinc", instruction: "Take 1 pill after eat", time: "09:00 am" }
];

const PillIcon: React.FC = () => (
    <svg className="w-10 h-10 text-primary" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M4.22,11.29L11.29,4.22C13.64,1.88 17.43,1.88 19.78,4.22C22.12,6.56 22.12,10.36 19.78,12.71L12.71,19.78C10.36,22.12 6.56,22.12 4.22,19.78C1.88,17.43 1.88,13.64 4.22,11.29M5.64,12.71C4.59,13.75 4.24,15.24 4.6,16.57L10.59,10.59L14.83,14.83L18.36,11.29C19.93,9.73 19.93,7.2 18.36,5.64C16.8,4.07 14.27,4.07 12.71,5.64L5.64,12.71Z" />
    </svg>
);
const ClockIcon: React.FC = () => (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" />
    </svg>
);

interface DoseCardProps {
    dose: Dose;
}

const DoseCard: React.FC<DoseCardProps> = ({ dose }) => {
    return (
        <div className="flex items-center gap-4 py-2 pr-4 pl-2 border rounded-full">
            <div className="shrink-0 w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <PillIcon />
            </div>
            <div className="flex flex-1 items-center justify-between min-w-0">
                <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-1">{dose.instruction}</p>
                    <h3 className="text-base font-bold text-foreground">{dose.name}</h3>
                </div>
                <div className="shrink-0 ml-4">
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <ClockIcon />
                        {dose.time}
                    </p>
                </div>
            </div>
        </div>
    );
};

const UpcomingDosesSection: React.FC = () => {
    return (
        <div className="rounded-lg bg-white p-6 overflow-hidden flex flex-col shadow-lg">
            <h2 className="text-2xl font-bold mb-2">Upcoming Doses</h2>
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar]:h-4 [&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-thumb]:rounded-full">
                {upcomingDoses.map((dose) => (
                    <DoseCard key={dose.id} dose={dose} />
                ))}
            </div>
        </div>
    );
};

export default function Dashboard() {
    const [open, setOpen] = useState(true);
    return (
        <div className="h-[calc(100vh-10rem)]">
            <main className="pb-4">
                <DateStrip />
            </main>
            <div className="grid h-84 grid-cols-2 gap-4 px-4">
                {/* Left Side */}
                <UpcomingDosesSection />

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
                            className="absolute top-4   right-2"
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
                                Don’t skip doses even if you feel better—finish the course.
                            </p>
                        </div>

                        {/* Bigger wave */}
                        <div className="absolute -bottom-7 left-0  w-full h-[65%]">
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
            <OnboardingDialog open={open} onOpenChange={setOpen} onComplete={(data) => console.log(data)}/>
        </div>
    );
}