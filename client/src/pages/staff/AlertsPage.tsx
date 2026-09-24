import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  AlertTriangle,
  PackageX,
  TrendingDown,
  Bell,
  CheckCircle2,
  Clock,
  Eye,
  Check,
  ShieldCheck,
  Flame,
  Phone,
} from "lucide-react";
import { api } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";
import { sound } from "@/lib/sound";
import { useRealtime } from "@/hooks/useRealtime";
import { Button, Card, EmptyState, Skeleton } from "@/components/ui";
import type { Alert } from "@/types";
import { toast } from "sonner";

export function StaffAlertsPage() {
  const queryClient = useQueryClient();
  useRealtime();

  const [statusFilter, setStatusFilter] = useState<string>("OPEN");

  const { data: alerts, isLoading } = useQuery<Alert[]>({
    queryKey: ["alerts", statusFilter],
    queryFn: () => api<Alert[]>(`/api/alerts${statusFilter !== "ALL" ? `?status=${statusFilter}` : ""}`),
    refetchInterval: 5000,
  });

  const ackMutation = useMutation({
    mutationFn: (id: string) => api(`/api/alerts/${id}/ack`, { method: "POST" }),
    onSuccess: () => {
      sound.play("click");
      toast.success("Alert acknowledged.");
      void queryClient.invalidateQueries({ queryKey: ["alerts"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const resolveMutation = useMutation({
    mutationFn: (id: string) => api(`/api/alerts/${id}/resolve`, { method: "POST" }),
    onSuccess: () => {
      sound.play("success");
      toast.success("Alert resolved!");
      void queryClient.invalidateQueries({ queryKey: ["alerts"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  function getAlertIcon(type: string) {
    if (type === "UNCLAIMED_ORDER") return <AlertTriangle className="h-5 w-5 text-red-600" />;
    if (type === "SOLD_OUT") return <PackageX className="h-5 w-5 text-amber-600" />;
    if (type === "LOW_STOCK") return <TrendingDown className="h-5 w-5 text-orange-600" />;
    return <Bell className="h-5 w-5 text-roast" />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-line pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-danger mb-1">
            <AlertTriangle className="h-4 w-4" />
            <span>Poblacion, Tupi Exception Alerts</span>
          </div>
          <h1 className="display text-3xl font-bold text-ink">Alerts & Unclaimed Watcher</h1>
          <p className="text-xs text-muted">
            Monitors roast chicken orders exceeding claim times and tracks inventory threshold warnings.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex rounded-2xl bg-paper border border-line p-1 text-xs font-semibold shadow-sm">
          {[
            { key: "OPEN", label: "Open Alerts" },
            { key: "ACKNOWLEDGED", label: "Acknowledged" },
            { key: "RESOLVED", label: "Resolved" },
            { key: "ALL", label: "All History" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                sound.play("click");
                setStatusFilter(tab.key);
              }}
              className={`rounded-xl px-3 py-1.5 transition ${
                statusFilter === tab.key ? "bg-roast text-white font-bold shadow-sm" : "text-muted hover:text-ink"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Stream */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-3xl" />
          ))}
        </div>
      ) : !alerts || alerts.length === 0 ? (
        <EmptyState
          title="All Clear!"
          body={
            statusFilter === "OPEN"
              ? "All Tupi operations running seamlessly! No overdue tickets or stock warnings."
              : `No alerts with status "${statusFilter}".`
          }
        />
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => {
            const isUnclaimed = alert.type === "UNCLAIMED_ORDER";

            return (
              <Card
                key={alert.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 transition ${
                  isUnclaimed && alert.status === "OPEN"
                    ? "border-2 border-red-500 bg-red-50/40 shadow-sm"
                    : alert.status === "OPEN"
                    ? "border-amber-400 bg-amber-50/20"
                    : "border-line bg-paper opacity-80"
                }`}
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-cream border border-line shadow-sm">
                    {getAlertIcon(alert.type)}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm text-ink">{alert.message}</span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          alert.status === "OPEN"
                            ? "bg-red-600 text-white shadow-sm"
                            : alert.status === "ACKNOWLEDGED"
                            ? "bg-amber-500 text-white"
                            : "bg-leaf-soft text-leaf"
                        }`}
                      >
                        {alert.status}
                      </span>
                    </div>

                    {alert.order?.customer && (
                      <p className="text-xs text-muted">
                        Customer: <strong className="text-ink">{alert.order.customer.name}</strong> • Phone:{" "}
                        <strong className="text-ink">{alert.order.customer.phone || "No phone"}</strong>
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted pt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Triggered {formatDateTime(alert.createdAt)}
                      </span>
                      {alert.acknowledgedBy && (
                        <span>
                          Ack by: <strong>{alert.acknowledgedBy.name}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0 border-t border-line/60 pt-3 sm:border-0 sm:pt-0">
                  {alert.order?.customer?.phone && (
                    <a href={`tel:${alert.order.customer.phone}`}>
                      <Button variant="outline" size="sm" className="h-8 px-2.5 text-xs">
                        <Phone className="h-3.5 w-3.5 mr-1 text-leaf" /> Call Customer
                      </Button>
                    </a>
                  )}

                  {alert.order?.orderNumber && (
                    <Link to="/staff/queue">
                      <Button variant="outline" size="sm" className="h-8 px-3 text-xs">
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        Queue
                      </Button>
                    </Link>
                  )}

                  {alert.status === "OPEN" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 text-xs font-semibold"
                      onClick={() => ackMutation.mutate(alert.id)}
                      loading={ackMutation.isPending}
                    >
                      Acknowledge
                    </Button>
                  )}

                  {alert.status !== "RESOLVED" && (
                    <Button
                      size="sm"
                      className="h-8 px-3 text-xs font-bold shadow-sm"
                      onClick={() => resolveMutation.mutate(alert.id)}
                      loading={resolveMutation.isPending}
                    >
                      <Check className="h-3.5 w-3.5 mr-1" />
                      Resolve Alert
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
