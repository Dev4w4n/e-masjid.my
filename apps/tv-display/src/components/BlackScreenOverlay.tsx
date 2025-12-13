/**
 * Black Screen Overlay Component
 * 
 * Displays a black screen during scheduled periods (e.g., Friday prayers).
 * Shows optional clock and message when configured.
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { DayOfWeek, BlackScreenScheduleType } from '@masjid-suite/shared-types';

export interface BlackScreenConfig {
  enabled: boolean;
  scheduleType: BlackScreenScheduleType;
  startTime: string | null; // HH:MM format
  endTime: string | null; // HH:MM format
  days: DayOfWeek[];
  message: string | null;
  showClock: boolean;
}

export interface BlackScreenOverlayProps {
  config: BlackScreenConfig;
  className?: string;
}

/**
 * Parses a time string (HH:MM) and returns minutes since midnight
 */
function parseTimeToMinutes(time: string): number {
  const parts = time.split(':').map(Number);
  const hours = parts[0] ?? 0;
  const minutes = parts[1] ?? 0;
  return hours * 60 + minutes;
}

/**
 * Gets the current time in minutes since midnight
 */
function getCurrentTimeMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

/**
 * Gets the current day of week (0 = Sunday, 6 = Saturday)
 */
function getCurrentDayOfWeek(): DayOfWeek {
  return new Date().getDay() as DayOfWeek;
}

/**
 * Checks if the current time is within the black screen schedule
 */
export function isBlackScreenActive(config: BlackScreenConfig): boolean {
  if (!config.enabled || !config.startTime || !config.endTime) {
    return false;
  }

  const currentDay = getCurrentDayOfWeek();
  const currentMinutes = getCurrentTimeMinutes();
  const startMinutes = parseTimeToMinutes(config.startTime);
  const endMinutes = parseTimeToMinutes(config.endTime);

  // For weekly schedule, check if today is a scheduled day
  if (config.scheduleType === 'weekly') {
    if (!config.days.includes(currentDay)) {
      // Special case: overnight schedule might span from yesterday
      // Check if yesterday was a scheduled day and we're still in the overnight period
      const yesterdayDay = ((currentDay - 1 + 7) % 7) as DayOfWeek;
      if (startMinutes > endMinutes && config.days.includes(yesterdayDay)) {
        // Overnight schedule - check if we're before the end time
        return currentMinutes < endMinutes;
      }
      return false;
    }
  }

  // Handle overnight schedules (e.g., 22:00 to 06:00)
  if (startMinutes > endMinutes) {
    // Schedule spans midnight
    return currentMinutes >= startMinutes || currentMinutes < endMinutes;
  }

  // Normal schedule (same day)
  return currentMinutes >= startMinutes && currentMinutes < endMinutes;
}

/**
 * Calculates time remaining until black screen ends
 */
export function getTimeRemaining(config: BlackScreenConfig): {
  hours: number;
  minutes: number;
  seconds: number;
} | null {
  if (!config.enabled || !config.endTime) {
    return null;
  }

  const now = new Date();
  const currentMinutes = getCurrentTimeMinutes();
  const endMinutes = parseTimeToMinutes(config.endTime);
  const startMinutes = config.startTime ? parseTimeToMinutes(config.startTime) : 0;

  let remainingMinutes: number;

  if (startMinutes > endMinutes) {
    // Overnight schedule
    if (currentMinutes >= startMinutes) {
      // Before midnight
      remainingMinutes = (24 * 60 - currentMinutes) + endMinutes;
    } else {
      // After midnight
      remainingMinutes = endMinutes - currentMinutes;
    }
  } else {
    remainingMinutes = endMinutes - currentMinutes;
  }

  if (remainingMinutes < 0) {
    return null;
  }

  const hours = Math.floor(remainingMinutes / 60);
  const minutes = remainingMinutes % 60;
  const seconds = 60 - now.getSeconds();

  return { hours, minutes, seconds };
}

export const BlackScreenOverlay: React.FC<BlackScreenOverlayProps> = ({
  config,
  className = '',
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isActive, setIsActive] = useState(false);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      setIsActive(isBlackScreenActive(config));
    }, 1000);

    // Initial check
    setIsActive(isBlackScreenActive(config));

    return () => clearInterval(timer);
  }, [config]);

  // Format time display
  const formattedTime = useMemo(() => {
    return currentTime.toLocaleTimeString('ms-MY', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  }, [currentTime]);

  // Format date display
  const formattedDate = useMemo(() => {
    return currentTime.toLocaleDateString('ms-MY', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [currentTime]);

  // Get remaining time
  const remaining = useMemo(() => {
    return getTimeRemaining(config);
  }, [config, currentTime]);

  // Don't render if not active
  if (!isActive) {
    return null;
  }

  return (
    <div
      className={`
        fixed inset-0 z-[100] 
        bg-black 
        flex flex-col items-center justify-center 
        transition-opacity duration-1000
        ${className}
      `}
      role="dialog"
      aria-label="Black screen mode active"
    >
      {/* Clock */}
      {config.showClock && (
        <div className="text-center mb-8">
          <div 
            className="text-8xl md:text-9xl font-mono font-bold text-white tracking-wider"
            style={{ fontVariantNumeric: 'tabular-nums' }}
          >
            {formattedTime}
          </div>
          <div className="text-2xl md:text-3xl text-gray-400 mt-4">
            {formattedDate}
          </div>
        </div>
      )}

      {/* Custom message */}
      {config.message && (
        <div className="text-center px-8">
          <p className="text-3xl md:text-4xl text-white font-light max-w-4xl">
            {config.message}
          </p>
        </div>
      )}

      {/* Time remaining indicator (subtle) */}
      {remaining && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="text-gray-600 text-sm">
            {remaining.hours > 0 && `${remaining.hours}j `}
            {remaining.minutes}m lagi
          </div>
        </div>
      )}

      {/* Subtle branding */}
      <div className="absolute bottom-4 right-4 text-gray-800 text-xs">
        Open E Masjid
      </div>
    </div>
  );
};

export default BlackScreenOverlay;
