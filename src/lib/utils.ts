import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * shadcn/ui 專用：合併 className
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
