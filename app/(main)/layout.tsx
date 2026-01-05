//app/(main)/layout.tsx
'use client'

import { Header } from '@/components/Header'
import { Sidebar } from '@/components/Sidebar'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
      <div className="min-h-screen bg-primary/10">
        <Header />

        <div className="flex pt-20 max-w-7xl mx-auto px-3">
          <Sidebar />

          <main className="flex-1 h-[calc(100vh-5rem)] overflow-y-auto pl-8">
            <div className="py-5">
              {children}
            </div>
          </main>
        </div>
      </div>
  )
}