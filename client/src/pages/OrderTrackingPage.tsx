import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  Flame,
  MapPin,
  Phone,
  Truck,
  Store,
  AlertTriangle,
  XCircle,
  Edit3,
  Calendar,
  ChevronLeft,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { api } from "@/lib/api";
import { formatDateTime, formatPeso, formatTime } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useRealtime } from "@/hooks/useRealtime";
import { LocationPicker } from "@/components/MapPin";
import { OrderTimeline } from "@/components/OrderTimeline";
import { Button, Card, Field, Modal, Skeleton, StatusBadge, inputClass } from "@/components/ui";
import { STATUS_LABEL, type Order, type OrderStatus } from "@/types";
import { toast } from "sonner";

export function OrderTrackingPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  useRealtime();

  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [editNotes, setEditNotes] = useState("");
  const [editSchedule, setEditSchedule] = useState("");

  const { data: order, isLoading, error } = useQuery<Order>({
    queryKey: ["order", id],
    queryFn: () => api<Order>(`/api/orders/${id}`),
    refetchInterval: 5000, // automatic backup polling alongside SSE
  });

  const cancelMutation = useMutation({
    mutationFn: (reason: string) =>
      api<Order>(`/api/orders/${id}/cancel`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      }),
    onSuccess: () => {
      toast.success("Order cancelled successfully. Inventory has been restored.");
      setCancelOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["order", id] });
      void queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Could not cancel order.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (input: { customerNotes?: string; scheduledAt?: string }) =>
      api<Order>(`/api/orders/${id}`, {
        method: "PATCH",
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      toast.success("Order details updated.");
      setEditOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["order", id] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update order.");
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6 py-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-80 w-full rounded-2xl" />
          <Skeleton className="h-80 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="py-12 text-center space-y-4">
        <h2 className="display text-2xl font-bold text-ink">Order Not Found</h2>
        <p className="text-sm text-muted">We couldn't retrieve this order. Please verify your order number.</p>
        <Link to="/orders">
          <Button variant="outline">Back to My Orders</Button>
        </Link>
      </div>
    );
  }

  const isDelivery = order.type === "DELIVERY";
  const stages: OrderStatus[] = isDelivery
    ? ["PENDING", "CONFIRMED", "PREPARING", "READY", "OUT_FOR_DELIVERY", "COMPLETED"]
    : ["PENDING", "CONFIRMED", "PREPARING", "READY", "COMPLETED"];

  const currentIndex = stages.indexOf(order.status);
  const isCancelled = order.status === "CANCELLED";
  const isUnclaimed = order.status === "UNCLAIMED";

  const canCancel = ["PENDING", "CONFIRMED", "PREPARING"].includes(order.status);
  const canEdit = ["PENDING", "CONFIRMED"].includes(order.status);

  return (
    <div className="space-y-8 py-4">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-line pb-4">
        <div className="flex items-center gap-3">
          <Link to="/orders" className="rounded-xl border border-line p-2 hover:bg-paper transition" aria-label="Back">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="display text-2xl font-bold text-ink">Order {order.orderNumber}</h1>
              <StatusBadge status={order.status} />
            </div>
            <p className="text-xs text-muted">
              Placed on {formatDateTime(order.createdAt)} • {isDelivery ? "Doorstep Delivery" : "Store Pickup"}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {canEdit && (
            <Button
              variant="outline"
              onClick={() => {
                setEditNotes(order.customerNotes || "");
                setEditOpen(true);
              }}
              className="text-xs"
            >
              <Edit3 className="h-3.5 w-3.5 mr-1" />
              Modify Order
            </Button>
          )}

          {canCancel && (
            <Button
              variant="danger"
              onClick={() => setCancelOpen(true)}
              className="text-xs"
            >
              <XCircle className="h-3.5 w-3.5 mr-1" />
              Cancel Order
            </Button>
          )}
        </div>
      </div>

      {/* Unclaimed Order Banner */}
      {isUnclaimed && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl border-2 border-red-500 bg-red-50 p-5 text-red-900 shadow-md"
        >
          <div className="flex items-start gap-4">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-red-600 text-white">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-base">⚠ Unclaimed Order Alert — Awaiting Claim</h3>
              <p className="text-xs leading-relaxed text-red-800">
                This order was scheduled for <strong>{formatTime(order.scheduledAt)}</strong> and has not yet been received.
                Your hot roast chicken is being held securely in the kitchen warming chamber. Please pick it up immediately
                or contact store staff at <strong>(049) 530-0192</strong>.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Cancelled Alert Banner */}
      {isCancelled && (
        <div className="rounded-2xl border border-rose-300 bg-rose-50 p-5 text-rose-900">
          <div className="flex items-center gap-3">
            <XCircle className="h-6 w-6 text-rose-600 shrink-0" />
            <div>
              <h3 className="font-bold text-sm">This order was cancelled</h3>
              <p className="text-xs text-rose-700 mt-0.5">
                Reason: {order.cancelReason || "Cancelled by customer or store staff."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* State Machine Visual Progress Track */}
      {!isCancelled && !isUnclaimed && (
        <Card className="p-6">
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-line pb-4">
            <div>
              <h2 className="display text-lg font-bold text-ink">Preparation & Fulfillment Progress</h2>
              <p className="text-xs text-muted">
                Estimated schedule: <strong className="text-ink">{formatDateTime(order.scheduledAt)}</strong>
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-leaf font-semibold bg-leaf-soft px-3 py-1 rounded-full">
              <span className="h-2 w-2 rounded-full bg-leaf animate-pulse" />
              <span>Live Kitchen Tracker</span>
            </div>
          </div>

          <div className="relative grid grid-cols-3 sm:grid-cols-6 gap-2">
            {stages.map((stage, idx) => {
              const isPast = currentIndex > idx;
              const isCurrent = currentIndex === idx;

              return (
                <div key={stage} className="flex flex-col items-center text-center">
                  <div
                    className={`grid h-10 w-10 place-items-center rounded-2xl text-xs font-bold transition shadow-sm ${
                      isCurrent
                        ? "bg-roast text-white ring-4 ring-roast/20"
                        : isPast
                        ? "bg-leaf text-white"
                        : "bg-cream text-muted border border-line"
                    }`}
                  >
                    {isPast ? <CheckCircle2 className="h-5 w-5" /> : idx + 1}
                  </div>
                  <span
                    className={`mt-2 text-xs font-semibold leading-tight ${
                      isCurrent ? "text-roast font-bold" : isPast ? "text-ink" : "text-muted"
                    }`}
                  >
                    {STATUS_LABEL[stage]}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Main Details Grid */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Left Column: Items & Delivery Information */}
        <div className="space-y-6 lg:col-span-7">
          {/* Items card */}
          <Card className="p-6 space-y-4">
            <h2 className="display text-lg font-bold text-ink">Ordered Items</h2>

            <div className="divide-y divide-line">
              {order.items.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between text-xs sm:text-sm">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-ink">{item.productName}</p>
                    <p className="text-muted text-[11px]">
                      {item.quantity} × {formatPeso(item.unitPrice)}
                    </p>
                  </div>
                  <span className="font-bold text-ink">{formatPeso(item.lineTotal)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-1.5 border-t border-line pt-3 text-xs sm:text-sm">
              <div className="flex justify-between text-muted">
                <span>Subtotal</span>
                <span>{formatPeso(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Delivery Fee</span>
                <span>{formatPeso(order.deliveryFee)}</span>
              </div>
              <div className="border-t border-line pt-2 flex justify-between text-base font-bold text-ink">
                <span>Total Amount</span>
                <span className="display text-roast text-xl">{formatPeso(order.total)}</span>
              </div>
            </div>

            {order.customerNotes && (
              <div className="rounded-xl border border-line bg-cream p-3 text-xs">
                <span className="font-bold text-ink block mb-0.5">Kitchen Special Instructions:</span>
                <span className="text-muted italic">{order.customerNotes}</span>
              </div>
            )}
          </Card>

          {/* Delivery or Pickup Details */}
          {isDelivery && order.delivery ? (
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="display text-lg font-bold text-ink flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-roast" />
                  <span>Delivery Address & Pinpoint</span>
                </h2>
                <span className="text-[11px] font-semibold text-leaf bg-leaf-soft px-2.5 py-0.5 rounded-full">
                  Rider Guide
                </span>
              </div>

              <div className="space-y-2 text-xs sm:text-sm">
                <p className="font-semibold text-ink">{order.delivery.address}</p>

                {order.delivery.landmark && (
                  <div className="rounded-xl border border-amber-300 bg-amber-50/60 p-3 text-xs text-amber-900">
                    <span className="font-bold block">Landmark for Rider:</span>
                    <span>{order.delivery.landmark}</span>
                  </div>
                )}

                {order.delivery.notes && (
                  <p className="text-xs text-muted">
                    <strong>Delivery Notes:</strong> {order.delivery.notes}
                  </p>
                )}

                <div className="flex items-center gap-2 text-xs text-muted pt-1">
                  <Phone className="h-3.5 w-3.5 text-roast" />
                  <span>Contact: <strong>{order.delivery.contactPhone}</strong></span>
                </div>
              </div>

              {/* Embedded Read-only Leaflet Map */}
              <div className="pt-2">
                <LocationPicker
                  lat={Number(order.delivery.latitude)}
                  lng={Number(order.delivery.longitude)}
                  readOnly
                />
              </div>
            </Card>
          ) : (
            <Card className="p-6 space-y-3">
              <h2 className="display text-lg font-bold text-ink flex items-center gap-2">
                <Store className="h-5 w-5 text-roast" />
                <span>Pickup Instructions</span>
              </h2>
              <p className="text-xs sm:text-sm text-ink">
                <strong>Boytag's Lechon Manok & Chicken House</strong>
              </p>
              <p className="text-xs text-muted">
                Maharlika Highway, Brgy. Dila, Santa Rosa, Laguna
              </p>
              <p className="text-xs text-muted">
                Present order reference <strong>{order.orderNumber}</strong> at the counter when you arrive.
              </p>
            </Card>
          )}
        </div>

        {/* Right Column: Order Change History Timeline (Audit Trail) */}
        <div className="space-y-6 lg:col-span-5">
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h2 className="display text-lg font-bold text-ink flex items-center gap-2">
                <FileText className="h-5 w-5 text-roast" />
                <span>Order Change History</span>
              </h2>
              <span className="text-[11px] text-muted font-mono">
                {order.history?.length || 0} events
              </span>
            </div>

            <p className="text-xs text-muted">
              Live audit trail recording all creations, status changes, schedule revisions, and staff updates:
            </p>

            <div className="pt-2">
              <OrderTimeline history={order.history || []} />
            </div>
          </Card>
        </div>
      </div>

      {/* Cancel Order Modal */}
      <Modal open={cancelOpen} title="Cancel Order" onClose={() => setCancelOpen(false)}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            cancelMutation.mutate(cancelReason);
          }}
          className="space-y-4"
        >
          <p className="text-xs text-muted">
            Are you sure you want to cancel order <strong>{order.orderNumber}</strong>?
            Any reserved inventory will be automatically restored to the kitchen.
          </p>

          <Field label="Cancellation Reason (optional)">
            <textarea
              rows={2}
              placeholder="e.g. Ordered by mistake, schedule conflict"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className={inputClass()}
            />
          </Field>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setCancelOpen(false)}
            >
              Keep Order
            </Button>
            <Button
              type="submit"
              variant="danger"
              loading={cancelMutation.isPending}
              className="flex-1"
            >
              Confirm Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modify Order Modal */}
      <Modal open={editOpen} title="Modify Order Details" onClose={() => setEditOpen(false)}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateMutation.mutate({
              customerNotes: editNotes,
              scheduledAt: editSchedule || undefined,
            });
          }}
          className="space-y-4"
        >
          <Field label="Update Preparation Schedule (optional)">
            <input
              type="datetime-local"
              value={editSchedule}
              onChange={(e) => setEditSchedule(e.target.value)}
              className={inputClass()}
            />
          </Field>

          <Field label="Update Special Kitchen Instructions">
            <textarea
              rows={3}
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              className={inputClass()}
            />
          </Field>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setEditOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={updateMutation.isPending}
              className="flex-1"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
