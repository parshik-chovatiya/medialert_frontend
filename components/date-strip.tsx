"use client"

import { useRef, useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

function generateDates(days = 30) {
  const today = new Date()

  return Array.from({ length: days }, (_, i) => {
    const d = new Date()
    d.setDate(today.getDate() + i)

    return {
      id: d.toDateString(),
      day: d.toLocaleDateString("en-US", { weekday: "short" }),
      date: d.getDate(),
      fullDate: d,
      isToday: i === 0,
    }
  })
}

interface DateStripProps {
  onDateChange?: (date: Date) => void;
}

export default function DateStrip({ onDateChange }: DateStripProps) {
  const dates = generateDates(15)
  const todayId = dates.find((d) => d.isToday)?.id
  const [selected, setSelected] = useState(todayId)
  const containerRef = useRef<HTMLDivElement>(null)

  // Scroll selected into view
  useEffect(() => {
    const el = containerRef.current?.querySelector(
      `[data-id="${selected}"]`
    )
    el?.scrollIntoView({ behavior: "smooth", inline: "center" })
  }, [selected])

  // Notify parent when date changes - only call once on mount and when selection changes
  useEffect(() => {
    const selectedDate = dates.find((d) => d.id === selected)
    if (selectedDate && onDateChange) {
      onDateChange(selectedDate.fullDate)
    }
  }, [selected]) // Removed dates and onDateChange from dependencies to prevent infinite loop

  const scroll = (dir: "left" | "right") => {
    if (!containerRef.current) return
    containerRef.current.scrollBy({
      left: dir === "left" ? -160 : 160,
      behavior: "smooth",
    })
  }

  return (
    <div className="relative w-full">
      {/* Floating Left Arrow */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-2 shadow-md hover:bg-muted"
      >
        <ChevronLeft className="h-4 w-4 text-primary" />
      </button>

      {/* Dates */}
      <div
        ref={containerRef}
        className="flex gap-4 overflow-hidden px-12 pb-4"
      >
        {dates.map((item) => {
          const isActive = selected === item.id

          return (
            <button
              key={item.id}
              data-id={item.id}
              onClick={() => setSelected(item.id)}
              className={cn(
                "group shadow-lg gap-2 flex h-30 w-22 shrink-0 flex-col items-center justify-center rounded-full border text-sm transition-all duration-200 cursor-pointer",
                isActive
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border rounded-full hover:text-primary bg-white"
              )}
            >
              <span className="text-3xl font-semibold">{item.date}</span>
              <span className="text-xs">{item.day}</span>
            </button>
          )
        })}
      </div>

      {/* Floating Right Arrow */}
      <button
        onClick={() => scroll("right")}
        className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white p-2 shadow-md hover:bg-muted"
      >
        <ChevronRight className="h-4 w-4 text-primary"/>
      </button>
    </div>
  )
}