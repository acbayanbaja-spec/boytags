import { AlertTriangle, CalendarClock, CheckCircle2, Clock, MapPin, MessageSquare, Package, Pencil, Truck, XCircle } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import type { HistoryEntry } from "@/types";

type Meta = { label: string; icon: typeof Clock; tone: string };

const META: Record<string, Meta> = {
  ORDER_CREATED: { label: "created the order", icon: Package, tone: "bg-roast text-white" },
  STATUS_CHANGED: { label: "updated the status", icon: Pencil, tone: "bg-amber-500 text-white" },
  ITEMS_CHANGED: { label: "changed the items", icon: Package, tone: "bg-indigo-500 text-white" },
  SCHEDULE_CHANGED: { label: "changed the schedule", icon: CalendarClock, tone: "bg-sky-600 text-white" },
  DELIVERY_UPDATED: { label: "updated delivery details", icon: MapPin, tone: "bg-sky-700 text-white" },
  NOTES_CHANGED: { label: "updated notes", icon: MessageSquare, tone: "bg-slate-500 text-white" },
  ORDER_CANCELLED: { label: "cancelled the order", icon: XCircle, tone: "bg-red-600 text-white" },
  AUTO_EXPIRED: { label: "auto-expired the order", icon: AlertTriangle, tone: "bg-red-700 text-white" },
  UNCLAIMED: { label: "marked the order unclaimed", icon: AlertTriangle, tone: "bg-orange-600 text-white" },
  DELIVERY_CONFIRMED: { label: "confirmed receipt with the customer", icon: CheckCircle2, tone: "bg-emerald-600 text-white" },
  RIDER_ARRIVED: { label: "reported the rider at the doorstep", icon: Truck, tone: "bg-emerald-700 text-white" },
};

/** Prisma Decimals and nested JSON arrive as plain objects — keep the diff readable. */
function scalar(value: unknown): string {
  if (value == null) return "—";
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (record.status) return String(record.status).replaceAll("_", " ");
    return Object.entries(record)
      .filter(([, v]) => v != null && v !== "")
      .map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : String(v)}`)
      .join(" · ");
  }
  return String(value);
}

export function OrderTimeline({ history }: { history: HistoryEntry[] }) {
  if (!history?.length) return <p className="text-sm text-muted">No history recorded yet.</p>;
  return (
    <ol className="space-y-3.5">
      {history.map((entry, index) => {
        const meta = META[entry.action] || { label: entry.action.replaceAll("_", " ").toLowerCase(), icon: Pencil, tone: "bg-muted text-white" };
        const Icon = meta.icon;
        const before = scalar(entry.previousValue);
        const after = scalar(entry.newValue);
        return (
          <li key={entry.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full ${meta.tone} shadow-xs`}>
                <Icon className="h-3.5 w-3.5" />
              </span>
              {index < history.length - 1 ? <span className="w-px flex-1 bg-line" /> : null}
            </div>
            <div className="min-w-0 flex-1 pb-1">
              <p className="text-sm font-semibold leading-tight text-ink">
                {meta.label}
                <span className="ml-1.5 rounded-full bg-cream border border-line px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted">
                  {entry.actorRole}
                </span>
              </p>
              <p className="text-[11px] text-muted">
                {entry.actorName} · {formatDateTime(entry.createdAt)}
              </p>
              {Boolean(entry.previousValue || entry.newValue) && (before !== "—" || after !== "—") && (
                <div className="mt-1.5 flex flex-wrap items-stretch gap-1.5 text-[11px]">
                  {Boolean(entry.previousValue) && (
                    <span className="max-w-full rounded-lg border border-line bg-cream/70 px-2 py-1 text-muted line-through decoration-muted/50">
                      {before}
                    </span>
                  )}
                  {Boolean(entry.previousValue && entry.newValue) && <Clock className="h-3.5 w-3.5 shrink-0 self-center text-muted" />}
                  {Boolean(entry.newValue) && (
                    <span className="max-w-full rounded-lg border border-leaf/30 bg-leaf-soft/70 px-2 py-1 font-semibold text-emerald-900">{after}</span>
                  )}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
