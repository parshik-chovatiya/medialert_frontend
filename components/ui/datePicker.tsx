"use client"

import * as React from "react"
import { ChevronDownIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"

type DatePickerProps = {
  label?: string
  value?: Date
  onChange: (date?: Date) => void
  minDate?: Date
}

export function DatePicker({
  label,
  value,
  onChange,
  minDate,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <div className="flex flex-col gap-2">
      {label && <Label className="text-sm font-medium">{label}</Label>}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="h-9 w-full justify-between font-normal"
          >
            {value ? value.toLocaleDateString() : "Select date"}
            <ChevronDownIcon className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={(date) => {
              onChange(date)
              setOpen(false)
            }}
            disabled={(date) => {
              if (minDate) {
                // Reset time to start of day for accurate comparison
                const today = new Date(minDate)
                today.setHours(0, 0, 0, 0)
                
                // Calculate max date (31 days from minDate)
                const maxDate = new Date(minDate)
                maxDate.setDate(maxDate.getDate() + 31)
                maxDate.setHours(0, 0, 0, 0)
                
                const checkDate = new Date(date)
                checkDate.setHours(0, 0, 0, 0)
                
                // Disable if before minDate or after maxDate
                return checkDate < today || checkDate > maxDate
              }
              return false
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}