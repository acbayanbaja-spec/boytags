import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ClipboardList, ArrowRight, Truck, Store, Clock, RotateCcw, Printer } from "lucide-react";
import { api } from "@/lib/api";
import { formatDateTime, formatPeso, scheduleLabel } from "@/lib/utils";
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
          imageUrl: "/images/dishes/whole-lechon.jpg",
          availableQty: 20,
          soldOut: false,
          active: true,
          category: { id: "cat_lechon", name: "Lechon Manok", slug: "lechon-manok" },
        },
        item.quantity,
      );
    });
    toast.success(`Items from order ${order.orderNumber} re-added to your cart!`);
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
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 hover:border-roast/40 transition hover:shadow-md"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="display font-bold text-lg text-ink">{order.orderNumber}</span>
                    <StatusBadge status={order.status} />
                    <span className="inline-flex items-center gap-1 rounded-full bg-cream border border-line px-2.5 py-0.5 text-[11px] font-medium text-muted">
                      {isDelivery ? <Truck className="h-3 w-3 text-roast" /> : <Store className="h-3 w-3 text-roast" />}
                      {isDelivery ? "Delivery in Tupi" : "Pickup (Poblacion HQ)"}
                    </span>
                  </div>

                  <p className="text-xs text-ink font-medium line-clamp-1">
                    <span className="text-muted font-normal">Dishes:</span> {itemsSummary}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-roast" />
                      Target: <strong>{scheduleLabel(order.scheduledAt)}</strong>
                    </span>
                    <span>Placed {formatDateTime(order.createdAt)}</span>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between border-t border-line/60 pt-3 sm:border-0 sm:pt-0 gap-2 shrink-0">
                  <span className="display text-xl font-bold text-roast">{formatPeso(order.total)}</span>
                  <div className="flex items-center gap-2">
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
