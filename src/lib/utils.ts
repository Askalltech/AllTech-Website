import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * shadcn's class merge helper. Every registry component imports this.
 * NOTE: `npx shadcn add` rewrites this file on some installs — it reformats to
 * shadcn's own style and drops comments. Harmless, but re-check after adding.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
