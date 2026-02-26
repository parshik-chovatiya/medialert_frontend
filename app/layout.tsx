import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from "@/store/Provider";
import AuthProvider from "@/components/AuthProvider";
import { Toaster } from "@/components/ui/sonner";
import NotificationProvider from "@/components/NotificationProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MedAlert",
  description: "Medicine reminder application",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReduxProvider>
          <NotificationProvider>
            {/* <AuthProvider> */}
            {children}
            {/* </AuthProvider> */}
          </NotificationProvider>
          <Toaster />
        </ReduxProvider>
      </body>
    </html>
  );
}