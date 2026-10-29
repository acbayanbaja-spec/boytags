import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowUpRight, Clock, Download, Search, ShieldCheck, History as HistoryIcon } from "lucide-react";
import { api } from "@/lib/api";
import { formatDateTime, reducedMotion } from "@/lib/utils";
import { sound } from "@/lib/sound";
import { useRealtime } from "@/hooks/useRealtime";
import { Button, Card, EmptyState, Skeleton, StatusBadge } from "@/components/ui";
import { AUDIT_ACTION_LABELS, auditDiff, auditTone } from "@/components/auditMeta";
import type { AuditEntry } from "@/types";

const ROLE_FILTERS = ["ALL", "CUSTOMER", "STAFF", "ADMIN", "SYSTEM"] as const;

function toCsv(rows: AuditEntry[]) {
  const header = ["timestamp", "order", "action", "actor", "role", "previous", "current"];
  const escape = (value: unknown) => `"${String(value ?? "").replaceAll('"', '""')}"`;
  const lines = rows.map((r) =>
    [
      formatDateTime(r.createdAt),
      r.order?.orderNumber ?? r.orderId,
      AUDIT_ACTION_LABELS[r.action] || r.action,
      r.actorName,
      r.actorRole,
      auditDiff(r.previousValue).previous ?? "",
      auditDiff(r.newValue).current ?? "",
    ]
      .map(escape)
      .join(","),
  );
  return [header.join(","), ...lines].join("\n");
}

