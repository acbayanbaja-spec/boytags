import { AlertTriangle, CalendarClock, CheckCircle2, FilePlus2, MessageSquare, Package, Pencil, PhoneCall, XCircle, type LucideIcon } from "lucide-react";

export const AUDIT_ACTION_LABELS: Record<string, string> = {
  ORDER_CREATED: "Order created",
  STATUS_CHANGED: "Status changed",
  ITEMS_CHANGED: "Items changed",
  SCHEDULE_CHANGED: "Schedule changed",
  DELIVERY_UPDATED: "Delivery details changed",
  NOTES_CHANGED: "Notes changed",
  ORDER_CANCELLED: "Order cancelled",
  AUTO_EXPIRED: "Auto-expired",
  UNCLAIMED: "Unclaimed",
  DELIVERY_CONFIRMED: "Customer confirmed",
  RIDER_ARRIVED: "Rider arrived",
};

type Tone = { icon: LucideIcon; badge: string; card: string };

const TONES: Record<string, Tone> = {
  neutral: { icon: Pencil, badge: "bg-slate-100 text-slate-700", card: "border-l-slate-300" },
  create: { icon: FilePlus2, badge: "bg-roast/10 text-roast", card: "border-l-roast" },
  status: { icon: Pencil, badge: "bg-amber-100 text-amber-800", card: "border-l-amber-400" },
  items: { icon: Package, badge: "bg-indigo-100 text-indigo-800", card: "border-l-indigo-400" },
  schedule: { icon: CalendarClock, badge: "bg-sky-100 text-sky-800", card: "border-l-sky-500" },
  delivery: { icon: PhoneCall, badge: "bg-sky-100 text-sky-900", card: "border-l-sky-700" },
  notes: { icon: MessageSquare, badge: "bg-stone-100 text-stone-700", card: "border-l-stone-400" },
  danger: { icon: XCircle, badge: "bg-red-100 text-red-800", card: "border-l-red-500" },
  warn: { icon: AlertTriangle, badge: "bg-orange-100 text-orange-800", card: "border-l-orange-500" },
  success: { icon: CheckCircle2, badge: "bg-emerald-100 text-emerald-800", card: "border-l-emerald-500" },
};

const TONE_BY_ACTION: Record<string, keyof typeof TONES> = {
  ORDER_CREATED: "create",
  STATUS_CHANGED: "status",
  ITEMS_CHANGED: "items",
  SCHEDULE_CHANGED: "schedule",
  DELIVERY_UPDATED: "delivery",
  NOTES_CHANGED: "notes",
  ORDER_CANCELLED: "danger",
  AUTO_EXPIRED: "danger",
  UNCLAIMED: "warn",
  DELIVERY_CONFIRMED: "success",
  RIDER_ARRIVED: "success",
};

export function auditTone(action: string): Tone {
  const key = TONE_BY_ACTION[action];
  return key ? TONES[key] : TONES.neutral;
}

/** Prisma JSON columns arrive as objects; flatten them into short, readable before/after strings. */
function flatten(value: unknown): string | null {
  if (value == null || value === "") return null;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
  if (Array.isArray(value)) {
    if (!value.length) return null;
    return value
      .map((row) => {
        if (row && typeof row === "object") {
          const r = row as Record<string, unknown>;
          const name = r.productName || r.name;
          const qty = r.quantity;
          if (name) return `${qty ?? 1}× ${name}`;
        }
        return String(row);
      })
      .join(", ");
  }
  const record = value as Record<string, unknown>;
  if (record.status) return String(record.status).replaceAll("_", " ");
  const parts = Object.entries(record)
    .filter(([, v]) => v != null && v !== "" && typeof v !== "object")
    .map(([k, v]) => `${k}: ${String(v)}`);
  if (!parts.length) return null;
  return parts.join(" · ");
}

export function auditDiff(current: unknown, previous?: unknown): { previous: string | null; current: string | null } {
  return { previous: flatten(previous), current: flatten(current) };
}
