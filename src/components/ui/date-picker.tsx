import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface DatePickerProps {
  value?: string
  onChange?: (date: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

// Parse YYYY-MM-DD string as local date to avoid timezone issues
const parseLocalDate = (dateString: string): Date | undefined => {
  if (!dateString) return undefined;
  const [year, month, day] = dateString.split('-').map(Number);
  if (!year || !month || !day) return undefined;
  // Create date in local timezone (month is 0-indexed)
  return new Date(year, month - 1, day);
};

// Format Date as YYYY-MM-DD in local timezone
const formatLocalDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export function DatePicker({ value, onChange, placeholder = "Pick a date", className, disabled = false }: DatePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(
    value ? parseLocalDate(value) : undefined
  )

  React.useEffect(() => {
    if (value) {
      setDate(parseLocalDate(value))
    } else {
      setDate(undefined)
    }
  }, [value])

  const handleSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate)
    if (selectedDate) {
      // Format as YYYY-MM-DD in local timezone
      const formatted = formatLocalDate(selectedDate)
      onChange?.(formatted)
    } else {
      onChange?.('')
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? formatDate(date) : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar selected={date} onSelect={handleSelect} />
      </PopoverContent>
    </Popover>
  )
}

function formatDate(date: Date): string {
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ]
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
}
