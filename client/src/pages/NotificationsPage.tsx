import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Check, CheckCheck, ArrowRight, Clock, AlertTriangle, Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import { formatDateTime } from "@/lib/utils";
import { useRealtime } from "@/hooks/useRealtime";
import { Button, Card, EmptyState, Skeleton } from "@/components/ui";
import type { NotificationItem } from "@/types";
import { toast } from "sonner";

export function NotificationsPage() {
  const queryClient = useQueryClient();
  useRealtime();

  const { data, isLoading } = useQuery<{ items: NotificationItem[]; unread: number }>({
    queryKey: ["notifications"],
    queryFn: () => api<{ items: NotificationItem[]; unread: number }>("/api/notifications"),
  });

  const markAllMutation = useMutation({
    mutationFn: () => api("/api/notifications/read-all", { method: "POST" }),
    onSuccess: () => {
      toast.success("All notifications marked as read.");
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markOneMutation = useMutation({
    mutationFn: (id: string) => api(`/api/notifications/${id}/read`, { method: "POST" }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const notifications = data?.items || [];
  const unreadCount = data?.unread || 0;

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-line pb-4">
        <div>
          <h1 className="display text-3xl font-bold text-ink">Notifications</h1>
          <p className="text-xs text-muted mt-0.5">
            Real-time updates regarding your kitchen orders, preparations, and deliveries.
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            className="text-xs h-9"
            onClick={() => markAllMutation.mutate()}
            loading={markAllMutation.isPending}
          >
            <CheckCheck className="h-4 w-4 mr-1.5" />
            Mark all as read ({unreadCount})
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-2xl" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          title="No Notifications Yet"
          body="You're all caught up! Order status updates and kitchen alerts will appear here in real time."
          action={
            <Link to="/menu">
              <Button className="mt-2">Order Fresh Lechon</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => {
            const isUnclaimed = n.type === "UNCLAIMED";
            const isCancelled = n.type === "CANCELLED";

            return (
              <Card
                key={n.id}
                className={`flex items-start justify-between gap-4 p-4 transition ${
                  !n.read
                    ? "border-roast/30 bg-cream/70 shadow-sm"
                    : "border-line bg-paper opacity-80 hover:opacity-100"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-xs font-bold ${
                      isUnclaimed
                        ? "bg-red-100 text-danger"
                        : isCancelled
                        ? "bg-rose-100 text-rose-800"
                        : !n.read
                        ? "bg-roast text-white"
                        : "bg-cream text-muted border border-line"
                    }`}
                  >
                    {isUnclaimed ? (
                      <AlertTriangle className="h-4 w-4" />
                    ) : (
                      <Bell className="h-4 w-4" />
                    )}
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-ink">{n.title}</h4>
                      {!n.read && (
                        <span className="h-2 w-2 rounded-full bg-roast shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted leading-relaxed">{n.body}</p>
                    <p className="text-[11px] text-muted flex items-center gap-1 pt-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatDateTime(n.createdAt)}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {n.orderId && (
                    <Link
                      to={`/orders/${n.orderId}`}
                      onClick={() => {
                        if (!n.read) markOneMutation.mutate(n.id);
                      }}
                    >
                      <Button variant="outline" className="h-8 px-2.5 text-xs">
                        View Order <ArrowRight className="h-3 w-3 ml-1" />
                      </Button>
                    </Link>
                  )}
                  {!n.read && !n.orderId && (
                    <button
                      type="button"
                      onClick={() => markOneMutation.mutate(n.id)}
                      className="rounded-lg p-1 text-muted hover:text-ink hover:bg-line/40 transition"
                      title="Mark as read"
                      aria-label="Mark as read"
                    >
                      <Check className="h-4 w-4" />
                    </button>
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
