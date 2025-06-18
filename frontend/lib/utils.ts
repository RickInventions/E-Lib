import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
  
    if (hours > 0) {
    return `${hours}h ${minutes.toString().padStart(2, '0')}m`
  } else if (minutes > 0) {
    return `${minutes}m ${secs.toString().padStart(2, '0')}s`
  } else {
    return `${secs}s`
  }
}
export function formatDate(dateString: string): string {
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  }
  return new Date(dateString).toLocaleDateString(undefined, options)
}