export function StaffAuditPage() {
  useRealtime();
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<(typeof ROLE_FILTERS)[number]>("ALL");
  const [action, setAction] = useState("ALL");

  const { data, isLoading } = useQuery<AuditEntry[]>({
    queryKey: ["audit"],
    queryFn: () => api<AuditEntry[]>("/api/orders/audit?limit=200"),
    refetchInterval: 15000,
  });

  const actionOptions = useMemo(() => {
    const set = new Set((data || []).map((entry) => entry.action));
    return ["ALL", ...[...set].sort()];
  }, [data]);

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (data || []).filter((entry) => {
      if (role !== "ALL" && entry.actorRole !== role) return false;
      if (action !== "ALL" && entry.action !== action) return false;
      if (!q) return true;
      return (
        (entry.order?.orderNumber || entry.orderId).toLowerCase().includes(q) ||
        entry.actorName.toLowerCase().includes(q) ||
        (AUDIT_ACTION_LABELS[entry.action] || entry.action).toLowerCase().includes(q)
      );
    });
  }, [data, role, action, search]);

  const grouped = useMemo(() => {
    const buckets = new Map<string, AuditEntry[]>();
    rows.forEach((entry) => {
      const key = new Date(entry.createdAt).toDateString();
      const bucket = buckets.get(key);
      if (bucket) bucket.push(entry);
      else buckets.set(key, [entry]);
    });
    return [...buckets.entries()].map(([day, entries]) => ({ day, entries }));
  }, [rows]);

  function handleExport() {
    sound.play("click");
    const blob = new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `boytags-order-history-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-line pb-4">
        <div>
          <div className="mb-1 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-roast">
            <ShieldCheck className="h-4 w-4" />
            Order Change History
          </div>
          <h1 className="display text-3xl font-bold text-ink">Audit Trail</h1>
          <p className="text-xs text-muted">
            Every status, item, schedule, delivery, note, and cancellation — with the previous and current values side by side for staff review.
          </p>
        </div>
        <Button variant="outline" size="sm" className="h-9 text-xs font-bold" onClick={handleExport} disabled={rows.length === 0}>
          <Download className="h-3.5 w-3.5 mr-1" /> Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-2xl border border-line bg-paper p-3.5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
          {ROLE_FILTERS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => {
                sound.play("click");
                setRole(r);
              }}
              className={`rounded-xl px-3 py-1.5 capitalize transition ${
                role === r ? "bg-roast text-white font-bold shadow-sm" : "border border-line bg-cream text-ink hover:border-roast/40"
              }`}
            >
              {r === "ALL" ? "Everyone" : r.toLowerCase()}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="rounded-xl border border-line bg-paper px-2.5 py-1.5 text-xs font-semibold text-ink outline-none focus:border-roast"
          >
            {actionOptions.map((a) => (
              <option key={a} value={a}>
                {a === "ALL" ? "All changes" : AUDIT_ACTION_LABELS[a] || a}
              </option>
            ))}
          </select>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted" />
            <input
              type="text"
              placeholder="Search order #, staff, customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-line bg-paper py-1.5 pl-9 pr-3 text-xs outline-none focus:border-roast sm:w-64"
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          title="No History Entries"
          body="Nothing matches these filters yet. Order changes appear here the moment staff or customers edit a ticket."
        />
      ) : (
        <div className="space-y-6">
          {grouped.map((group) => (
            <div key={group.day} className="space-y-2.5">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-muted">
                  <HistoryIcon className="h-3.5 w-3.5" />
                  {new Date(group.day).toLocaleDateString("en-PH", { weekday: "short", month: "short", day: "numeric" })}
                </span>
                <span className="h-px flex-1 bg-line" />
                <span className="rounded-full bg-cream px-2 py-0.5 text-[10px] font-bold text-muted border border-line">{group.entries.length}</span>
              </div>

              <div className="space-y-2.5">
                {group.entries.map((entry) => {
                  const tone = auditTone(entry.action);
                  const diff = auditDiff(entry.newValue, entry.previousValue);
                  return (
                    <motion.div
                      key={entry.id}
                      {...(reducedMotion ? {} : { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 } })}
                      transition={reducedMotion ? { duration: 0 } : { duration: 0.2, ease: "easeOut" }}
                    >
                      <Card className={`flex flex-col gap-2.5 border-l-4 p-3.5 transition hover:shadow-md sm:flex-row sm:items-center sm:gap-4 ${tone.card}`}>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-0.5 text-[10px] font-black uppercase tracking-wide ${tone.badge}`}>
                              <tone.icon className="h-3 w-3" />
                              {AUDIT_ACTION_LABELS[entry.action] || entry.action}
                            </span>
                            <Link
                              to={`/staff/queue`}
                              onClick={() => sound.play("click")}
                              className="display text-sm font-bold text-ink inline-flex items-center gap-1 hover:text-roast transition"
                            >
                              {entry.order?.orderNumber || entry.orderId}
                              <ArrowUpRight className="h-3 w-3" />
                            </Link>
                            {entry.order && <StatusBadge status={entry.order.status} />}
                          </div>
                          <p className="mt-1 text-xs text-muted">
                            <strong className="text-ink">{entry.actorName}</strong>
                            <span className="mx-1.5 rounded bg-cream px-1.5 py-0.5 text-[10px] font-bold uppercase text-muted border border-line">{entry.actorRole}</span>
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {formatDateTime(entry.createdAt)}
                            </span>
                          </p>
                        </div>

                        {(diff.previous || diff.current) && (
                          <div className="flex shrink-0 flex-wrap items-stretch gap-1.5 text-[11px] sm:max-w-[46%] sm:justify-end">
                            {diff.previous && (
                              <span className="max-w-full rounded-lg border border-line bg-cream/70 px-2 py-1 text-muted line-through decoration-muted/50">
                                {diff.previous}
                              </span>
                            )}
                            {diff.previous && diff.current && <ArrowUpRight className="h-3.5 w-3.5 shrink-0 self-center text-muted" />}
                            {diff.current && (
                              <span className="max-w-full rounded-lg border border-leaf/30 bg-leaf-soft/70 px-2 py-1 font-semibold text-emerald-900">
                                {diff.current}
                              </span>
                            )}
                          </div>
                        )}
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
