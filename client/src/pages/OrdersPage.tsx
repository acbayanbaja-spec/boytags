import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Truck,
  Store,
  Clock,
  RotateCcw,
  Printer,
  CheckCircle2,
  Flame,
  Timer,
  CalendarClock,
  AlertTriangle,
  WifiOff,
} from "lucide-react";
import { api, useConnectionStatus } from "@/lib/api";
import { countdownLabel, formatDateTime, formatPeso, formatTime, formatDeliveryDateLabel, formatDateLong } from "@/lib/utils";
import { sound } from "@/lib/sound";
import { useCart } from "@/context/CartContext";
import { useRealtime } from "@/hooks/useRealtime";
import { Button, Card, EmptyState, Skeleton, StatusBadge, SafeImage } from "@/components/ui";
import { ReceiptModal } from "@/components/ReceiptModal";
import type { Order } from "@/types";
import { toast } from "sonner";

const ACTIVE_STATUSES = ["PENDING", "CONFIRMED", "PREPARING", "READY", "OUT_FOR_DELIVERY", "UNCLAIMED"];

function useTicker(intervalMs = 15000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

function progressIndex(order: Order): number {
  switch (order.status) {
    case "PENDING":
      return 0;
    case "CONFIRMED":
      return 1;
    case "PREPARING":
      return 2;
    case "READY":
      return 3;
    case "OUT_FOR_DELIVERY":
      return 4;
    case "COMPLETED":
      return 5;
    default:
      return -1;
  }
}

function OrderProgress({ order }: { order: Order }) {
  if (["CANCELLED", "UNCLAIMED"].includes(order.status)) {
    return (
      <p className="text-[11px] font-bold text-danger flex items-center gap-1.5">
        <AlertTriangle className="h-3.5 w-3.5" />
        {order.status === "UNCLAIMED" ? "Waiting to be claimed — contact the store" : "This order was cancelled"}
      </p>
    );
  }
  const idx = progressIndex(order);
  const steps =
    order.type === "DELIVERY"
      ? ["Received", "Confirmed", "Roasting", "Ready", "On the way", "Delivered"]
      : ["Received", "Confirmed", "Roasting", "Ready", "Picked up"];
  const current = order.type === "PICKUP" && idx === 4 ? 4 : idx;
  return (
    <div className="flex items-center gap-1" role="progressbar" aria-valuenow={current + 1} aria-valuemin={1} aria-valuemax={steps.length}>
      {steps.map((label, i) => (
        <div key={label} className="flex items-center gap-1">
          <div className="flex flex-col items-center gap-1">
            <span
              className={`h-2 w-2 rounded-full transition ${
                i < current ? "bg-leaf" : i === current ? "bg-roast ring-4 ring-roast/15" : "bg-line"
              }`}
            />
            <span className={`hidden xl:block text-[9px] font-semibold uppercase tracking-wide ${i === current ? "text-roast" : "text-muted"}`}>
              {label}
            </span>
          </div>
          {i < steps.length - 1 && <span className={`h-0.5 w-4 sm:w-6 rounded ${i < current ? "bg-leaf/60" : "bg-line"}`} />}
        </div>
      ))}
    </div>
  );
}

export function OrdersPage() {
  const [filter, setFilter] = useState<"all" | "active" | "completed" | "cancelled">("all");
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);
  const { add } = useCart();
  const navigate = useNavigate();
  const connection = useConnectionStatus();
  const now = useTicker();
  useRealtime();

  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["orders"],
    queryFn: () => api<Order[]>("/api/orders"),
    refetchInterval: 12000,
  });

  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    if (filter === "all") return orders;
    if (filter === "active") return orders.filter((o) => ACTIVE_STATUSES.includes(o.status));
    if (filter === "completed") return orders.filter((o) => o.status === "COMPLETED");
    if (filter === "cancelled") return orders.filter((o) => o.status === "CANCELLED");
    return orders;
  }, [orders, filter]);

  const counts = useMemo(() => {
    const list = orders || [];
    return {
      all: list.length,
      active: list.filter((o) => ACTIVE_STATUSES.includes(o.status)).length,
      completed: list.filter((o) => o.status === "COMPLETED").length,
      cancelled: list.filter((o) => o.status === "CANCELLED").length,
    };
  }, [orders]);

  function handleReorder(order: Order) {
    sound.play("add");
    order.items.forEach((item) => {
      add(
        {
          id: item.productId,
          name: item.productName,
          slug: item.product?.slug || item.productName.toLowerCase().replace(/\s+/g, "-"),
          description: item.product?.description || "Re-ordered specialty dish",
          price: item.unitPrice,
          imageUrl: item.product?.imageUrl || "/images/whole-lechon-manok.jpg",
          availableQty: item.product?.availableQty ?? 20,
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
    /* Break out of the shell's max-w-6xl main so My Orders can use the full screen width. */
    <div className="-mx-4 px-4 sm:-mx-4 sm:px-6 xl:px-10 2xl:max-w-[1680px] 2xl:mx-auto">
      <div className="space-y-6 py-4">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-line pb-4">
          <div>
            <h1 className="display text-3xl font-bold text-ink">My Orders</h1>
            <p className="text-xs text-muted mt-0.5">
              Live deliveries across Tupi, scheduled pickups, and official receipts — refreshed in real time.
            </p>
          </div>

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
                <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] ${filter === tab ? "bg-white/20" : "bg-cream text-muted"}`}>
                  {counts[tab]}
                </span>
              </button>
            ))}
          </div>
        </div>

        {connection === "offline" && (
          <div className="flex items-center gap-2 rounded-2xl border border-danger/30 bg-rose-50 p-3 text-xs font-semibold text-danger">
            <WifiOff className="h-4 w-4 shrink-0" />
            Not connected to the kitchen server — the orders below may be local demo data and new orders will not be saved.
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-44 w-full rounded-3xl" />
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
          <div className="grid gap-5 2xl:grid-cols-2">
            {filteredOrders.map((order) => {
              const isDelivery = order.type === "DELIVERY";
              const isCompleted = order.status === "COMPLETED";
              const isActive = ACTIVE_STATUSES.includes(order.status);
              const scheduled = new Date(order.scheduledAt).getTime();
              const overdue = isActive && scheduled < now;
              const autoCancelSoon =
                order.status === "PENDING" && order.autoCancelAt
                  ? new Date(order.autoCancelAt).getTime() <= now + 5 * 60 * 1000
                  : false;

              return (
                <Card key={order.id} className="flex flex-col gap-4 p-5 sm:p-6 hover:border-roast/40 transition hover:shadow-lg">
                  {/* Row 1: identity + money + actions */}
                  <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 border-b border-line/60 pb-3">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="display font-bold text-xl text-ink">{order.orderNumber}</span>
                      <StatusBadge status={order.status} />
                      <span className="inline-flex items-center gap-1 rounded-full bg-cream border border-line px-2.5 py-0.5 text-[11px] font-medium text-muted">
                        {isDelivery ? <Truck className="h-3 w-3 text-roast" /> : <Store className="h-3 w-3 text-roast" />}
                        {isDelivery ? "Delivery in Tupi" : "Pickup (Poblacion HQ)"}
                      </span>
                      {overdue && !isCompleted && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 border border-rose-300 px-2.5 py-0.5 text-[11px] font-bold text-rose-700">
                          <AlertTriangle className="h-3 w-3" />
                          {countdownLabel(order.scheduledAt)}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <span className="display text-2xl font-bold text-roast">{formatPeso(order.total)}</span>
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
                        <Button variant="outline" size="sm" onClick={() => handleReorder(order)} className="text-xs font-semibold" title="Re-order all items">
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

                  {/* Row 2: wide two-column body */}
                  <div className="grid gap-5 lg:grid-cols-5">
                    {/* Left: dishes with photos */}
                    <div className="lg:col-span-3 space-y-2.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Dishes in this order</p>
                      <div className="flex flex-wrap gap-2.5">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-2.5 rounded-2xl border border-line bg-cream/50 p-1.5 pr-3 min-w-[180px] flex-1"
                          >
                            <SafeImage
                              src={item.product?.imageUrl || "/images/whole-lechon-manok.jpg"}
                              alt={item.productName}
                              className="h-12 w-12 shrink-0 rounded-xl"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-ink truncate">{item.productName}</p>
                              <p className="text-[11px] text-muted">
                                {item.quantity} × {formatPeso(item.unitPrice)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right: schedule + countdown + progress */}
                    <div className="lg:col-span-2 flex flex-col justify-between gap-3 rounded-2xl border border-line bg-paper p-3.5">
                      <div className="space-y-1.5">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                          <CalendarClock className="h-3.5 w-3.5 text-roast" />
                          {isDelivery ? "Delivery slot" : "Pickup slot"}
                        </p>
                        <p className="text-sm font-extrabold text-ink">
                          {formatDateLong(order.scheduledAt)} · <span className="text-roast">{formatTime(order.scheduledAt)}</span>
                        </p>
                        {isActive && (
                          <p className={`text-xs font-bold flex items-center gap-1.5 ${overdue ? "text-danger" : "text-leaf"}`}>
                            <Timer className={`h-3.5 w-3.5 ${overdue ? "animate-pulse" : ""}`} />
                            {overdue
                              ? `${isDelivery ? "Delivery" : "Pickup"} is late — ${countdownLabel(order.scheduledAt).replace("in ", "")}`
                              : `${isDelivery ? "Arriving" : "Ready"} ${countdownLabel(order.scheduledAt)}`}
                          </p>
                        )}
                        {autoCancelSoon && (
                          <p className="text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg px-2 py-1">
                            Awaiting kitchen confirmation — auto-cancels {countdownLabel(order.autoCancelAt!)}
                          </p>
                        )}
                      </div>
                      <OrderProgress order={order} />
                    </div>
                  </div>

                  {/* Row 3: status highlight banner */}
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
                  ) : isCompleted ? (
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
                  ) : order.status === "CANCELLED" ? (
                    <div className="rounded-2xl border border-line bg-cream/60 p-3 text-xs text-muted flex items-center gap-3">
                      <div className="grid h-8 w-8 place-items-center rounded-xl bg-rose-100 text-danger shrink-0">
                        <AlertTriangle className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="font-bold text-ink text-xs block">Order Cancelled</span>
                        <span>{order.cancelReason || "This order was cancelled. Tap Reorder-style tracking below or place a fresh order anytime."}</span>
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
                            {order.status === "OUT_FOR_DELIVERY" ? "Arriving " : "Target "}
                            {countdownLabel(order.scheduledAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Row 4: footer */}
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted pt-1 border-t border-line/60">
                    <p className="text-ink font-medium line-clamp-1">
                      <span className="text-muted font-normal">Placed:</span> {formatDateTime(order.createdAt)}
                    </p>
                    {order.customerNotes && (
                      <p className="text-[11px] italic line-clamp-1 max-w-[50%]">Note: {order.customerNotes}</p>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Official Receipt Modal */}
        <ReceiptModal open={Boolean(receiptOrder)} order={receiptOrder} onClose={() => setReceiptOrder(null)} />
      </div>
    </div>
  );
}
