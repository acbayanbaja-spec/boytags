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
  Printer,
  Star,
  Share2,
  Copy,
} from "lucide-react";
import { api } from "@/lib/api";
import { formatDateTime, formatPeso, formatTime } from "@/lib/utils";
import { sound } from "@/lib/sound";
import { useAuth } from "@/context/AuthContext";
import { useRealtime } from "@/hooks/useRealtime";
import { LocationPicker, TUPI_BOYTAGS_COORDS } from "@/components/MapPin";
import { OrderTimeline } from "@/components/OrderTimeline";
import { ReceiptModal } from "@/components/ReceiptModal";
import { RatingModal } from "@/components/RatingModal";
import { Button, Card, Field, Modal, Skeleton, StatusBadge, inputClass } from "@/components/ui";
import { DishImage } from "@/components/DishImage";
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

  const [receiptOpen, setReceiptOpen] = useState(false);
  const [ratingOpen, setRatingOpen] = useState(false);

  const { data: order, isLoading, error } = useQuery<Order>({
    queryKey: ["order", id],
    queryFn: () => api<Order>(`/api/orders/${id}`),
    refetchInterval: 5000,
  });

  const cancelMutation = useMutation({
    mutationFn: (reason: string) =>
      api<Order>(`/api/orders/${id}/cancel`, {
        method: "POST",
        body: JSON.stringify({ reason }),
      }),
    onSuccess: () => {
      sound.play("alert");
      toast.success("Order cancelled. Inventory has been restored to the kitchen.");
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
      sound.play("success");
      toast.success("Order details updated.");
      setEditOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["order", id] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Failed to update order.");
    },
  });

  function handleShareLink() {
    sound.play("click");
    if (navigator.clipboard) {
      void navigator.clipboard.writeText(window.location.href);
      toast.success("Live order tracking link copied to clipboard!");
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6 py-6">
        <Skeleton className="h-10 w-48 rounded-xl" />
        <Skeleton className="h-64 w-full rounded-3xl" />
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-80 w-full rounded-3xl" />
          <Skeleton className="h-80 w-full rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="py-12 text-center space-y-4">
        <h2 className="display text-2xl font-bold text-ink">Order Not Found</h2>
        <p className="text-sm text-muted">We couldn't retrieve this order. Please verify your reference number.</p>
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
  const isCompleted = order.status === "COMPLETED";

  const canCancel = ["PENDING", "CONFIRMED", "PREPARING"].includes(order.status);
  const canEdit = ["PENDING", "CONFIRMED"].includes(order.status);

  return (
    <div className="space-y-8 py-4">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-line pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/orders"
            className="rounded-2xl border border-line bg-paper p-2 hover:bg-cream transition"
            aria-label="Back"
          >
            <ChevronLeft className="h-5 w-5 text-ink" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="display text-2xl font-bold text-ink">Order {order.orderNumber}</h1>
              <StatusBadge status={order.status} />
            </div>
            <p className="text-xs text-muted mt-0.5">
              Placed {formatDateTime(order.createdAt)} • {isDelivery ? "Doorstep Delivery" : "Poblacion Tupi Pickup"}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleShareLink}
            className="text-xs"
            title="Share Tracking Link"
          >
            <Share2 className="h-3.5 w-3.5 mr-1" />
            Share
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              sound.play("click");
              setReceiptOpen(true);
            }}
            className="text-xs"
          >
            <Printer className="h-3.5 w-3.5 mr-1" />
            Receipt
          </Button>

          {isCompleted && (
            <Button
              variant="glow"
              size="sm"
              onClick={() => {
                sound.play("click");
                setRatingOpen(true);
              }}
              className="text-xs"
            >
              <Star className="h-3.5 w-3.5 mr-1 fill-amber-300" />
              Rate Feast
            </Button>
          )}

          {canEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                sound.play("click");
                setEditNotes(order.customerNotes || "");
                setEditOpen(true);
              }}
              className="text-xs"
            >
              <Edit3 className="h-3.5 w-3.5 mr-1" />
              Modify
            </Button>
          )}

          {canCancel && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                sound.play("click");
                setCancelOpen(true);
              }}
              className="text-xs"
            >
              <XCircle className="h-3.5 w-3.5 mr-1" />
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Unclaimed Order Banner */}
      {isUnclaimed && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl border-2 border-red-500 bg-red-50 p-5 text-red-950 shadow-md"
        >
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-red-600 text-white shadow-md">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-base">⚠ Unclaimed Order Alert — Awaiting Claim</h3>
              <p className="text-xs leading-relaxed text-red-800">
                This order was scheduled for <strong>{formatTime(order.scheduledAt)}</strong> and has not yet been received.
                Your hot roast chicken is being held securely in our kitchen warming chamber in Poblacion, Tupi.
                Please pick it up immediately or call our hotline at <strong>(083) 228-1234</strong>.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Cancelled Alert Banner */}
      {isCancelled && (
        <div className="rounded-3xl border border-rose-300 bg-rose-50 p-5 text-rose-950">
          <div className="flex items-center gap-3">
            <XCircle className="h-6 w-6 text-rose-600 shrink-0" />
            <div>
              <h3 className="font-bold text-sm">This order was cancelled</h3>
              <p className="text-xs text-rose-800 mt-0.5">
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
            <div className="flex items-center gap-1.5 text-xs text-leaf font-bold bg-leaf-soft px-3 py-1 rounded-full">
              <span className="h-2 w-2 rounded-full bg-leaf animate-pulse" />
              <span>Live Tupi Kitchen Telemetry</span>
            </div>
          </div>

          <div className="relative grid grid-cols-3 sm:grid-cols-6 gap-2">
            {stages.map((stage, idx) => {
              const isPast = currentIndex > idx;
              const isCurrent = currentIndex === idx;

              return (
                <div key={stage} className="flex flex-col items-center text-center">
                  <div
                    className={`grid h-11 w-11 place-items-center rounded-2xl text-xs font-bold transition shadow-sm ${
                      isCurrent
                        ? "bg-roast text-white ring-4 ring-roast/20 scale-105"
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
                  <div className="flex items-center gap-3">
                    <DishImage
                      src=""
                      alt={item.productName}
                      className="h-10 w-10 rounded-xl object-cover shrink-0"
                    />
                    <div className="space-y-0.5">
                      <p className="font-bold text-ink">{item.productName}</p>
                      <p className="text-muted text-[11px]">
                        {item.quantity} × {formatPeso(item.unitPrice)}
                      </p>
                    </div>
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
              <div className="rounded-2xl border border-line bg-cream p-3 text-xs">
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
                  <span>Delivery Address & GPS Pinpoint</span>
                </h2>
                <span className="text-[11px] font-bold text-leaf bg-leaf-soft px-2.5 py-0.5 rounded-full">
                  Rider Guide
                </span>
              </div>

              <div className="space-y-2 text-xs sm:text-sm">
                <p className="font-bold text-ink">{order.delivery.address}</p>

                {order.delivery.landmark && (
                  <div className="rounded-2xl border border-amber-300 bg-amber-50/70 p-3 text-xs text-amber-900">
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
                <span>Pickup Instructions (Poblacion, Tupi HQ)</span>
              </h2>
              <p className="text-xs sm:text-sm text-ink font-bold">
                Boytag's Lechon Manok and Chicken House
              </p>
              <p className="text-xs text-muted">
                South Cotabato - Sarangani Road, Poblacion, Tupi, South Cotabato
              </p>
              <p className="text-xs text-muted">
                Present your order reference <strong>{order.orderNumber}</strong> at the front counter when you arrive.
              </p>
              <div className="pt-2">
                <LocationPicker
                  lat={TUPI_BOYTAGS_COORDS.lat}
                  lng={TUPI_BOYTAGS_COORDS.lng}
                  readOnly
                />
              </div>
            </Card>
          )}
        </div>

        {/* Right Column: Order Change History Timeline */}
        <div className="space-y-6 lg:col-span-5">
          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h2 className="display text-lg font-bold text-ink flex items-center gap-2">
                <FileText className="h-5 w-5 text-roast" />
                <span>Order Event History</span>
              </h2>
              <span className="text-[11px] text-muted font-mono">
                {order.history?.length || 0} events
              </span>
            </div>

            <p className="text-xs text-muted leading-relaxed">
              Complete audit stream recording all creations, kitchen station updates, and dispatch handovers:
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
          className="space-y-4 text-xs"
        >
          <p className="text-muted leading-relaxed">
            Are you sure you want to cancel order <strong>{order.orderNumber}</strong>?
            Any reserved rotisserie inventory will be automatically restored to our Tupi kitchen.
          </p>

          <Field label="Cancellation Reason (optional)">
            <textarea
              rows={2}
              placeholder="e.g. Schedule conflict, ordered by mistake"
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
              className="flex-1 font-bold"
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
          className="space-y-4 text-xs"
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
              className="flex-1 font-bold"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Official Receipt Modal */}
      <ReceiptModal
        open={receiptOpen}
        order={order}
        onClose={() => setReceiptOpen(false)}
      />

      {/* Order Rating Modal */}
      <RatingModal
        open={ratingOpen}
        orderNumber={order.orderNumber}
        onClose={() => setRatingOpen(false)}
      />
    </div>
  );
}
