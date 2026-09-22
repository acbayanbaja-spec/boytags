import { formatDateTime } from "@/lib/utils";
import type { HistoryEntry } from "@/types";

const labels: Record<string, string> = {
  ORDER_CREATED: "created the order",
  STATUS_CHANGED: "updated the status",
  ITEMS_CHANGED: "changed the items",
  SCHEDULE_CHANGED: "changed the schedule",
  DELIVERY_UPDATED: "updated delivery details",
  NOTES_CHANGED: "updated notes",
  ORDER_CANCELLED: "cancelled the order",
  UNCLAIMED: "marked the order unclaimed",
};

function pretty(value: unknown) {
  if (!value || typeof value !== "object") return value == null ? "—" : String(value);
  const record = value as Record<string, unknown>;
  if (record.status) return String(record.status).replaceAll("_", " ");
  if (Array.isArray(value)) return value.map((item) => JSON.stringify(item)).join(", ");
  return Object.entries(record)
    .map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : String(v)}`)
    .join(" · ");
}

export function OrderTimeline({ history }: { history: HistoryEntry[] }) {
  if (!history?.length) return <p className="text-sm text-muted">No history recorded yet.</p>;
  return (
    <ol className="space-y-4">
      {history.map((entry, index) => (
        <li key={entry.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span className="mt-1 h-2.5 w-2.5 rounded-full bg-roast" />
            {index < history.length - 1 ? <span className="w-px flex-1 bg-line" /> : null}
          </div>
          <div className="pb-4">
            <p className="text-sm font-medium">
              {formatDateTime(entry.createdAt)} — {entry.actorName} {labels[entry.action] || entry.action.toLowerCase()}
            </p>
            {entry.previousValue || entry.newValue ? (
              <p className="mt-1 text-xs text-muted">
                {entry.previousValue ? <>from {pretty(entry.previousValue)} </> : null}
                {entry.newValue ? <>→ {pretty(entry.newValue)}</> : null}
              </p>
            ) : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
