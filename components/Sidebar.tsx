'use client'

import { useState } from 'react'
import {
  LayoutDashboard,
  PillBottle,
  ClipboardList,
  Archive,
  LogOut,
  User,
  Ellipsis,
  X
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useAppDispatch } from "@/store/hooks"
import { clearUser } from "@/store/slices/authSlice"
import { clearOnboardingData } from "@/store/slices/onboardingSlice"
import { authApi } from "@/lib/api/authApi"
import { toast } from "sonner"

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const dispatch = useAppDispatch()

  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)

  const top = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
    { icon: PillBottle, label: 'Add Medicine Reminder', href: '/reminder' },
    { icon: ClipboardList, label: 'Medicine Reminder List', href: '/allreminder' },
    { icon: Archive, label: 'Inventory', href: '/inventory' },
  ]

  // Bottom nav items (shown in the mobile bottom bar)
  const bottomNavItems = [
    { icon: LayoutDashboard, label: 'Home', href: '/' },
    { icon: ClipboardList, label: 'Reminders', href: '/allreminder' },
    { icon: Archive, label: 'Inventory', href: '/inventory' },
  ]

  // Items inside the "More" menu
  const moreItems = [
    { icon: PillBottle, label: 'Add Reminder', href: '/reminder' },
    { icon: User, label: 'Profile', href: '/profile' },
  ]

  const bottom: { icon: any; label: string; href: string }[] = []

  const handleLogoutClick = () => {
    setShowLogoutDialog(true)
    setMoreOpen(false)
  }

  const handleLogoutConfirm = async () => {
    try {
      setLoggingOut(true)

      // Call logout API
      await authApi.logout()

      // Clear Redux state
      dispatch(clearUser())
      dispatch(clearOnboardingData())

      // Clear local storage flags
      localStorage.removeItem('onboarding_completed')
      localStorage.removeItem('guest_onboarding_completed')

      toast.success("Logged out successfully")

      // Close dialog
      setShowLogoutDialog(false)

      // Redirect to home page
      router.push("/")

    } catch (error) {
      console.error("Logout error:", error)
      toast.error("Failed to logout. Please try again.")
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <>
      <aside className="hidden lg:flex left-0 top-20 h-[calc(100vh-10rem)] flex-col items-center bg-white z-40 m-5 rounded-4xl px-2">
        {/* TOP */}
        <div className="flex flex-col gap-3 pt-2">
          {top.map(item => (
            <DesktopItem key={item.href} {...item} active={pathname === item.href} />
          ))}
        </div>

        <div className="flex-1" />

        {/* BOTTOM */}
        <div className="flex flex-col gap-3 ">
          {bottom.map(item => (
            <DesktopItem key={item.href} {...item} active={pathname === item.href} />
          ))}

          {/* Logout Button */}
          <button
            onClick={handleLogoutClick}
            className="group relative w-11 h-11 flex items-center justify-center rounded-xl transition"
          >
            <span className="absolute inset-0 rounded-4xl group-hover:bg-[#5669fe]/30" />
            <LogOut className="w-5 h-5 relative z-10" />

            {/* Tooltip */}
            <span className="absolute left-full ml-3 px-3 py-1.5 text-xs rounded-md bg-black text-white opacity-0 invisible group-hover:opacity-100 group-hover:visible whitespace-nowrap">
              Logout
            </span>
          </button>

          <div className="mt-4 mb-2">
            <DesktopItem
              icon={User}
              label="Profile"
              href="/profile"
              active={pathname === '/profile'}
            />
          </div>
        </div>
      </aside>

      {/* ===== MOBILE/TABLET BOTTOM NAV (below lg) ===== */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex lg:hidden justify-center pb-4 px-4 pointer-events-none">
        {/* More menu popover */}
        {moreOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40 pointer-events-auto"
              onClick={() => setMoreOpen(false)}
            />
            {/* Menu */}
            <div className="absolute bottom-[calc(100%+0.5rem)] right-6 z-50 bg-white rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.12)] border border-gray-100 p-2 min-w-[180px] pointer-events-auto animate-in fade-in slide-in-from-bottom-2 duration-200">
              {moreItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMoreOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${pathname === item.href
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              ))}
              <button
                onClick={handleLogoutClick}
                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-red-600 hover:bg-red-50 w-full"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </>
        )}

        {/* Bottom bar */}
        <div className="w-full max-w-md bg-white rounded-[2rem] shadow-[0_2px_20px_rgba(0,0,0,0.08)] border border-gray-100 flex items-center justify-around py-2 px-1 sm:px-2 pointer-events-auto">
          {bottomNavItems.map(item => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 flex-1 min-w-0 px-2 sm:px-4 py-2 rounded-full transition-all duration-200 ${isActive
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
                  }`}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                <span className="text-[10px] sm:text-[11px] font-medium leading-tight truncate">{item.label}</span>
              </Link>
            )
          })}

          {/* More button */}
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            className={`flex flex-col items-center gap-0.5 flex-1 min-w-0 px-2 sm:px-4 py-2 rounded-full transition-all duration-200 ${moreOpen
              ? 'bg-gray-900 text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-900'
              }`}
          >
            {moreOpen ? <X className="w-5 h-5 shrink-0" /> : <Ellipsis className="w-5 h-5 shrink-0" />}
            <span className="text-[10px] sm:text-[11px] font-medium leading-tight truncate">More</span>
          </button>
        </div>
      </nav>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>
            <AlertDialogDescription>
              You will be redirected to the home page and will need to login again to access your account.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loggingOut}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogoutConfirm}
              disabled={loggingOut}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loggingOut ? "Logging out..." : "Logout"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

/** Desktop sidebar item (unchanged from original) */
function DesktopItem({ icon: Icon, label, href, active }: any) {
  return (
    <Link
      href={href}
      className="group relative w-11 h-11 flex items-center justify-center rounded-xl transition"
    >
      <span
        className={`absolute inset-0 rounded-4xl ${active ? 'bg-[#5669fe]' : 'group-hover:bg-[#5669fe]/30'}`}
      />

      <Icon className={`w-5 h-5 relative z-10 ${active ? 'text-white' : ''}`} />

      {/* Tooltip */}
      <span className="absolute left-full ml-3 px-3 py-1.5 text-xs rounded-md bg-black text-white opacity-0 invisible group-hover:opacity-100 group-hover:visible whitespace-nowrap">
        {label}
      </span>
    </Link>
  )
}