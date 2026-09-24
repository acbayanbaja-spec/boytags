import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Clock,
  Truck,
  Store,
  CheckCircle2,
  Flame,
  Search,
  AlertTriangle,
  ChevronRight,
  MapPin,
  Phone,
  Eye,
  ArrowRight,
  RefreshCw,
  XCircle,
  Printer,
  Columns,
  LayoutGrid,
} from "lucide-react";
import { api } from "@/lib/api";
import { formatDateTime, formatPeso, formatTime, waitingLabel } from "@/lib/utils";
import { sound } from "@/lib/sound";
import { useRealtime } from "@/hooks/useRealtime";
import { LocationPicker } from "@/components/MapPin";
import { OrderTimeline } from "@/components/OrderTimeline";
import { KitchenTicketModal } from "@/components/KitchenTicketModal";
import { Button, Card, EmptyState, Modal, Skeleton, StatusBadge } from "@/components/ui";
import { STATUS_LABEL, type Order, type OrderStatus } from "@/types";
import { toast } from "sonner";

export function StaffQueuePage() {
  const queryClient = useQueryClient();
  useRealtime();

  const [viewMode, setViewMode] = useState<"grid" | "kanban">("grid");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [ticketToPrint, setTicketToPrint] = useState<Order | null>(null);

  const { data: queue, isLoading } = useQuery<Order[]>({
    queryKey: ["queue"],
    queryFn: () => api<Order[]>("/api/orders/queue"),
    refetchInterval: 5000,
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      api<Order>(`/api/orders/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onSuccess: (updated) => {
      sound.play("advance");
      toast.success(`Order ${updated.orderNumber} advanced to ${STATUS_LABEL[updated.status]}!`);
      void queryClient.invalidateQueries({ queryKey: ["queue"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      if (selectedOrder?.id === updated.id) {
        setSelectedOrder(updated);
      }
    },
    onError: (err: Error) => {
      sound.play("alert");
      toast.error(err.message || "Failed to update status.");
    },
  });

  const filteredQueue = useMemo(() => {
    if (!queue) return [];
    return queue.filter((order) => {
      const matchStatus = statusFilter === "ALL" || order.status === statusFilter;
      const matchType = typeFilter === "ALL" || order.type === typeFilter;
      const matchSearch =
        !search.trim() ||
        order.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        order.customer?.name.toLowerCase().includes(search.toLowerCase()) ||
        order.customer?.phone?.toLowerCase().includes(search.toLowerCase());
      return matchStatus && matchType && matchSearch;
    });
  }, [queue, statusFilter, typeFilter, search]);

  function getNextAction(order: Order): { label: string; nextStatus: OrderStatus } | null {
    if (order.status === "PENDING") {
      return { label: "Confirm Order", nextStatus: "CONFIRMED" };
    }
    if (order.status === "CONFIRMED") {
      return { label: "Start Roasting (Pit)", nextStatus: "PREPARING" };
    }
    if (order.status === "PREPARING") {
      return { label: "Mark Ready (Warmer)", nextStatus: "READY" };
    }
    if (order.status === "READY") {
      if (order.type === "DELIVERY") {
        return { label: "Dispatch with Rider", nextStatus: "OUT_FOR_DELIVERY" };
      }
      return { label: "Hand Over (Complete)", nextStatus: "COMPLETED" };
    }
    if (order.status === "OUT_FOR_DELIVERY") {
      return { label: "Delivered (Complete)", nextStatus: "COMPLETED" };
    }
    if (order.status === "UNCLAIMED") {
      return { label: "Claimed (Complete)", nextStatus: "COMPLETED" };
    }
    return null;
  }

  const kanbanColumns: Array<{ title: string; status: OrderStatus; color: string }> = [
    { title: "Incoming / New", status: "PENDING", color: "border-amber-400 bg-amber-50/30" },
    { title: "Roasting Pit", status: "PREPARING", color: "border-orange-400 bg-orange-50/30" },
    { title: "Warmer / Packing", status: "READY", color: "border-emerald-400 bg-emerald-50/30" },
    { title: "With Rider", status: "OUT_FOR_DELIVERY", color: "border-indigo-400 bg-indigo-50/30" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-line pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-roast mb-1">
            <Flame className="h-4 w-4" />
            <span>Poblacion, Tupi Kitchen Display System (KDS)</span>
          </div>
          <h1 className="display text-3xl font-bold text-ink">Live Order Queue</h1>
          <p className="text-xs text-muted">
            Prioritized by target claim time, rotisserie capacity, and rider delivery schedules in Tupi.
          </p>
        </div>

        {/* View Mode & Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Grid vs Kanban View Toggle */}
          <div className="flex rounded-xl bg-paper border border-line p-1 text-xs font-semibold shadow-sm">
            <button
              type="button"
              onClick={() => {
                sound.play("click");
                setViewMode("grid");
              }}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition ${
                viewMode === "grid" ? "bg-roast text-white font-bold" : "text-muted hover:text-ink"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" /> Tickets
            </button>
            <button
              type="button"
              onClick={() => {
                sound.play("click");
                setViewMode("kanban");
              }}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition ${
                viewMode === "kanban" ? "bg-roast text-white font-bold" : "text-muted hover:text-ink"
              }`}
            >
              <Columns className="h-3.5 w-3.5" /> KDS Kanban
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="text-xs h-9 px-3"
            onClick={() => {
              sound.play("click");
              void queryClient.invalidateQueries({ queryKey: ["queue"] });
              toast.success("Queue refreshed.");
            }}
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1" /> Refresh
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
          {[
            { key: "ALL", label: `All Active (${queue?.length || 0})` },
            { key: "PENDING", label: "New" },
            { key: "CONFIRMED", label: "Confirmed" },
            { key: "PREPARING", label: "Roasting" },
            { key: "READY", label: "Warmer" },
            { key: "OUT_FOR_DELIVERY", label: "Delivery" },
            { key: "UNCLAIMED", label: "⚠ Unclaimed" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                sound.play("click");
                setStatusFilter(tab.key);
              }}
              className={`rounded-xl px-3 py-1.5 transition ${
                statusFilter === tab.key
                  ? "bg-roast text-white font-bold shadow-sm"
                  : "bg-paper border border-line text-ink hover:border-roast/40"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-muted" />
            <input
              type="text"
              placeholder="Search #, name, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-line bg-paper pl-9 pr-3 py-1.5 text-xs outline-none focus:border-roast"
            />
          </div>

          <div className="flex rounded-xl bg-paper border border-line p-1 text-xs font-semibold shrink-0">
            <button
              type="button"
              onClick={() => setTypeFilter("ALL")}
              className={`rounded-lg px-2.5 py-1 transition ${typeFilter === "ALL" ? "bg-cream text-roast font-bold" : "text-muted"}`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter("DELIVERY")}
              className={`rounded-lg px-2.5 py-1 transition ${typeFilter === "DELIVERY" ? "bg-cream text-roast font-bold" : "text-muted"}`}
            >
              Delivery
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter("PICKUP")}
              className={`rounded-lg px-2.5 py-1 transition ${typeFilter === "PICKUP" ? "bg-cream text-roast font-bold" : "text-muted"}`}
            >
              Pickup
            </button>
          </div>
        </div>
      </div>

      {/* Main View Display */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64 w-full rounded-3xl" />
          ))}
        </div>
      ) : filteredQueue.length === 0 ? (
        <EmptyState
          title="Kitchen Queue is Clear!"
          body="All orders in this view have been fulfilled or there are no active tickets at this moment. Pit ready for next orders!"
        />
      ) : viewMode === "kanban" ? (
        /* KDS Kanban Rail View */
        <div className="grid gap-4 md:grid-cols-4 items-start">
          {kanbanColumns.map((col) => {
            const colOrders = filteredQueue.filter((o) => o.status === col.status);
            return (
              <div key={col.status} className={`rounded-3xl border ${col.color} p-4 space-y-3 min-h-[500px]`}>
                <div className="flex items-center justify-between border-b border-line pb-2">
                  <span className="font-bold text-xs uppercase tracking-wider text-ink">{col.title}</span>
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-roast text-[10px] font-bold text-white">
                    {colOrders.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {colOrders.map((order) => {
                    const action = getNextAction(order);
                    return (
                      <Card key={order.id} className="p-3.5 space-y-2 bg-paper shadow-sm hover:shadow-md transition">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-sm text-ink">{order.orderNumber}</span>
                          <span className="text-[10px] bg-cream px-1.5 py-0.5 rounded font-bold uppercase text-muted border border-line">
                            {order.type}
                          </span>
                        </div>
                        <p className="text-[11px] font-semibold text-ink truncate">{order.customer?.name}</p>
                        <div className="rounded-xl bg-cream p-2 text-[10px] space-y-0.5">
                          {order.items.map((i) => (
                            <p key={i.id} className="font-medium truncate">
                              {i.quantity}× {i.productName}
                            </p>
                          ))}
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-line/60">
                          <span className="text-[10px] text-muted flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {formatTime(order.scheduledAt)}
                          </span>
                          <div className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => setTicketToPrint(order)}
                              className="rounded-lg p-1 text-muted hover:text-ink hover:bg-cream"
                              title="Print thermal slip"
                            >
                              <Printer className="h-3.5 w-3.5" />
                            </button>
                            {action && (
                              <Button
                                size="sm"
                                className="h-6 px-2 text-[10px] font-bold"
                                loading={statusMutation.isPending}
                                onClick={() =>
                                  statusMutation.mutate({ id: order.id, status: action.nextStatus })
                                }
                              >
                                {action.label.split(" ")[0]} →
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Regular Ticket Grid View */
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredQueue.map((order) => {
            const isDelivery = order.type === "DELIVERY";
            const action = getNextAction(order);
            const isUrgent = order.priority === "URGENT" || order.status === "UNCLAIMED";
            const isHigh = order.priority === "HIGH";

            return (
              <Card
                key={order.id}
                className={`flex flex-col justify-between p-5 transition shadow-sm hover:shadow-md ${
                  isUrgent
                    ? "border-2 border-red-500 bg-red-50/30"
                    : isHigh
                    ? "border-amber-400 bg-amber-50/20"
                    : "border-line bg-paper"
                }`}
              >
                <div>
                  {/* Top Bar: Order Number & Priority */}
                  <div className="flex items-start justify-between gap-2 border-b border-line/70 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="display text-xl font-bold text-ink">{order.orderNumber}</span>
                        <StatusBadge status={order.status} />
                      </div>
                      <p className="text-xs text-muted mt-0.5">
                        Customer: <strong className="text-ink">{order.customer?.name}</strong>
                      </p>
                    </div>

                    <div className="text-right">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                          isUrgent
                            ? "bg-red-600 text-white animate-pulse"
                            : isHigh
                            ? "bg-amber-500 text-white"
                            : "bg-cream text-muted border border-line"
                        }`}
                      >
                        {order.status === "UNCLAIMED" ? "UNCLAIMED" : `${order.priority} PRIORITY`}
                      </span>
                      <p className="text-[10px] text-muted mt-1">{waitingLabel(order.createdAt)}</p>
                    </div>
                  </div>

                  {/* Operational Details */}
                  <div className="py-3 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between text-muted">
                      <span className="flex items-center gap-1.5 font-bold">
                        {isDelivery ? <Truck className="h-3.5 w-3.5 text-roast" /> : <Store className="h-3.5 w-3.5 text-roast" />}
                        <span>{isDelivery ? "Delivery in Tupi" : "Store Counter Pickup"}</span>
                      </span>
                      <span className="flex items-center gap-1 font-bold text-ink">
                        <Clock className="h-3.5 w-3.5 text-muted" />
                        Target: {formatTime(order.scheduledAt)}
                      </span>
                    </div>

                    {/* Items List */}
                    <div className="rounded-2xl bg-cream p-3 space-y-1.5">
                      <span className="text-[10px] font-bold text-muted uppercase tracking-wider block">
                        Kitchen Items to Pack:
                      </span>
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between font-bold text-ink text-xs">
                          <span>
                            {item.quantity}× {item.productName}
                          </span>
                          <span className="text-muted font-normal">{formatPeso(item.lineTotal)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Customer Notes */}
                    {order.customerNotes && (
                      <p className="text-[11px] text-roast italic bg-amber-50 p-2 rounded-xl border border-amber-200">
                        <strong>Kitchen Special Note:</strong> {order.customerNotes}
                      </p>
                    )}

                    {/* Delivery Landmark */}
                    {isDelivery && order.delivery?.landmark && (
                      <p className="text-[11px] text-muted">
                        <strong>Landmark:</strong> {order.delivery.landmark}
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="border-t border-line/70 pt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      sound.play("click");
                      setTicketToPrint(order);
                    }}
                    className="rounded-xl border border-line bg-paper p-2 hover:bg-cream transition"
                    title="Print KDS Slip"
                  >
                    <Printer className="h-4 w-4 text-ink" />
                  </button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 px-3 text-xs"
                    onClick={() => {
                      sound.play("click");
                      setSelectedOrder(order);
                    }}
                  >
                    <Eye className="h-3.5 w-3.5 mr-1" />
                    Inspect
                  </Button>

                  {action ? (
                    <Button
                      size="sm"
                      className="flex-1 h-9 text-xs font-bold shadow-sm"
                      loading={statusMutation.isPending}
                      onClick={() =>
                        statusMutation.mutate({
                          id: order.id,
                          status: action.nextStatus,
                        })
                      }
                    >
                      {action.label}
                      <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                  ) : null}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Thermal Ticket Printer Modal */}
      <KitchenTicketModal
        open={Boolean(ticketToPrint)}
        order={ticketToPrint}
        onClose={() => setTicketToPrint(null)}
      />

      {/* Order Details & Audit History Modal */}
      <Modal
        open={Boolean(selectedOrder)}
        title={selectedOrder ? `Order ${selectedOrder.orderNumber} Inspection` : ""}
        onClose={() => setSelectedOrder(null)}
        maxWidth="max-w-lg"
      >
        {selectedOrder && (
          <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1 text-xs">
            <div className="flex items-center justify-between border-b border-line pb-2">
              <div>
                <p className="font-bold text-sm text-ink">{selectedOrder.customer?.name}</p>
                <p className="text-muted">
                  Phone: <strong>{selectedOrder.delivery?.contactPhone || selectedOrder.customer?.phone || "None"}</strong>
                </p>
              </div>
              <StatusBadge status={selectedOrder.status} />
            </div>

            <div className="space-y-1">
              <span className="font-bold uppercase tracking-wider text-[10px] text-muted">Items:</span>
              {selectedOrder.items.map((item) => (
                <div key={item.id} className="flex justify-between border-b border-line/40 py-1">
                  <span>{item.quantity}× {item.productName}</span>
                  <span className="font-bold">{formatPeso(item.lineTotal)}</span>
                </div>
              ))}
              <div className="flex justify-between pt-1 font-bold text-sm">
                <span>Total Amount</span>
                <span className="text-roast">{formatPeso(selectedOrder.total)}</span>
              </div>
            </div>

            {selectedOrder.type === "DELIVERY" && selectedOrder.delivery && (
              <div className="space-y-2 border-t border-line pt-2">
                <span className="font-bold uppercase tracking-wider text-[10px] text-muted">Delivery Pinpoint:</span>
                <p><strong>Address:</strong> {selectedOrder.delivery.address}</p>
                {selectedOrder.delivery.landmark && <p><strong>Landmark:</strong> {selectedOrder.delivery.landmark}</p>}
                {selectedOrder.delivery.notes && <p><strong>Notes:</strong> {selectedOrder.delivery.notes}</p>}
                <div className="h-44 rounded-xl overflow-hidden border border-line">
                  <LocationPicker
                    lat={Number(selectedOrder.delivery.latitude)}
                    lng={Number(selectedOrder.delivery.longitude)}
                    readOnly
                  />
                </div>
              </div>
            )}

            <div className="border-t border-line pt-2 space-y-2">
              <span className="font-bold uppercase tracking-wider text-[10px] text-muted">Change History:</span>
              <OrderTimeline history={selectedOrder.history || []} />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setTicketToPrint(selectedOrder);
                }}
              >
                <Printer className="h-3.5 w-3.5 mr-1" /> Print Slip
              </Button>
              <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
