import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** shadcn's class merge helper. Blocks pulled from the registry import this. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
