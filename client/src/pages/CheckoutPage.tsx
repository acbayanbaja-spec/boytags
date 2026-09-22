import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { api } from "@/lib/api";
import { formatPeso } from "@/lib/utils";
import { LocationPicker } from "@/components/MapPin";
import { Button, Card, Field, inputClass } from "@/components/ui";
import { Store, Truck, Clock, MapPin, AlertCircle, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
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

  // Delivery fields
  const [address, setAddress] = useState<string>("");
  const [landmark, setLandmark] = useState<string>("");
  const [deliveryNotes, setDeliveryNotes] = useState<string>("");
  const [contactPhone, setContactPhone] = useState<string>(user?.phone || "");
  const [lat, setLat] = useState<number>(14.3142); // default Santa Rosa Laguna
  const [lng, setLng] = useState<number>(121.1114);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Delivery fee is 40 for delivery, 0 for pickup
  const deliveryFee = orderType === "DELIVERY" ? 40 : 0;
  const total = subtotal + deliveryFee;

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
      if (!address.trim() || address.trim().length < 8) {
        setError("Please enter a complete and detailed delivery address.");
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

      clear();
      toast.success(`Order placed! Reference: ${order.orderNumber}`);
      navigate(`/orders/${order.id}`);
    } catch (err) {
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
          Provide your delivery pinpoint or pickup preference and review your order.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-danger/20 bg-rose-50 p-4 text-xs sm:text-sm text-danger font-medium">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handlePlaceOrder} className="grid gap-8 lg:grid-cols-12">
        {/* Left Column: Configuration */}
        <div className="space-y-6 lg:col-span-7">
          {/* Order Type Selection */}
          <Card className="p-6 space-y-4">
            <h2 className="display text-lg font-bold text-ink flex items-center gap-2">
              <span>1. Choose Order Type</span>
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setOrderType("DELIVERY")}
                className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition ${
                  orderType === "DELIVERY"
                    ? "border-roast bg-cream text-roast ring-2 ring-roast/20"
                    : "border-line bg-paper text-ink hover:border-roast/40"
                }`}
              >
                <Truck className="h-6 w-6" />
                <div>
                  <p className="font-bold text-sm">Doorstep Delivery</p>
                  <p className="text-[11px] text-muted">Direct to your home (+₱40)</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setOrderType("PICKUP")}
                className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition ${
                  orderType === "PICKUP"
                    ? "border-roast bg-cream text-roast ring-2 ring-roast/20"
                    : "border-line bg-paper text-ink hover:border-roast/40"
                }`}
              >
                <Store className="h-6 w-6" />
                <div>
                  <p className="font-bold text-sm">Store Pickup</p>
                  <p className="text-[11px] text-muted">Maharlika Hwy, Santa Rosa (Free)</p>
                </div>
              </button>
            </div>
          </Card>

          {/* Schedule Selection */}
          <Card className="p-6 space-y-4">
            <h2 className="display text-lg font-bold text-ink flex items-center gap-2">
              <Clock className="h-5 w-5 text-roast" />
              <span>2. Preparation Schedule</span>
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setScheduleMode("asap")}
                className={`rounded-xl border p-3 text-left transition text-xs ${
                  scheduleMode === "asap"
                    ? "border-roast bg-cream text-roast font-semibold"
                    : "border-line bg-paper text-ink"
                }`}
              >
                <p className="font-bold">As Soon As Possible</p>
                <p className="text-[11px] text-muted mt-0.5">Ready in ~25–35 minutes</p>
              </button>

              <button
                type="button"
                onClick={() => setScheduleMode("custom")}
                className={`rounded-xl border p-3 text-left transition text-xs ${
                  scheduleMode === "custom"
                    ? "border-roast bg-cream text-roast font-semibold"
                    : "border-line bg-paper text-ink"
                }`}
              >
                <p className="font-bold">Schedule for Later</p>
                <p className="text-[11px] text-muted mt-0.5">Pick date and time today</p>
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

          {/* Delivery Details & Map Pinpointing (Only if Delivery) */}
          {orderType === "DELIVERY" && (
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="display text-lg font-bold text-ink flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-roast" />
                  <span>3. Delivery Location & Pinpoint</span>
                </h2>
                <span className="text-[11px] bg-leaf-soft text-leaf px-2.5 py-0.5 rounded-full font-semibold">
                  Interactive Map
                </span>
              </div>

              <p className="text-xs text-muted">
                Drag the marker or click on the map to pinpoint your exact gate or building for the delivery rider:
              </p>

              {/* Leaflet Map Component */}
              <LocationPicker
                lat={lat}
                lng={lng}
                onChange={(newLat, newLng) => {
                  setLat(newLat);
                  setLng(newLng);
                }}
              />

              <div className="flex items-center gap-4 text-[11px] text-muted bg-cream rounded-xl p-2 px-3 border border-line">
                <span>GPS Pin Coordinates:</span>
                <span className="font-mono text-ink font-semibold">
                  {lat.toFixed(5)}, {lng.toFixed(5)}
                </span>
              </div>

              <Field label="Full Street Address">
                <textarea
                  required
                  rows={2}
                  placeholder="House/Unit #, Street name, Subdivision or Village"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className={inputClass()}
                />
              </Field>

              <Field label="Barangay Landmark (Crucial for Rider)">
                <input
                  type="text"
                  placeholder="e.g. Near the barangay hall, blue gate beside the sari-sari store"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  className={inputClass()}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Rider Delivery Instructions">
                  <input
                    type="text"
                    placeholder="e.g. Leave with guard if gate locked"
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                    className={inputClass()}
                  />
                </Field>

                <Field label="Contact Number for Delivery">
                  <input
                    type="tel"
                    required
                    placeholder="0919 222 3333"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    className={inputClass()}
                  />
                </Field>
              </div>
            </Card>
          )}

          {/* Kitchen / Special Instructions */}
          <Card className="p-6 space-y-4">
            <h2 className="display text-lg font-bold text-ink">Special Kitchen Requests</h2>
            <Field label="Notes for the cooking staff (optional)">
              <textarea
                rows={2}
                placeholder="e.g. Extra spicy sawsawan, cut chicken into 8 pieces, separate sauces"
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
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="h-10 w-10 rounded-lg object-cover"
                    />
                    <div>
                      <p className="font-semibold text-ink">{product.name}</p>
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
                  {orderType === "DELIVERY" ? formatPeso(deliveryFee) : "Free (Pickup)"}
                </span>
              </div>
              <div className="border-t border-line pt-2 flex justify-between text-base font-bold">
                <span className="text-ink">Total Payment</span>
                <span className="display text-roast text-xl">{formatPeso(total)}</span>
              </div>
              <p className="text-[11px] text-muted">
                Payment mode: Cash on delivery / Cash at store upon claiming.
              </p>
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full py-4 text-base font-semibold shadow-lg shadow-roast/25"
            >
              Place Order ({formatPeso(total)})
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>

            <div className="flex items-center justify-center gap-2 text-xs text-muted">
              <ShieldCheck className="h-4 w-4 text-leaf" />
              <span>Real-time kitchen confirmation & tracking</span>
            </div>
          </Card>
        </div>
      </form>
    </div>
  );
}
