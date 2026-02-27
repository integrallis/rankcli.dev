/**
 * Date formatting utilities for consistent local timezone display
 */

/**
 * Format a date string to local timezone in a human-readable format
 * @param dateString - ISO date string or timestamp
 * @param options - Optional Intl.DateTimeFormat options
 * @returns Formatted date string in user's local timezone
 */
export function formatLocalDate(
  dateString: string | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    dateStyle: 'medium',
    timeStyle: 'short',
  }
): string {
  if (!dateString) return 'N/A';

  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    if (isNaN(date.getTime())) return 'Invalid date';
    return date.toLocaleString(undefined, options);
  } catch {
    return 'Invalid date';
  }
}

/**
 * Format a date for relative time display (e.g., "in 2 hours", "3 days ago")
 */
export function formatRelativeTime(dateString: string | Date | null | undefined): string {
  if (!dateString) return 'N/A';

  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    if (isNaN(date.getTime())) return 'Invalid date';

    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHour = Math.round(diffMin / 60);
    const diffDay = Math.round(diffHour / 24);

    const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });

    if (Math.abs(diffSec) < 60) {
      return rtf.format(diffSec, 'seconds');
    } else if (Math.abs(diffMin) < 60) {
      return rtf.format(diffMin, 'minutes');
    } else if (Math.abs(diffHour) < 24) {
      return rtf.format(diffHour, 'hours');
    } else {
      return rtf.format(diffDay, 'days');
    }
  } catch {
    return 'Invalid date';
  }
}

/**
 * Calculate time remaining until a future date
 * @returns Object with days, hours, minutes, seconds remaining (all 0 if date is in past)
 */
export function getTimeRemaining(dateString: string | Date | null | undefined): {
  total: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
} {
  if (!dateString) {
    return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }

  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    if (isNaN(date.getTime())) {
      return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
    }

    const total = date.getTime() - Date.now();
    const isPast = total <= 0;

    if (isPast) {
      return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
    }

    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
    const days = Math.floor(total / (1000 * 60 * 60 * 24));

    return { total, days, hours, minutes, seconds, isPast };
  } catch {
    return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }
}

/**
 * Format countdown display string
 */
export function formatCountdown(dateString: string | Date | null | undefined): string {
  const time = getTimeRemaining(dateString);

  if (time.isPast) return 'Available now';

  const parts: string[] = [];
  if (time.days > 0) parts.push(`${time.days}d`);
  if (time.hours > 0) parts.push(`${time.hours}h`);
  if (time.minutes > 0) parts.push(`${time.minutes}m`);
  if (parts.length === 0 && time.seconds > 0) parts.push(`${time.seconds}s`);

  return parts.length > 0 ? parts.join(' ') : 'Available now';
}

/**
 * Parse next_allowed_at from error message or JSON
 */
export function parseNextAllowedAt(errorMessage: string | null | undefined): string | null {
  if (!errorMessage) return null;

  // Try to parse as JSON first (error stored as JSON object)
  try {
    const parsed = JSON.parse(errorMessage);
    if (parsed.next_allowed_at) return parsed.next_allowed_at;
  } catch {
    // Not JSON, try regex
  }

  // Try to extract ISO date from error message string
  const isoMatch = errorMessage.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?/);
  if (isoMatch) return isoMatch[0];

  return null;
}
