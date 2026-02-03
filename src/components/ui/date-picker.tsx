import { useState, useRef, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import { format, parse, isValid } from "date-fns";
import { zhCN } from "date-fns/locale";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import "react-day-picker/style.css";

interface DatePickerProps {
  value?: string; // ISO date string (YYYY-MM-DD)
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  error?: boolean;
  maxDate?: Date; // 最大可选日期
  minDate?: Date; // 最小可选日期
}

export function DatePicker({ 
  value, 
  onChange, 
  placeholder = "选择日期",
  className,
  error,
  maxDate,
  minDate,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<Date | undefined>(() => {
    if (value) {
      const date = parse(value, "yyyy-MM-dd", new Date());
      return isValid(date) ? date : undefined;
    }
    return undefined;
  });
  const containerRef = useRef<HTMLDivElement>(null);

  // Update selected when value prop changes
  useEffect(() => {
    if (value) {
      const date = parse(value, "yyyy-MM-dd", new Date());
      if (isValid(date)) {
        setSelected(date);
      }
    } else {
      setSelected(undefined);
    }
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (date: Date | undefined) => {
    setSelected(date);
    if (date) {
      onChange?.(format(date, "yyyy-MM-dd"));
    } else {
      onChange?.("");
    }
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border bg-white px-3 py-2 text-sm shadow-sm transition-colors",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-400",
          error ? "border-red-500" : "border-slate-200 hover:border-slate-300",
          className
        )}
      >
        <span className={selected ? "text-slate-900" : "text-slate-400"}>
          {selected ? format(selected, "yyyy年MM月dd日", { locale: zhCN }) : placeholder}
        </span>
        <Calendar className="h-4 w-4 text-slate-400" />
      </button>

      {/* Calendar Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 rounded-lg border border-slate-200 bg-white p-3 shadow-lg">
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={handleSelect}
            locale={zhCN}
            showOutsideDays
            fixedWeeks
            captionLayout="dropdown"
            fromYear={2020}
            toYear={2030}
            disabled={[
              ...(maxDate ? [{ after: maxDate }] : []),
              ...(minDate ? [{ before: minDate }] : []),
            ]}
            classNames={{
              root: "rdp-custom",
              months: "flex flex-col",
              month: "space-y-2",
              month_caption: "flex justify-center items-center h-8",
              caption_label: "text-sm font-medium text-slate-900",
              nav: "flex items-center gap-1",
              button_previous: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 flex items-center justify-center rounded hover:bg-slate-100",
              button_next: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 flex items-center justify-center rounded hover:bg-slate-100",
              weekdays: "flex",
              weekday: "text-slate-500 w-8 font-normal text-xs text-center",
              week: "flex w-full mt-1",
              day: "h-8 w-8 text-center text-sm p-0 relative flex items-center justify-center rounded hover:bg-slate-100 focus:outline-none",
              day_button: "h-8 w-8 flex items-center justify-center rounded",
              selected: "bg-blue-600 text-white hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white",
              today: "bg-slate-100 font-semibold",
              outside: "text-slate-300 opacity-50",
              disabled: "text-slate-300 opacity-50 cursor-not-allowed hover:bg-transparent",
              hidden: "invisible",
              dropdowns: "flex gap-2",
              dropdown: "appearance-none bg-transparent font-medium text-sm focus:outline-none cursor-pointer",
            }}
          />
        </div>
      )}
    </div>
  );
}
