import { useState, useEffect } from 'react';
import { differenceInSeconds, isPast } from 'date-fns';

export interface InvestmentTimer {
  investmentId: string;
  endDate: string;
  timeRemaining: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    totalSeconds: number;
  };
  isCompleted: boolean;
  isExpired: boolean;
}

/**
 * Hook to track investment countdown timer
 * Updates every second and calculates time remaining until investment completion
 */
export const useInvestmentTimer = (investmentId: string, endDate: string): InvestmentTimer => {
  const [timer, setTimer] = useState<InvestmentTimer>({
    investmentId,
    endDate,
    timeRemaining: {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalSeconds: 0,
    },
    isCompleted: false,
    isExpired: false,
  });

  useEffect(() => {
    const updateTimer = () => {
      const endDateTime = new Date(endDate);
      const now = new Date();

      // Check if investment has already completed
      if (isPast(endDateTime)) {
        setTimer((prev) => ({
          ...prev,
          isExpired: true,
          timeRemaining: {
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0,
            totalSeconds: 0,
          },
        }));
        return;
      }

      // Calculate time remaining
      const totalSeconds = differenceInSeconds(endDateTime, now);
      const days = Math.floor(totalSeconds / (24 * 60 * 60));
      const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
      const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
      const seconds = totalSeconds % 60;

      setTimer({
        investmentId,
        endDate,
        timeRemaining: {
          days,
          hours,
          minutes,
          seconds,
          totalSeconds,
        },
        isCompleted: false,
        isExpired: false,
      });
    };

    // Initial update
    updateTimer();

    // Update every second
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [endDate, investmentId]);

  return timer;
};

/**
 * Format timer for display (e.g., "5d 12h 34m 56s")
 */
export const formatTimerDisplay = (timer: InvestmentTimer): string => {
  if (timer.isExpired) {
    return 'Completed';
  }

  const { days, hours, minutes, seconds } = timer.timeRemaining;

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
};
