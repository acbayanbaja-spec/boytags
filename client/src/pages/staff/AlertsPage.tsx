import { useState, useMemo } from "react";
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
} from "lucide-react";
import { api } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";
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
      toast.success("Alert acknowledged.");
      void queryClient.invalidateQueries({ queryKey: ["alerts"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const resolveMutation = useMutation({
    mutationFn: (id: string) => api(`/api/alerts/${id}/resolve`, { method: "POST" }),
    onSuccess: () => {
      toast.success("Alert marked as resolved!");
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
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-danger">
            <AlertTriangle className="h-4 w-4" />
            <span>Operational Exception Alerts</span>
          </div>
          <h1 className="display text-3xl font-bold text-ink mt-0.5">Alerts & Unclaimed Watcher</h1>
          <p className="text-xs text-muted">
            Monitors orders past their scheduled claim threshold and inventory low-stock / sold-out limits.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex rounded-xl bg-paper border border-line p-1 text-xs font-semibold">
          {[
            { key: "OPEN", label: "Open Alerts" },
            { key: "ACKNOWLEDGED", label: "Acknowledged" },
            { key: "RESOLVED", label: "Resolved" },
            { key: "ALL", label: "All History" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusFilter(tab.key)}
              className={`rounded-lg px-3 py-1.5 transition ${
                statusFilter === tab.key ? "bg-roast text-white shadow-sm" : "text-muted hover:text-ink"
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
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      ) : !alerts || alerts.length === 0 ? (
        <EmptyState
          title="No Alerts Found"
          body={
            statusFilter === "OPEN"
              ? "All operations are running smoothly! No open unclaimed tickets or stock alerts."
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
                    ? "border-2 border-red-500 bg-red-50/30"
                    : alert.status === "OPEN"
                    ? "border-amber-400 bg-amber-50/20"
                    : "border-line bg-paper opacity-80"
                }`}
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-cream border border-line shadow-sm">
                    {getAlertIcon(alert.type)}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm text-ink">{alert.message}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                          alert.status === "OPEN"
                            ? "bg-red-600 text-white"
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
                  {alert.order?.orderNumber && (
                    <Link to="/staff/queue">
                      <Button variant="outline" className="h-8 px-3 text-xs">
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        Kitchen Queue
                      </Button>
                    </Link>
                  )}

                  {alert.status === "OPEN" && (
                    <Button
                      variant="outline"
                      className="h-8 px-3 text-xs"
                      onClick={() => ackMutation.mutate(alert.id)}
                      loading={ackMutation.isPending}
                    >
                      Acknowledge
                    </Button>
                  )}

                  {alert.status !== "RESOLVED" && (
                    <Button
                      className="h-8 px-3 text-xs"
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
