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

export function formatDeliveryDateLabel(value: string | Date) {
  const target = new Date(value);
  const now = new Date();
  const isToday =
    target.getFullYear() === now.getFullYear() &&
    target.getMonth() === now.getMonth() &&
    target.getDate() === now.getDate();
  if (isToday) return "Today";

  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const isTomorrow =
    target.getFullYear() === tomorrow.getFullYear() &&
    target.getMonth() === tomorrow.getMonth() &&
    target.getDate() === tomorrow.getDate();
  if (isTomorrow) return "Tomorrow";

  return target.toLocaleDateString("en-PH", { month: "short", day: "numeric" });
}

export function scheduleLabel(value: string | Date, status?: string) {
  const date = new Date(value);
  if (status === "COMPLETED") {
    return `${formatTime(date)} (${formatDeliveryDateLabel(date)})`;
  }
  const diff = date.getTime() - Date.now();
  if (diff < -15 * 60 * 1000 && !["COMPLETED", "CANCELLED"].includes(status || "")) {
    return `Delayed · ${formatTime(date)} (${formatDeliveryDateLabel(date)})`;
  }
  return `${formatTime(date)} (${formatDeliveryDateLabel(date)})`;
}

export const STORE_OPEN = "08:30";
export const STORE_CLOSE = "20:30";

export function formatDateLong(value: string | Date) {
  return new Date(value).toLocaleDateString("en-PH", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function countdownLabel(target: string | Date) {
  const diffMs = new Date(target).getTime() - Date.now();
  const abs = Math.abs(diffMs);
  const mins = Math.floor(abs / 60000);
  const secs = Math.floor((abs % 60000) / 1000);
  const core = mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : mins >= 1 ? `${mins}m ${secs}s` : `${secs}s`;
  return diffMs >= 0 ? `in ${core}` : `${core} overdue`;
}

export const reducedMotion =
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
