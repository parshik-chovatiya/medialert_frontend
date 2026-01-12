'use client'

import { useState } from 'react'
import {
  LayoutDashboard,
  PillBottle,
  TrendingUp,
  ClipboardList,
  Settings,
  LogOut,
  User
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

  const top = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
    { icon: PillBottle, label:'Add Medicine Reminder', href: '/reminder' },
    { icon: ClipboardList, label: 'Medicine Reminder List', href: '/allreminder' },
    { icon: TrendingUp, label: 'Progress', href: '/progress' },
  ]

  const bottom = [
    { icon: Settings, label: 'Settings', href: '/settings' },
  ]

  const handleLogoutClick = () => {
    setShowLogoutDialog(true)
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
      <aside className="left-0 top-20 h-[calc(100vh-10rem)] flex flex-col items-center bg-white z-40 m-5 rounded-4xl px-2">
        {/* TOP */}
        <div className="flex flex-col gap-3 pt-2">
          {top.map(item => (
            <Item key={item.href} {...item} active={pathname === item.href} />
          ))}
        </div>

        <div className="flex-1" />

        {/* BOTTOM */}
        <div className="flex flex-col gap-3 ">
          {bottom.map(item => (
            <Item key={item.href} {...item} active={pathname === item.href} />
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
            <Item
              icon={User}
              label="Profile"
              href="/profile"
              active={pathname === '/profile'}
            />
          </div>
        </div>
      </aside>

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

function Item({ icon: Icon, label, href, active }: any) {
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