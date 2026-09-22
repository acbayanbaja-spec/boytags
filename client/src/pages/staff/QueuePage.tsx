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
} from "lucide-react";
import { api } from "@/lib/api";
import { formatDateTime, formatPeso, formatTime, waitingLabel, scheduleLabel } from "@/lib/utils";
import { useRealtime } from "@/hooks/useRealtime";
import { LocationPicker } from "@/components/MapPin";
import { OrderTimeline } from "@/components/OrderTimeline";
import { Button, Card, EmptyState, Modal, Skeleton, StatusBadge } from "@/components/ui";
import { STATUS_LABEL, type Order, type OrderStatus } from "@/types";
import { toast } from "sonner";

export function StaffQueuePage() {
  const queryClient = useQueryClient();
  useRealtime();

  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [search, setSearch] = useState<string>("");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

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
      toast.success(`Order ${updated.orderNumber} advanced to ${STATUS_LABEL[updated.status]}!`);
      void queryClient.invalidateQueries({ queryKey: ["queue"] });
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      if (selectedOrder?.id === updated.id) {
        setSelectedOrder(updated);
      }
    },
    onError: (err: Error) => {
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
      return { label: "Start Roasting (Prep)", nextStatus: "PREPARING" };
    }
    if (order.status === "PREPARING") {
      return { label: "Mark Ready", nextStatus: "READY" };
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-line pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-roast">
            <Flame className="h-4 w-4" />
            <span>Kitchen Queue Management</span>
          </div>
          <h1 className="display text-3xl font-bold text-ink mt-0.5">Quick Order Queue</h1>
          <p className="text-xs text-muted">
            Intelligently sorted by priority, overdue times, and schedule. Keep roast chicken moving without delays.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted" />
            <input
              type="text"
              placeholder="Search order #, customer, phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-line bg-paper pl-9 pr-3 py-2 text-xs outline-none focus:border-roast focus:ring-2 focus:ring-roast/10"
            />
          </div>
          <Button
            variant="outline"
            className="text-xs h-9 px-3"
            onClick={() => void queryClient.invalidateQueries({ queryKey: ["queue"] })}
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1" /> Refresh
          </Button>
        </div>
      </div>

      {/* Filter Tabs Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
          {[
            { key: "ALL", label: `All Active (${queue?.length || 0})` },
            { key: "PENDING", label: "New / Pending" },
            { key: "CONFIRMED", label: "Confirmed" },
            { key: "PREPARING", label: "Preparing / Roasting" },
            { key: "READY", label: "Ready In Warmer" },
            { key: "OUT_FOR_DELIVERY", label: "Out For Delivery" },
            { key: "UNCLAIMED", label: "⚠ Unclaimed" },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setStatusFilter(tab.key)}
              className={`rounded-xl px-3 py-1.5 transition ${
                statusFilter === tab.key
                  ? "bg-roast text-white shadow-sm"
                  : "bg-paper border border-line text-ink hover:border-roast/40"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex rounded-xl bg-paper border border-line p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setTypeFilter("ALL")}
            className={`rounded-lg px-2.5 py-1 transition ${typeFilter === "ALL" ? "bg-cream text-roast" : "text-muted"}`}
          >
            All Types
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter("DELIVERY")}
            className={`rounded-lg px-2.5 py-1 transition ${typeFilter === "DELIVERY" ? "bg-cream text-roast" : "text-muted"}`}
          >
            Delivery
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter("PICKUP")}
            className={`rounded-lg px-2.5 py-1 transition ${typeFilter === "PICKUP" ? "bg-cream text-roast" : "text-muted"}`}
          >
            Pickup
          </button>
        </div>
      </div>

      {/* Queue Cards Grid */}
      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64 w-full rounded-2xl" />
          ))}
        </div>
      ) : filteredQueue.length === 0 ? (
        <EmptyState
          title="Queue is Clear!"
          body="All orders in this view have been fulfilled or there are no active tickets at this moment."
        />
      ) : (
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
                    ? "border-2 border-red-500 bg-red-50/20"
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
                        <span className="display text-lg font-bold text-ink">{order.orderNumber}</span>
                        <StatusBadge status={order.status} />
                      </div>
                      <p className="text-xs text-muted mt-0.5">
                        Customer: <strong className="text-ink">{order.customer?.name}</strong>
                      </p>
                    </div>

                    <div className="text-right">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
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
                  <div className="py-3 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-muted">
                      <span className="flex items-center gap-1.5">
                        {isDelivery ? <Truck className="h-3.5 w-3.5 text-roast" /> : <Store className="h-3.5 w-3.5 text-roast" />}
                        <strong>{isDelivery ? "Delivery" : "Store Pickup"}</strong>
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-ink">
                        <Clock className="h-3.5 w-3.5 text-muted" />
                        {formatTime(order.scheduledAt)}
                      </span>
                    </div>

                    {/* Items List */}
                    <div className="rounded-xl bg-cream p-2.5 space-y-1">
                      <p className="text-[11px] font-semibold text-muted uppercase">Kitchen Items:</p>
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between font-medium text-ink">
                          <span>
                            {item.quantity}× {item.productName}
                          </span>
                          <span className="text-muted font-normal">{formatPeso(item.lineTotal)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Customer Notes */}
                    {order.customerNotes && (
                      <p className="text-[11px] text-roast italic">
                        <strong>Kitchen Note:</strong> {order.customerNotes}
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
                  <Button
                    variant="outline"
                    className="h-9 px-3 text-xs"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <Eye className="h-3.5 w-3.5 mr-1" />
                    Details
                  </Button>

                  {action ? (
                    <Button
                      className="flex-1 h-9 text-xs font-semibold shadow-sm"
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

      {/* Order Details & Audit History Modal */}
      <Modal
        open={Boolean(selectedOrder)}
        title={selectedOrder ? `Order ${selectedOrder.orderNumber} Inspection` : ""}
        onClose={() => setSelectedOrder(null)}
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
                <div className="h-48 rounded-xl overflow-hidden border border-line">
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

            <div className="pt-2 flex justify-end">
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
