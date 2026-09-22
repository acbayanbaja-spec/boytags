import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPeso(value: number) {
  return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(value);
}

export function formatTime(value: string | Date) {
  return new Date(value).toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit" });
}

export function formatDateTime(value: string | Date) {
  return new Date(value).toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function waitingLabel(from: string | Date) {
  const mins = Math.max(0, Math.round((Date.now() - new Date(from).getTime()) / 60000));
  if (mins < 1) return "Just in";
  if (mins < 60) return `${mins}m waiting`;
  const h = Math.floor(mins / 60);
  return `${h}h ${mins % 60}m waiting`;
}

export function scheduleLabel(value: string | Date) {
  const date = new Date(value);
  const diff = date.getTime() - Date.now();
  if (diff < 0) return `Overdue · ${formatTime(date)}`;
  return formatDateTime(date);
}

export const reducedMotion =
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
