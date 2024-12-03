import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines multiple class names using clsx and tailwind-merge
 * @param inputs - Array of class values to be merged
 * @returns Merged class string
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Converts a date string into a human-readable "time ago" format
 * @param inputDate - Date string to convert
 * @returns Formatted string like "5 minutes ago", "2 hours ago", etc.
 */
export function timeAgo(inputDate: string) {
  // Get current timestamp and input date in milliseconds
  const now = Date.now();
  const givenDate = new Date(inputDate).getTime();

  // Calculate difference in seconds
  const diffInSeconds = Math.floor((now - givenDate) / 1000);

  // Return appropriate time format based on difference
  if (diffInSeconds < 10) return "Few seconds ago";
  else if (diffInSeconds < 60) {
    // Less than a minute
    return `${diffInSeconds} seconds ago`;
  } else if (diffInSeconds < 3600) {
    // Less than an hour
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  } else if (diffInSeconds < 86400) {
    // Less than a day
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  } else {
    // Days or more
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }
}
