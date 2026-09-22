import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ClipboardList, ArrowRight, Truck, Store, Clock } from "lucide-react";
import { api } from "@/lib/api";
import { formatDateTime, formatPeso, scheduleLabel } from "@/lib/utils";
import { useRealtime } from "@/hooks/useRealtime";
import { Button, Card, EmptyState, Skeleton, StatusBadge } from "@/components/ui";
import type { Order } from "@/types";

export function OrdersPage() {
  const [filter, setFilter] = useState<"all" | "active" | "completed" | "cancelled">("all");
  useRealtime();

  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: () => api<Order[]>("/api/orders"),
  });

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    if (filter === "all") return orders;
    if (filter === "active") {
      return orders.filter((o) =>
        ["PENDING", "CONFIRMED", "PREPARING", "READY", "OUT_FOR_DELIVERY", "UNCLAIMED"].includes(o.status),
      );
    }
    if (filter === "completed") return orders.filter((o) => o.status === "COMPLETED");
    if (filter === "cancelled") return orders.filter((o) => o.status === "CANCELLED");
    return orders;
  }, [orders, filter]);

  return (
    <div className="space-y-6 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-line pb-4">
        <div>
          <h1 className="display text-3xl font-bold text-ink">My Orders</h1>
          <p className="text-xs text-muted mt-0.5">
            Track active deliveries, scheduled pickups, and review order receipts.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex rounded-xl bg-paper border border-line p-1 text-xs font-semibold">
          {(["all", "active", "completed", "cancelled"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`rounded-lg px-3 py-1.5 capitalize transition ${
                filter === tab ? "bg-roast text-white shadow-sm" : "text-muted hover:text-ink"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-36 w-full rounded-2xl" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          title="No Orders Found"
          body={
            filter === "all"
              ? "You have not placed any orders with Boytag's yet. Take a look at our hot roast menu!"
              : `No orders in the "${filter}" category.`
          }
          action={
            <Link to="/menu">
              <Button className="mt-2">Explore Menu & Order</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isDelivery = order.type === "DELIVERY";
            const itemsSummary = order.items.map((i) => `${i.quantity}× ${i.productName}`).join(", ");

            return (
              <Card
                key={order.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 hover:border-roast/40 transition hover:shadow-md"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="display font-bold text-base text-ink">{order.orderNumber}</span>
                    <StatusBadge status={order.status} />
                    <span className="inline-flex items-center gap-1 rounded-full bg-cream border border-line px-2.5 py-0.5 text-[11px] text-muted">
                      {isDelivery ? <Truck className="h-3 w-3" /> : <Store className="h-3 w-3" />}
                      {isDelivery ? "Delivery" : "Pickup"}
                    </span>
                  </div>

                  <p className="text-xs text-ink line-clamp-1">
                    <span className="font-semibold">Items:</span> {itemsSummary}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-roast" />
                      Scheduled: <strong>{scheduleLabel(order.scheduledAt)}</strong>
                    </span>
                    <span>Placed {formatDateTime(order.createdAt)}</span>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between border-t border-line/60 pt-3 sm:border-0 sm:pt-0 gap-2 shrink-0">
                  <span className="display text-lg font-bold text-roast">{formatPeso(order.total)}</span>
                  <Link to={`/orders/${order.id}`}>
                    <Button variant="outline" className="text-xs h-9">
                      Track Order <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
