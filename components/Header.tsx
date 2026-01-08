import Image from 'next/image'
import logo from '../public/logo.png'
import { Bell, Plus } from 'lucide-react'
import Link from 'next/link'
import { useAppSelector } from "@/store/hooks"

export function Header() {
    // Get user data from Redux store
    const user = useAppSelector((state) => state.auth.user);
    const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

    // Get onboarding data from Redux store
    const onboardingData = useAppSelector((state) => state.onboarding.data);

    // Determine display name
    const displayName = isAuthenticated && user
        ? user.name
        : onboardingData?.name || 'Guest';

    const greeting = `Hello, ${displayName}!`;
    const subtext = isAuthenticated && user
        ? 'Manage your reminders'
        : 'Explore your reminders';

    return (
        <header className="fixed top-0 left-0 right-0 h-20 flex items-center z-50">
            <div className='max-w-7xl mx-auto w-full flex items-center justify-between pl-3 pr-3'>
                {/* LEFT */}
                <div className="flex items-center gap-0">
                    <div className="w-23 flex justify-center">
                        <div className="w-11 h-11">
                            <Image src={logo} alt="Logo" className="object-contain" />
                        </div>
                    </div>
                    <div>
                        <p className="text-lg font-semibold">{greeting}</p>
                        <p className="text-sm opacity-70">{subtext}</p>
                    </div>
                </div>

                {/* RIGHT */}
                <div className="flex items-center gap-3 ">
                    <HeaderIcon>
                        <Link href='/reminder'><Plus className="w-5 h-5" /></Link>
                    </HeaderIcon>

                    <HeaderIcon>
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
                    </HeaderIcon>
                </div>
            </div>
        </header>
    )
}

function HeaderIcon({ children }: { children: React.ReactNode }) {
    return (
        <button className="relative w-10 h-10 rounded-full border flex items-center justify-center hover:cursor-pointer transition bg-white"    >
            {children}
        </button>
    )
}