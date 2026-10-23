import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ClipboardList,
  ArrowRight,
  Truck,
  Store,
  Clock,
  RotateCcw,
  Printer,
  CheckCircle2,
  Flame,
} from "lucide-react";
import { api } from "@/lib/api";
import { formatDateTime, formatPeso, formatTime, formatDeliveryDateLabel, scheduleLabel } from "@/lib/utils";
import { sound } from "@/lib/sound";
import { useCart } from "@/context/CartContext";
import { useRealtime } from "@/hooks/useRealtime";
import { Button, Card, EmptyState, Skeleton, StatusBadge } from "@/components/ui";
import { ReceiptModal } from "@/components/ReceiptModal";
import type { Order } from "@/types";
import { toast } from "sonner";

export function OrdersPage() {
  const [filter, setFilter] = useState<"all" | "active" | "completed" | "cancelled">("all");
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);
  const { add } = useCart();
  const navigate = useNavigate();
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

  function handleReorder(order: Order) {
    sound.play("add");
    // Add all items from this order into current cart
    order.items.forEach((item) => {
      add(
        {
          id: item.productId,
          name: item.productName,
          slug: item.productName.toLowerCase().replace(/\s+/g, "-"),
          description: "Re-ordered specialty dish",
          price: item.unitPrice,
          imageUrl: "/images/whole-lechon-manok.jpg",
          availableQty: 20,
          soldOut: false,
          active: true,
          category: { id: "cat_lechon", name: "Lechon Manok", slug: "lechon-manok" },
        },
        item.quantity,
      );
    });
    toast.success(`Items from order ${order.orderNumber} re-added to your cart!`);
    navigate("/cart");
  }

  return (
    <div className="space-y-6 py-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-line pb-4">
        <div>
          <h1 className="display text-3xl font-bold text-ink">My Orders</h1>
          <p className="text-xs text-muted mt-0.5">
            Track active deliveries across Tupi, schedule pickups, and review official receipts.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex rounded-2xl bg-paper border border-line p-1 text-xs font-semibold shadow-sm">
          {(["all", "active", "completed", "cancelled"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                sound.play("click");
                setFilter(tab);
              }}
              className={`rounded-xl px-3.5 py-1.5 capitalize transition ${
                filter === tab ? "bg-roast text-white font-bold shadow-sm" : "text-muted hover:text-ink"
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
            <Skeleton key={i} className="h-36 w-full rounded-3xl" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          title="No Orders Found"
          body={
            filter === "all"
              ? "You haven't placed any orders with Boytag's yet. Take a look at our hot roast Tupi menu!"
              : `No orders in the "${filter}" category.`
          }
          action={
            <Link to="/menu">
              <Button className="mt-2 font-bold shadow-md shadow-roast/20">Explore Menu & Order</Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isDelivery = order.type === "DELIVERY";
            const itemsSummary = order.items.map((i) => `${i.quantity}× ${i.productName}`).join(", ");
            const isCompleted = order.status === "COMPLETED";

            return (
              <Card
                key={order.id}
                className="flex flex-col gap-4 p-5 hover:border-roast/40 transition hover:shadow-md"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line/60 pb-3">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="display font-bold text-lg text-ink">{order.orderNumber}</span>
                    <StatusBadge status={order.status} />
                    <span className="inline-flex items-center gap-1 rounded-full bg-cream border border-line px-2.5 py-0.5 text-[11px] font-medium text-muted">
                      {isDelivery ? <Truck className="h-3 w-3 text-roast" /> : <Store className="h-3 w-3 text-roast" />}
                      {isDelivery ? "Delivery in Tupi" : "Pickup (Poblacion HQ)"}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="display text-xl font-bold text-roast">{formatPeso(order.total)}</span>
                    <button
                      type="button"
                      onClick={() => {
                        sound.play("click");
                        setReceiptOrder(order);
                      }}
                      className="rounded-xl border border-line bg-paper p-2 hover:bg-cream text-muted hover:text-ink transition"
                      title="View & Print Official Receipt"
                    >
                      <Printer className="h-4 w-4" />
                    </button>
                    {isCompleted && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleReorder(order)}
                        className="text-xs font-semibold"
                        title="Re-order all items"
                      >
                        <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reorder
                      </Button>
                    )}
                    <Link to={`/orders/${order.id}`}>
                      <Button size="sm" className="text-xs font-bold shadow-sm">
                        Track Order <ArrowRight className="h-3.5 w-3.5 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Delivery Time & Status Highlights Banner */}
                {order.status === "PENDING" ? (
                  <div className="rounded-2xl border border-amber-400/60 bg-gradient-to-r from-amber-50 to-orange-50/60 p-3.5 text-xs text-amber-950 shadow-xs">
                    <div className="flex items-start gap-3">
                      <div className="grid h-8 w-8 place-items-center rounded-xl bg-amber-500 text-white shrink-0 shadow-xs">
                        <Clock className="h-4 w-4 animate-pulse" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex flex-wrap items-center justify-between gap-1">
                          <span className="font-bold uppercase tracking-wider text-[11px] text-amber-900 flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                            Pending Kitchen Confirmation
                          </span>
                          <span className="text-[11px] text-muted">Placed {formatDateTime(order.createdAt)}</span>
                        </div>
                        <p className="text-sm text-ink font-semibold">
                          {isDelivery ? "Will be delivered at approximately " : "Ready for pickup at approximately "}
                          <span className="text-roast text-base font-extrabold underline decoration-roast/40 decoration-2">
                            {formatTime(order.scheduledAt)}
                          </span>{" "}
                          <span className="text-muted text-xs">({formatDeliveryDateLabel(order.scheduledAt)})</span>
                        </p>
                        <p className="text-[11px] text-amber-900/80">
                          {isDelivery
                            ? "Your order has been queued. Our Tupi roasters will begin carving and roasting shortly. Average delivery: 20–30 mins."
                            : "Your order is queued for preparation at our Poblacion counter. Target pickup ready time: " + formatTime(order.scheduledAt) + "."}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : order.status === "COMPLETED" ? (
                  <div className="rounded-2xl border border-leaf/30 bg-leaf-soft/60 p-3 text-xs text-emerald-950">
                    <div className="flex items-center gap-3">
                      <div className="grid h-8 w-8 place-items-center rounded-xl bg-leaf text-white shrink-0 shadow-xs">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <div className="flex-1 flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span className="font-bold text-leaf text-xs block">
                            {isDelivery ? "Order Delivered & Completed" : "Order Picked Up & Completed"}
                          </span>
                          <span className="text-xs text-emerald-900 font-medium">
                            Completed at {formatTime(order.updatedAt || order.scheduledAt)} ({formatDeliveryDateLabel(order.scheduledAt)}) • Salamat sa pag-order!
                          </span>
                        </div>
                        <span className="text-[11px] font-bold text-leaf bg-white/80 px-2.5 py-0.5 rounded-full border border-leaf/20 shadow-xs">
                          🎉 Order Done
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-roast/20 bg-orange-50/50 p-3 text-xs text-amber-950">
                    <div className="flex items-center gap-3">
                      <div className="grid h-8 w-8 place-items-center rounded-xl bg-roast text-white shrink-0 shadow-xs">
                        {order.status === "OUT_FOR_DELIVERY" ? (
                          <Truck className="h-4 w-4 animate-bounce" />
                        ) : (
                          <Flame className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1 flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span className="font-bold text-roast text-xs block">
                            {order.status === "OUT_FOR_DELIVERY"
                              ? "Rider is En Route to Your Address"
                              : isDelivery
                              ? "Estimated Delivery Time:"
                              : "Estimated Pickup Ready Time:"}
                          </span>
                          <span className="text-sm font-extrabold text-ink">
                            {formatTime(order.scheduledAt)}{" "}
                            <span className="text-xs text-muted font-normal">({formatDeliveryDateLabel(order.scheduledAt)})</span>
                          </span>
                        </div>
                        <span className="text-[11px] font-semibold text-muted">
                          Fulfillment Target: {scheduleLabel(order.scheduledAt, order.status)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Items Summary Footer */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted pt-1">
                  <p className="text-ink font-medium line-clamp-1">
                    <span className="text-muted font-normal">Dishes:</span> {itemsSummary}
                  </p>
                  <span>Placed {formatDateTime(order.createdAt)}</span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Official Receipt Modal */}
      <ReceiptModal
        open={Boolean(receiptOrder)}
        order={receiptOrder}
        onClose={() => setReceiptOrder(null)}
      />
    </div>
  );
}
