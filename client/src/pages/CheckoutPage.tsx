import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { api } from "@/lib/api";
import { formatPeso } from "@/lib/utils";
import { sound } from "@/lib/sound";
import { LocationPicker, TUPI_BOYTAGS_COORDS } from "@/components/MapPin";
import { Button, Card, Field, inputClass, Modal } from "@/components/ui";
import { DishImage } from "@/components/DishImage";
import {
  Store,
  Truck,
  Clock,
  MapPin,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  QrCode,
  CreditCard,
  Banknote,
  Heart,
} from "lucide-react";
import type { Order, OrderType } from "@/types";
import { toast } from "sonner";

export function CheckoutPage() {
  const { user } = useAuth();
  const { items, subtotal, clear } = useCart();
  const navigate = useNavigate();

  const [orderType, setOrderType] = useState<OrderType>("DELIVERY");
  const [scheduleMode, setScheduleMode] = useState<"asap" | "custom">("asap");
  const [customTime, setCustomTime] = useState<string>("");
  const [customerNotes, setCustomerNotes] = useState<string>("");

  // Delivery fields with Tupi, South Cotabato defaults
  const [address, setAddress] = useState<string>("");
  const [landmark, setLandmark] = useState<string>("");
  const [deliveryNotes, setDeliveryNotes] = useState<string>("");
  const [contactPhone, setContactPhone] = useState<string>(user?.phone || "");
  const [lat, setLat] = useState<number>(TUPI_BOYTAGS_COORDS.lat);
  const [lng, setLng] = useState<number>(TUPI_BOYTAGS_COORDS.lng);

  // Payment method & tip
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "GCASH" | "MAYA" | "CARD">("COD");
  const [riderTip, setRiderTip] = useState<number>(0);
  const [gcashModalOpen, setGcashModalOpen] = useState(false);
  const [gcashRef, setGcashRef] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Delivery fee is 40 for delivery, 0 for pickup
  const deliveryFee = orderType === "DELIVERY" ? 40 : 0;
  const total = subtotal + deliveryFee + (orderType === "DELIVERY" ? riderTip : 0);

  useEffect(() => {
    if (items.length === 0) {
      navigate("/cart");
    }
  }, [items, navigate]);

  // Set default custom time to 1 hour from now
  useEffect(() => {
    const d = new Date(Date.now() + 60 * 60 * 1000);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    setCustomTime(`${yyyy}-${mm}-${dd}T${hh}:${min}`);
  }, []);

  async function handlePlaceOrder(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (items.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    let scheduledAt: string;
    if (scheduleMode === "asap") {
      // 25 mins from now
      scheduledAt = new Date(Date.now() + 25 * 60 * 1000).toISOString();
    } else {
      if (!customTime) {
        setError("Please choose your desired pickup or delivery time.");
        return;
      }
      const chosen = new Date(customTime);
      if (Number.isNaN(chosen.getTime()) || chosen.getTime() < Date.now() - 60000) {
        setError("Please select a future date and time for your schedule.");
        return;
      }
      scheduledAt = chosen.toISOString();
    }

    if (orderType === "DELIVERY") {
      if (!address.trim() || address.trim().length < 6) {
        setError("Please enter a complete and detailed delivery address in Tupi.");
        return;
      }
      if (!contactPhone.trim() || contactPhone.trim().length < 7) {
        setError("Please enter a valid mobile number for rider coordination.");
        return;
      }
    }

    setLoading(true);

    try {
      const payload = {
        type: orderType,
        scheduledAt,
        customerNotes: customerNotes.trim() || undefined,
        items: items.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
        })),
        delivery:
          orderType === "DELIVERY"
            ? {
                address: address.trim(),
                landmark: landmark.trim() || undefined,
                notes: deliveryNotes.trim() || undefined,
                contactPhone: contactPhone.trim(),
                latitude: Number(lat.toFixed(6)),
                longitude: Number(lng.toFixed(6)),
              }
            : undefined,
      };

      const order = await api<Order>("/api/orders", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      sound.play("success");
      clear();
      toast.success(`Order placed! Reference: ${order.orderNumber}`);
      navigate(`/orders/${order.id}`);
    } catch (err) {
      sound.play("alert");
      setError(err instanceof Error ? err.message : "Failed to submit order. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="border-b border-line pb-4">
        <h1 className="display text-3xl font-bold text-ink">Checkout</h1>
        <p className="text-xs text-muted mt-0.5">
          Boytag's Lechon Manok • South Cotabato - Sarangani Road, Poblacion, Tupi HQ
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-danger/30 bg-rose-50 p-4 text-xs sm:text-sm text-danger font-bold">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid gap-8 lg:grid-cols-12">
        {/* Left Column: Configuration */}
        <div className="space-y-6 lg:col-span-7">
          {/* 1. Order Type Selection */}
          <Card className="p-6 space-y-4">
            <h2 className="display text-lg font-bold text-ink flex items-center gap-2">
              <span>1. Choose Service Mode</span>
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => {
                  sound.play("click");
                  setOrderType("DELIVERY");
                }}
                className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition ${
                  orderType === "DELIVERY"
                    ? "border-roast bg-cream text-roast ring-2 ring-roast/20 font-bold"
                    : "border-line bg-paper text-ink hover:border-roast/40"
                }`}
              >
                <Truck className="h-6 w-6" />
                <div>
                  <p className="font-bold text-sm">Doorstep Delivery</p>
                  <p className="text-[11px] text-muted">Across Tupi & vicinity (+₱40)</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.play("click");
                  setOrderType("PICKUP");
                }}
                className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition ${
                  orderType === "PICKUP"
                    ? "border-roast bg-cream text-roast ring-2 ring-roast/20 font-bold"
                    : "border-line bg-paper text-ink hover:border-roast/40"
                }`}
              >
                <Store className="h-6 w-6" />
                <div>
                  <p className="font-bold text-sm">Store Pickup</p>
                  <p className="text-[11px] text-muted">Poblacion, Tupi HQ (Free)</p>
                </div>
              </button>
            </div>
          </Card>

          {/* 2. Schedule Selection */}
          <Card className="p-6 space-y-4">
            <h2 className="display text-lg font-bold text-ink flex items-center gap-2">
              <Clock className="h-5 w-5 text-roast" />
              <span>2. Preparation Schedule</span>
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  sound.play("click");
                  setScheduleMode("asap");
                }}
                className={`rounded-2xl border p-3.5 text-left transition text-xs ${
                  scheduleMode === "asap"
                    ? "border-roast bg-cream text-roast font-bold ring-2 ring-roast/20"
                    : "border-line bg-paper text-ink"
                }`}
              >
                <p className="font-bold">As Soon As Possible</p>
                <p className="text-[11px] text-muted mt-0.5">Freshly prepared in ~20–30 mins</p>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.play("click");
                  setScheduleMode("custom");
                }}
                className={`rounded-2xl border p-3.5 text-left transition text-xs ${
                  scheduleMode === "custom"
                    ? "border-roast bg-cream text-roast font-bold ring-2 ring-roast/20"
                    : "border-line bg-paper text-ink"
                }`}
              >
                <p className="font-bold">Schedule for Later</p>
                <p className="text-[11px] text-muted mt-0.5">Choose target time today</p>
              </button>
            </div>

            {scheduleMode === "custom" && (
              <Field label="Choose scheduled pickup or delivery time">
                <input
                  type="datetime-local"
                  required
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                  className={inputClass()}
                />
              </Field>
            )}
          </Card>

          {/* 3. Delivery Pinpoint & Address (Only if Delivery) */}
          {orderType === "DELIVERY" && (
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="display text-lg font-bold text-ink flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-roast" />
                  <span>3. Tupi Delivery Pinpoint</span>
                </h2>
                <span className="text-[11px] bg-leaf-soft text-leaf px-2.5 py-0.5 rounded-full font-bold">
                  Interactive GPS
                </span>
              </div>

              <p className="text-xs text-muted">
                Drag marker to your gate or tap <strong>Locate Me</strong> for precise doorstep delivery in Poblacion, Tupi:
              </p>

              <LocationPicker
                lat={lat}
                lng={lng}
                onChange={(newLat, newLng) => {
                  setLat(newLat);
                  setLng(newLng);
                }}
              />

              <div className="flex items-center justify-between text-[11px] text-muted bg-cream rounded-xl p-2.5 px-3 border border-line">
                <span>Coordinates:</span>
                <span className="font-mono text-ink font-bold">
                  {lat.toFixed(5)}, {lng.toFixed(5)}
                </span>
              </div>

              <Field label="Street / Purok / Barangay Address">
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Purok 3, Near Tupi Central Elementary School or South Cotabato-Sarangani Rd"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={inputClass()}
                />
              </Field>

              <Field label="Barangay Landmark (Crucial for Rider)">
                <input
                  type="text"
                  placeholder="e.g. Yellow gate beside sari-sari store, near Tupi Municipal Gym"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  className={inputClass()}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Rider Delivery Notes">
                  <input
                    type="text"
                    placeholder="e.g. Ring doorbell, dogs inside"
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    className={inputClass()}
                  />
                </Field>

                <Field label="Contact Mobile Number">
                  <input
                    type="tel"
                    required
                    placeholder="0917 123 4567"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className={inputClass()}
                  />
                </Field>
              </div>

              {/* Rider Tip Selector */}
              <div className="space-y-2 pt-2 border-t border-line">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted flex items-center gap-1">
                    <Heart className="h-3.5 w-3.5 text-roast" /> Tip the Delivery Rider
                  </span>
                  <span className="text-xs font-bold text-roast">+{formatPeso(riderTip)}</span>
                </div>
                <div className="flex gap-2">
                  {[0, 20, 50, 100].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        sound.play("click");
                        setRiderTip(t);
                      }}
                      className={`flex-1 rounded-xl py-2 text-xs font-bold border transition ${
                        riderTip === t
                          ? "border-roast bg-cream text-roast shadow-sm"
                          : "border-line bg-paper text-ink"
                      }`}
                    >
                      {t === 0 ? "No tip" : `+₱${t}`}
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* 4. Payment Method */}
          <Card className="p-6 space-y-4">
            <h2 className="display text-lg font-bold text-ink">
              {orderType === "DELIVERY" ? "4. Payment Method" : "3. Payment Method"}
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                type="button"
                onClick={() => {
                  sound.play("click");
                  setPaymentMethod("COD");
                }}
                className={`flex flex-col items-center gap-1.5 rounded-2xl border p-3 text-center transition ${
                  paymentMethod === "COD"
                    ? "border-roast bg-cream text-roast font-bold ring-2 ring-roast/20"
                    : "border-line bg-paper text-ink hover:border-roast/40"
                }`}
              >
                <Banknote className="h-5 w-5" />
                <span className="text-xs font-bold">{orderType === "DELIVERY" ? "Cash on Delivery" : "Cash at Counter"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.play("click");
                  setPaymentMethod("GCASH");
                  setGcashModalOpen(true);
                }}
                className={`flex flex-col items-center gap-1.5 rounded-2xl border p-3 text-center transition ${
                  paymentMethod === "GCASH"
                    ? "border-sky-600 bg-sky-50 text-sky-800 font-bold ring-2 ring-sky-500/20"
                    : "border-line bg-paper text-ink hover:border-sky-500/40"
                }`}
              >
                <QrCode className="h-5 w-5 text-sky-600" />
                <span className="text-xs font-bold">GCash QR</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.play("click");
                  setPaymentMethod("MAYA");
                  setGcashModalOpen(true);
                }}
                className={`flex flex-col items-center gap-1.5 rounded-2xl border p-3 text-center transition ${
                  paymentMethod === "MAYA"
                    ? "border-emerald-600 bg-emerald-50 text-emerald-800 font-bold ring-2 ring-emerald-500/20"
                    : "border-line bg-paper text-ink hover:border-emerald-500/40"
                }`}
              >
                <QrCode className="h-5 w-5 text-emerald-600" />
                <span className="text-xs font-bold">Maya QR</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.play("click");
                  setPaymentMethod("CARD");
                  toast.info("Credit/Debit Card accepted upon rider arrival or pickup counter.");
                }}
                className={`flex flex-col items-center gap-1.5 rounded-2xl border p-3 text-center transition ${
                  paymentMethod === "CARD"
                    ? "border-roast bg-cream text-roast font-bold ring-2 ring-roast/20"
                    : "border-line bg-paper text-ink hover:border-roast/40"
                }`}
              >
                <CreditCard className="h-5 w-5" />
                <span className="text-xs font-bold">Card on Arrival</span>
              </button>
            </div>

            {gcashRef && (
              <p className="text-xs text-leaf font-bold flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" /> GCash/Maya Reference: {gcashRef}
              </p>
            )}
          </Card>

          {/* Kitchen / Special Instructions */}
          <Card className="p-6 space-y-4">
            <h2 className="display text-lg font-bold text-ink">Special Kitchen Requests</h2>
            <Field label="Notes for the Poblacion Tupi cooking staff (optional)">
              <textarea
                rows={2}
                placeholder="e.g. Extra spicy sawsawan, cut chicken into 4 pieces, extra toasted skin"
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                className={inputClass()}
              />
            </Field>
          </Card>
        </div>

        {/* Right Column: Order Review and Submit */}
        <div className="space-y-6 lg:col-span-5">
          <Card className="sticky top-20 p-6 space-y-6">
            <h2 className="display text-xl font-bold text-ink">Order Items Review</h2>

            <div className="divide-y divide-line max-h-64 overflow-y-auto pr-1">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="py-3 flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-3">
                    <DishImage
                      src={product.imageUrl}
                      alt={product.name}
                      category={product.category?.name}
                      className="h-10 w-10 rounded-xl object-cover bg-cream"
                    />
                    <div>
                      <p className="font-bold text-ink">{product.name}</p>
                      <p className="text-muted text-[11px]">{quantity} × {formatPeso(product.price)}</p>
                    </div>
                  </div>
                  <span className="font-bold text-ink">{formatPeso(product.price * quantity)}</span>
                </div>
              ))}
            </div>

            <div className="space-y-2 border-t border-line pt-4 text-xs sm:text-sm">
              <div className="flex justify-between text-muted">
                <span>Subtotal</span>
                <span className="font-medium text-ink">{formatPeso(subtotal)}</span>
              </div>
              <div className="flex justify-between text-muted">
                <span>Delivery Fee</span>
                <span className="font-medium text-ink">
                  {orderType === "DELIVERY" ? formatPeso(deliveryFee) : "Free (Store Pickup)"}
                </span>
              </div>
              {orderType === "DELIVERY" && riderTip > 0 && (
                <div className="flex justify-between text-muted">
                  <span>Rider Tip</span>
                  <span className="font-medium text-roast">{formatPeso(riderTip)}</span>
                </div>
              )}
              <div className="border-t border-line pt-2 flex justify-between text-base font-bold">
                <span className="text-ink">Total Payment</span>
                <span className="display text-roast text-xl">{formatPeso(total)}</span>
              </div>
              <p className="text-[11px] text-muted">
                Payment mode: {paymentMethod === "COD" ? (orderType === "DELIVERY" ? "Cash on Delivery" : "Cash at Counter") : paymentMethod}
              </p>
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full py-4 text-base font-bold shadow-lg shadow-roast/25"
            >
              Place Feast Order ({formatPeso(total)})
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>

            <div className="flex items-center justify-center gap-2 text-xs text-muted">
              <ShieldCheck className="h-4 w-4 text-leaf" />
              <span>Real-time Tupi kitchen confirmation & tracking</span>
            </div>
          </Card>
        </div>
      </form>

      {/* GCash / Maya Mock QR Modal */}
      <Modal open={gcashModalOpen} title="Scan to Pay (GCash / Maya)" onClose={() => setGcashModalOpen(false)}>
        <div className="space-y-4 text-center text-xs">
          <div className="mx-auto w-44 rounded-2xl border-2 border-dashed border-sky-600 bg-sky-50 p-4 space-y-2 shadow-sm">
            <QrCode className="mx-auto h-28 w-28 text-sky-700" />
            <p className="font-bold text-[11px] text-sky-900">BOYTAG'S TUPI HQ</p>
            <p className="text-[10px] text-sky-800">0917-123-4567</p>
          </div>

          <p className="text-muted leading-relaxed">
            Scan via GCash or Maya app. Total to send: <strong>{formatPeso(total)}</strong>. Once sent, paste your reference number below:
          </p>

          <Field label="GCash / Maya Reference Number">
            <input
              type="text"
              placeholder="e.g. 1029 3847 5612"
              value={gcashRef}
              onChange={(e) => setGcashRef(e.target.value)}
              className={inputClass()}
            />
          </Field>

          <Button
            type="button"
            className="w-full font-bold"
            onClick={() => {
              setGcashModalOpen(false);
              toast.success("Payment reference recorded!");
            }}
          >
            Confirm Reference
          </Button>
        </div>
      </Modal>
    </div>
  );
}
