/**
 * PrayerTimesOverlay Component
 * 
 * Displays prayer times with configurable positioning, countdown timers,
 * current prayer highlighting, and responsive design for TV displays
 */

'use client';

import React, { useState, useEffect } from 'react';
import { PrayerTimes, PrayerTimeConfig } from '@masjid-suite/shared-types';
import ClientOnly from './ClientOnly';

type PrayerName = 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

interface PrayerTimesOverlayProps {
  prayerTimes: PrayerTimes;
  config: PrayerTimeConfig;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center' | 'hidden';
  fontSize?: 'small' | 'medium' | 'large' | 'extra_large';
  color?: string;
  backgroundOpacity?: number;
  className?: string;
}

interface PrayerTimeInfo {
  name: PrayerName;
  displayName: string;
  time: string;
  isCurrent: boolean;
  isNext: boolean;
  countdown?: {
    hours: number;
    minutes: number;
    seconds: number;
  };
}

interface CurrentTimeState {
  currentTime: Date;
  currentPrayer: PrayerName | null;
  nextPrayer: PrayerName | null;
  nextPrayerCountdown: {
    hours: number;
    minutes: number;
    seconds: number;
  } | null;
}

export function PrayerTimesOverlay({
  prayerTimes,
  config,
  position = 'top',
  fontSize = 'large',
  color = '#FFFFFF',
  backgroundOpacity = 0.8,
  className = ''
}: PrayerTimesOverlayProps) {
  // Initialize with stable values for SSR
  const [timeState, setTimeState] = useState<CurrentTimeState>({
    currentTime: new Date(0), // Use epoch time for SSR stability
    currentPrayer: null,
    nextPrayer: null,
    nextPrayerCountdown: null
  });

  // Don't show if position is hidden
  if (position === 'hidden') {
    return null;
  }

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeState(prev => ({
        ...prev,
        currentTime: new Date()
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Calculate prayer time info with current/next prayer detection
  useEffect(() => {
    const now = timeState.currentTime;
    const todayStr = now.toISOString().split('T')[0];
    
    // Only process if prayer times are for today
    if (prayerTimes.prayer_date !== todayStr) {
      return;
    }

    const prayers: Array<{ name: PrayerName; time: string }> = [
      { name: 'fajr', time: prayerTimes.fajr_time },
      { name: 'sunrise', time: prayerTimes.sunrise_time },
      { name: 'dhuhr', time: prayerTimes.dhuhr_time },
      { name: 'asr', time: prayerTimes.asr_time },
      { name: 'maghrib', time: prayerTimes.maghrib_time },
      { name: 'isha', time: prayerTimes.isha_time }
    ];

    // Convert prayer times to today's dates for comparison
    const prayerDates = prayers.map(prayer => {
      const [hours, minutes] = prayer.time.split(':').map(Number);
      const prayerDate = new Date(now);
      prayerDate.setHours(hours || 0, minutes || 0, 0, 0);
      
      // Apply manual adjustments if configured
      if (prayerTimes.manual_adjustments && prayerTimes.manual_adjustments[prayer.name]) {
        prayerDate.setMinutes(prayerDate.getMinutes() + (prayerTimes.manual_adjustments[prayer.name] || 0));
      }
      
      return { ...prayer, date: prayerDate };
    });

    // Find current and next prayer
    let currentPrayer: PrayerName | null = null;
    let nextPrayer: PrayerName | null = null;
    let nextPrayerDate: Date | null = null;

    // Check if we're currently between prayers
    for (let i = 0; i < prayerDates.length; i++) {
      const current = prayerDates[i];
      const next = prayerDates[i + 1];

      if (current && now >= current.date && (next ? now < next.date : true)) {
        currentPrayer = current.name;
        nextPrayer = next ? next.name : (prayerDates[0]?.name || 'fajr'); // Next day's Fajr
        nextPrayerDate = next ? next.date : (() => {
          // Calculate tomorrow's Fajr
          const firstPrayer = prayerDates[0];
          if (!firstPrayer) return new Date(now.getTime() + 24 * 60 * 60 * 1000); // Tomorrow
          const tomorrowFajr = new Date(firstPrayer.date);
          tomorrowFajr.setDate(tomorrowFajr.getDate() + 1);
          return tomorrowFajr;
        })();
        break;
      }
    }

    // If no current prayer found, we're before Fajr
    if (!currentPrayer) {
      nextPrayer = 'fajr';
      nextPrayerDate = prayerDates[0]?.date || new Date(now.getTime() + 60 * 60 * 1000); // Default to 1 hour from now
    }

    // Calculate countdown to next prayer
    let nextPrayerCountdown: CurrentTimeState['nextPrayerCountdown'] = null;
    if (nextPrayerDate) {
      const diffMs = nextPrayerDate.getTime() - now.getTime();
      if (diffMs > 0) {
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);
        nextPrayerCountdown = { hours, minutes, seconds };
      }
    }

    setTimeState(prev => ({
      ...prev,
      currentPrayer,
      nextPrayer,
      nextPrayerCountdown
    }));
  }, [timeState.currentTime, prayerTimes]);

  // Format prayer time with optional adjustments
  const formatPrayerTime = (timeStr: string, prayerName: PrayerName): string => {
    const timeParts = timeStr.split(':');
    if (timeParts.length !== 2 || !timeParts[0] || !timeParts[1]) {
      // Fallback for invalid time format
      return timeStr;
    }
    
    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);
    
    if (isNaN(hours) || isNaN(minutes)) {
      // Fallback for invalid numbers
      return timeStr;
    }
    
    let adjustedHours = hours;
    let adjustedMinutes = minutes;

    // Apply manual adjustments
    if (prayerTimes.manual_adjustments && prayerTimes.manual_adjustments[prayerName]) {
      const adjustment = prayerTimes.manual_adjustments[prayerName] || 0;
      adjustedMinutes += adjustment;
      
      // Handle minute overflow/underflow
      while (adjustedMinutes >= 60) {
        adjustedMinutes -= 60;
        adjustedHours += 1;
      }
      while (adjustedMinutes < 0) {
        adjustedMinutes += 60;
        adjustedHours -= 1;
      }
      
      // Handle hour overflow/underflow
      adjustedHours = ((adjustedHours % 24) + 24) % 24;
    }

    const displayHours = adjustedHours.toString().padStart(2, '0');
    const displayMinutes = adjustedMinutes.toString().padStart(2, '0');
    
    if (config.show_seconds) {
      return `${displayHours}:${displayMinutes}:00`;
    }
    return `${displayHours}:${displayMinutes}`;
  };

  // Get prayer display names
  const getPrayerDisplayName = (prayerName: PrayerName): string => {
    const names: Record<PrayerName, string> = {
      fajr: 'Fajr',
      sunrise: 'Sunrise',
      dhuhr: 'Dhuhr',
      asr: 'Asr',
      maghrib: 'Maghrib',
      isha: 'Isha'
    };
    return names[prayerName];
  };

  // Prepare prayer times info
  const prayerTimesInfo: PrayerTimeInfo[] = [
    {
      name: 'fajr',
      displayName: getPrayerDisplayName('fajr'),
      time: formatPrayerTime(prayerTimes.fajr_time, 'fajr'),
      isCurrent: timeState.currentPrayer === 'fajr',
      isNext: timeState.nextPrayer === 'fajr',
      ...(timeState.nextPrayer === 'fajr' && timeState.nextPrayerCountdown ? { countdown: timeState.nextPrayerCountdown } : {})
    },
    {
      name: 'dhuhr',
      displayName: getPrayerDisplayName('dhuhr'),
      time: formatPrayerTime(prayerTimes.dhuhr_time, 'dhuhr'),
      isCurrent: timeState.currentPrayer === 'dhuhr',
      isNext: timeState.nextPrayer === 'dhuhr',
      ...(timeState.nextPrayer === 'dhuhr' && timeState.nextPrayerCountdown ? { countdown: timeState.nextPrayerCountdown } : {})
    },
    {
      name: 'asr',
      displayName: getPrayerDisplayName('asr'),
      time: formatPrayerTime(prayerTimes.asr_time, 'asr'),
      isCurrent: timeState.currentPrayer === 'asr',
      isNext: timeState.nextPrayer === 'asr',
      ...(timeState.nextPrayer === 'asr' && timeState.nextPrayerCountdown ? { countdown: timeState.nextPrayerCountdown } : {})
    },
    {
      name: 'maghrib',
      displayName: getPrayerDisplayName('maghrib'),
      time: formatPrayerTime(prayerTimes.maghrib_time, 'maghrib'),
      isCurrent: timeState.currentPrayer === 'maghrib',
      isNext: timeState.nextPrayer === 'maghrib',
      ...(timeState.nextPrayer === 'maghrib' && timeState.nextPrayerCountdown ? { countdown: timeState.nextPrayerCountdown } : {})
    },
    {
      name: 'isha',
      displayName: getPrayerDisplayName('isha'),
      time: formatPrayerTime(prayerTimes.isha_time, 'isha'),
      isCurrent: timeState.currentPrayer === 'isha',
      isNext: timeState.nextPrayer === 'isha',
      ...(timeState.nextPrayer === 'isha' && timeState.nextPrayerCountdown ? { countdown: timeState.nextPrayerCountdown } : {})
    }
  ];

  // Position classes
  const positionClasses = {
    top: 'top-0 left-0 right-0 flex justify-center',
    bottom: 'bottom-0 left-0 right-0 flex justify-center',
    left: 'left-0 top-1/2 transform -translate-y-1/2 flex flex-col',
    right: 'right-0 top-1/2 transform -translate-y-1/2 flex flex-col',
    center: 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex justify-center'
  };

  // Font size classes
  const fontSizeClasses = {
    small: 'text-sm',
    medium: 'text-lg',
    large: 'text-2xl',
    extra_large: 'text-4xl'
  };

  // Layout classes based on position
  const isVertical = position === 'left' || position === 'right';
  const layoutClasses = isVertical 
    ? 'flex-col space-y-2' 
    : 'flex-row space-x-6';

  return (
    <div 
      className={`
        absolute ${positionClasses[position]} z-10 p-4
        ${className}
      `}
      style={{
        color,
        backgroundColor: `rgba(0, 0, 0, ${backgroundOpacity})`
      }}
      data-testid="prayer-times-overlay"
      data-position={position}
      data-loaded="true"
    >
      <div className={`
        ${layoutClasses} 
        ${fontSizeClasses[fontSize]}
        ${isVertical ? 'items-start' : 'items-center'}
      `}>
        {prayerTimesInfo.map((prayer) => (
          <div
            key={prayer.name}
            className={`
              flex ${isVertical ? 'flex-col' : 'flex-row'} items-center
              ${config.highlight_current_prayer && prayer.isCurrent ? 'font-bold' : ''}
              ${prayer.isNext ? 'animate-pulse' : ''}
              transition-all duration-300
            `}
            data-testid={`prayer-${prayer.name}`}
          >
            {/* Prayer name */}
            <div className={`${isVertical ? 'text-center' : 'mr-2'} font-medium`}>
              {prayer.displayName}
            </div>
            
            {/* Prayer time */}
            <div className={`
              ${isVertical ? 'text-center' : ''} font-mono
              ${prayer.isCurrent ? 'text-yellow-300' : ''}
              ${prayer.isNext ? 'text-green-300' : ''}
            `}>
              {prayer.time}
            </div>

            {/* Countdown for next prayer */}
            {config.next_prayer_countdown && prayer.isNext && prayer.countdown && (
              <div 
                className={`
                  ${isVertical ? 'text-center text-sm' : 'ml-2 text-sm'} 
                  text-green-300 font-medium
                `}
                data-testid="next-prayer-countdown"
              >
                {prayer.countdown.hours > 0 && `${prayer.countdown.hours}h `}
                {prayer.countdown.minutes}m {prayer.countdown.seconds}s
              </div>
            )}
          </div>
        ))}

        {/* Location and source info */}
        {position === 'center' && (
          <div className="text-center mt-4 text-sm opacity-80">
            <div>{config.location_name}</div>
            <div className="text-xs">
              Source: {prayerTimes.source.replace('_', ' ')}
              {prayerTimes.fetched_at && (
                <ClientOnly fallback={null}>
                  <span className="ml-2">
                    Updated: {new Date(prayerTimes.fetched_at).toLocaleTimeString()}
                  </span>
                </ClientOnly>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Simplified version for minimal displays
export function CompactPrayerTimesOverlay({
  prayerTimes,
  config,
  className = ''
}: Pick<PrayerTimesOverlayProps, 'prayerTimes' | 'config' | 'className'>) {
  // Initialize with stable values for SSR
  const [timeState, setTimeState] = useState<CurrentTimeState>({
    currentTime: new Date(0), // Use epoch time for SSR stability
    currentPrayer: null,
    nextPrayer: null,
    nextPrayerCountdown: null
  });

  // Update current time every minute for compact view
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeState(prev => ({
        ...prev,
        currentTime: new Date()
      }));
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Get next prayer info
  const getNextPrayerInfo = () => {
    const now = new Date();
    const prayers = [
      { name: 'Fajr', time: prayerTimes.fajr_time },
      { name: 'Dhuhr', time: prayerTimes.dhuhr_time },
      { name: 'Asr', time: prayerTimes.asr_time },
      { name: 'Maghrib', time: prayerTimes.maghrib_time },
      { name: 'Isha', time: prayerTimes.isha_time }
    ];

    for (const prayer of prayers) {
      const timeParts = prayer.time.split(':');
      if (timeParts.length !== 2 || !timeParts[0] || !timeParts[1]) continue;
      
      const hours = parseInt(timeParts[0], 10);
      const minutes = parseInt(timeParts[1], 10);
      
      if (isNaN(hours) || isNaN(minutes)) continue;
      
      const prayerDate = new Date(now);
      prayerDate.setHours(hours, minutes, 0, 0);

      if (prayerDate > now) {
        return prayer;
      }
    }

    // If no prayer found today, return tomorrow's Fajr
    return { name: 'Fajr', time: prayerTimes.fajr_time };
  };

  const nextPrayer = getNextPrayerInfo();

  return (
    <div className={`
      bg-black/60 text-white px-3 py-1 rounded-full
      text-sm font-medium flex items-center space-x-2
      ${className}
    `}>
      <span className="text-green-300">Next:</span>
      <span>{nextPrayer.name}</span>
      <span className="font-mono">{nextPrayer.time}</span>
    </div>
  );
}

export default PrayerTimesOverlay;