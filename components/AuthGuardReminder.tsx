"use client";

import { useAppSelector } from "@/store/hooks";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const router = useRouter();

  const handleLoginClick = () => {
    router.push("/login");
  };

  return (
    <div >
      {/* Main Content - Blurred when not authenticated */}
      <div className={!isAuthenticated ? "blur-md pointer-events-none" : ""}>
        {children}
      </div>

      {/* Full Screen Login Overlay */}
      {!isAuthenticated && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center border border-gray-200">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Lock className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              You Are Not Logged In
            </h2>
            <p className="text-gray-600 mb-8 text-lg">
              Please log in to access this page and manage your reminders
            </p>
            <button
              onClick={handleLoginClick}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-4 px-6 rounded-xl transition duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              Login Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}