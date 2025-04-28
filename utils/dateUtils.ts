/**
 * Checks if a reset should be performed based on the reset day
 * @param resetDay Day of the month when counters should reset (1-28)
 * @returns Boolean indicating if reset should happen
 */
export const checkResetDate = (resetDay: number): boolean => {
    const today = new Date();
    const currentDay = today.getDate();
    
    // Get the last reset date from storage
    const lastResetStr = localStorage.getItem('lastResetDate');
    if (!lastResetStr) {
      // First time running, no need to reset
      return false;
    }
    
    const lastReset = new Date(lastResetStr);
    const lastResetMonth = lastReset.getMonth();
    const currentMonth = today.getMonth();
    
    // If we've moved to a new month and passed the reset day
    if (currentMonth !== lastResetMonth && currentDay >= resetDay) {
      return true;
    }
    
    // If we're in the same month but last reset was before the reset day
    // and current day is at or past the reset day
    if (currentMonth === lastResetMonth && 
        lastReset.getDate() < resetDay && 
        currentDay >= resetDay) {
      return true;
    }
    
    return false;
  };
  
  /**
   * Formats minutes into hours and minutes display
   * @param minutes Total minutes to format
   * @returns Formatted string (e.g. "3h 45m")
   */
  export const formatTimeDisplay = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    
    return `${mins}m`;
  };
  
  /**
   * Returns a date for the next reset
   * @param resetDay Day of month for reset (1-28)
   * @returns Date object for next reset
   */
  export const getNextResetDate = (resetDay: number): Date => {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // If we haven't reached the reset day this month
    if (currentDay < resetDay) {
      return new Date(currentYear, currentMonth, resetDay);
    }
    
    // If we've passed the reset day, it's next month
    const nextMonth = currentMonth + 1;
    return new Date(
      nextMonth === 12 ? currentYear + 1 : currentYear,
      nextMonth === 12 ? 0 : nextMonth,
      resetDay
    );
  };