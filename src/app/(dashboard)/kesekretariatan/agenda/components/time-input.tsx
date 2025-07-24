"use client";

import * as React from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface TimeInputProps {
  time: string;
  onChange: (time: string) => void;
  className?: string;
}

export function TimeInput({ time, onChange, className }: TimeInputProps) {
  const [hours, setHours] = React.useState(() => {
    if (!time) return "";
    const [hrs] = time.split(":");
    return hrs || "";
  });

  const [minutes, setMinutes] = React.useState(() => {
    if (!time) return "";
    const parts = time.split(":");
    return parts.length > 1 ? parts[1] : "";
  });

  // Update local state when prop changes
  React.useEffect(() => {
    if (time) {
      const parts = time.split(":");
      if (parts.length === 2) {
        setHours(parts[0]);
        setMinutes(parts[1]);
      }
    }
  }, [time]);

  // Only call parent onChange when we have valid values
  const updateParentTime = React.useCallback(() => {
    if (hours !== "" && minutes !== "") {
      const formattedHours = hours.padStart(2, "0");
      const formattedMinutes = minutes.padStart(2, "0");
      const newTime = `${formattedHours}:${formattedMinutes}`;
      
      // Only update if the time actually changed
      if (newTime !== time) {
        onChange(newTime);
      }
    }
  }, [hours, minutes, time, onChange]);

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and limit to 2 digits
    if (/^\d*$/.test(value) && value.length <= 2) {
      const numValue = parseInt(value || "0", 10);
      // Hours should be between 0 and 23
      if (numValue >= 0 && numValue <= 23) {
        setHours(value);
      }
    }
  };

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and limit to 2 digits
    if (/^\d*$/.test(value) && value.length <= 2) {
      const numValue = parseInt(value || "0", 10);
      // Minutes should be between 0 and 59
      if (numValue >= 0 && numValue <= 59) {
        setMinutes(value);
      }
    }
  };

  // Formatter for display
  const getDisplayTime = () => {
    if (!hours && !minutes) return "";
    
    const h = hours ? hours.padStart(2, "0") : "00";
    const m = minutes ? minutes.padStart(2, "0") : "00";
    
    return `${h}:${m}`;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !time && "text-muted-foreground",
            className
          )}
        >
          <Clock className="mr-2 h-4 w-4" />
          {getDisplayTime() ? (
            <span>{getDisplayTime()}</span>
          ) : (
            <span>Pilih waktu</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4" align="start">
        <div className="flex flex-col space-y-2">
          <Label htmlFor="time-hours">Waktu</Label>
          <div className="flex items-center space-x-2">
            <div className="grid gap-1">
              <Label htmlFor="hours" className="text-xs">Jam</Label>
              <Input
                id="hours"
                className="w-16 text-center"
                value={hours}
                onChange={handleHoursChange}
                onBlur={updateParentTime}
                placeholder="00"
                maxLength={2}
              />
            </div>
            <span className="text-xl">:</span>
            <div className="grid gap-1">
              <Label htmlFor="minutes" className="text-xs">Menit</Label>
              <Input
                id="minutes"
                className="w-16 text-center"
                value={minutes}
                onChange={handleMinutesChange}
                onBlur={updateParentTime}
                placeholder="00"
                maxLength={2}
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Button 
              type="button" 
              variant="secondary" 
              size="sm"
              onClick={() => {
                // Set current time
                const now = new Date();
                const newHours = now.getHours().toString();
                const newMinutes = now.getMinutes().toString();
                setHours(newHours);
                setMinutes(newMinutes);
                
                // Immediately update parent after setting state
                const formattedHours = newHours.padStart(2, "0");
                const formattedMinutes = newMinutes.padStart(2, "0");
                onChange(`${formattedHours}:${formattedMinutes}`);
              }}
            >
              Waktu Sekarang
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
} 