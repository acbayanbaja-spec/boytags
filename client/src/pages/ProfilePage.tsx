import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  User,
  Mail,
  Phone,
  Shield,
  LogOut,
  CheckCircle2,
  AlertCircle,
  ClipboardList,
  Bell,
  ChefHat,
  Store,
  Clock,
  Truck,
  ArrowRight,
  Flame,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { sound } from "@/lib/sound";
import { formatTime, formatDeliveryDateLabel, formatPeso } from "@/lib/utils";
import { Button, Card, Field, StatusBadge, inputClass } from "@/components/ui";
import type { Order } from "@/types";
import { toast } from "sonner";

export function ProfilePage() {
  const { user, refreshUser, logout } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: customerOrders } = useQuery<Order[]>({
    queryKey: ["orders", "profile-summary", user?.id],
    queryFn: () => (user?.role === "CUSTOMER" ? api<Order[]>("/api/orders") : Promise.resolve([])),
    enabled: Boolean(user?.role === "CUSTOMER"),
    refetchInterval: 6000,
  });

  const activeOrders = customerOrders?.filter((o) =>
    ["PENDING", "CONFIRMED", "PREPARING", "READY", "OUT_FOR_DELIVERY"].includes(o.status),
  ) || [];

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    setLoading(true);
    try {
      await api("/api/auth/me", {
        method: "PATCH",
        body: JSON.stringify({ name: name.trim(), phone: phone.trim() || null }),
      });
      await refreshUser();
      sound.play("success");
      toast.success("Profile updated successfully!");
    } catch (err) {
      sound.play("alert");
      setError(err instanceof Error ? err.message : "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  }

  if (!user) return null;

  const isStaff = user.role === "STAFF" || user.role === "ADMIN";

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div className="border-b border-line pb-4 flex items-center justify-between">
        <div>
          <h1 className="display text-3xl font-bold text-ink">My Account</h1>
          <p className="text-xs text-muted mt-0.5">Manage your personal details and contact numbers for delivery.</p>
        </div>
        <span className="rounded-full bg-roast/10 text-roast px-3 py-1 text-xs font-bold uppercase tracking-wider">
          {user.role}
        </span>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-danger/30 bg-rose-50 p-4 text-xs text-danger font-bold">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Active Orders & Live Delivery Schedule in Account */}
      {activeOrders.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="display text-lg font-bold text-ink flex items-center gap-2">
              <Clock className="h-4 w-4 text-roast" />
              <span>Active Order Delivery Schedule</span>
            </h2>
            <Link to="/orders" className="text-xs font-bold text-roast hover:underline">
              View all orders →
            </Link>
          </div>

          <div className="space-y-3">
            {activeOrders.map((order) => {
              const isDelivery = order.type === "DELIVERY";
              const isPending = order.status === "PENDING";

              return (
                <Card
                  key={order.id}
                  className={`p-5 transition hover:shadow-md ${
                    isPending
                      ? "border-amber-400 bg-gradient-to-br from-paper via-amber-50/30 to-paper"
                      : "border-roast/30 bg-gradient-to-br from-paper via-orange-50/20 to-paper"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-line/60 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="display font-bold text-base text-ink">{order.orderNumber}</span>
                      <StatusBadge status={order.status} />
                      <span className="text-xs text-muted">
                        {isDelivery ? "Doorstep Delivery" : "Poblacion HQ Pickup"}
                      </span>
                    </div>
                    <span className="display font-bold text-roast text-base">{formatPeso(order.total)}</span>
                  </div>

                  <div className="py-3">
                    {isPending ? (
                      <div className="flex items-start gap-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 p-3 text-xs text-amber-950">
                        <Clock className="h-5 w-5 text-amber-600 shrink-0 animate-pulse mt-0.5" />
                        <div className="space-y-0.5">
                          <span className="font-bold text-amber-900 block text-xs">
                            ⏳ Pending Kitchen Confirmation:
                          </span>
                          <p className="text-sm text-ink font-semibold">
                            {isDelivery ? "Will be delivered at approximately " : "Ready for pickup at approximately "}
                            <strong className="text-roast text-base font-extrabold underline decoration-roast/30 decoration-2">
                              {formatTime(order.scheduledAt)}
                            </strong>{" "}
                            <span className="text-muted text-xs">({formatDeliveryDateLabel(order.scheduledAt)})</span>
                          </p>
                          <p className="text-[11px] text-amber-800/80">
                            Our pitmasters are reviewing your ticket. Delivery takes approx. 20–30 mins.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 rounded-2xl bg-orange-50/80 border border-roast/20 p-3 text-xs text-amber-950">
                        {order.status === "OUT_FOR_DELIVERY" ? (
                          <Truck className="h-5 w-5 text-roast shrink-0 animate-bounce" />
                        ) : (
                          <Flame className="h-5 w-5 text-roast shrink-0" />
                        )}
                        <div>
                          <span className="font-bold text-roast text-xs block">
                            {order.status === "OUT_FOR_DELIVERY" ? "🚀 Rider on the way!" : "Estimated Delivery Time:"}
                          </span>
                          <span className="text-sm font-extrabold text-ink">
                            {formatTime(order.scheduledAt)}{" "}
                            <span className="text-xs text-muted font-normal">({formatDeliveryDateLabel(order.scheduledAt)})</span>
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-muted line-clamp-1 max-w-[250px]">
                      {order.items?.map((i) => `${i.quantity}× ${i.productName}`).join(", ")}
                    </span>
                    <Link to={`/orders/${order.id}`}>
                      <Button size="sm" className="text-xs font-bold shadow-xs">
                        Track Live Telemetry <ArrowRight className="h-3.5 w-3.5 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Profile Form */}
      <Card className="p-6">
        <form onSubmit={handleUpdate} className="space-y-4 text-xs">
          <Field label="Full Name">
            <div className="relative">
              <User className="absolute left-3.5 top-3 h-4 w-4 text-muted" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`${inputClass()} pl-10`}
              />
            </div>
          </Field>

          <Field label="Email Address">
            <div className="relative">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-muted" />
              <input
                type="email"
                disabled
                value={user.email}
                className={`${inputClass()} pl-10 bg-cream cursor-not-allowed opacity-80`}
              />
            </div>
            <span className="text-[11px] text-muted">Email is locked to your Boytag's account.</span>
          </Field>

          <Field label="Mobile Phone (for delivery rider coordination)">
            <div className="relative">
              <Phone className="absolute left-3.5 top-3 h-4 w-4 text-muted" />
              <input
                type="tel"
                placeholder="0917 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={`${inputClass()} pl-10`}
              />
            </div>
          </Field>

          <div className="pt-2">
            <Button type="submit" loading={loading} className="w-full sm:w-auto px-6 font-bold">
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Card>

      {/* Quick Navigation Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link to="/orders">
          <Card className="flex items-center gap-4 p-4 hover:border-roast/40 transition hover:shadow-sm">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-cream text-roast">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-ink">My Order History</p>
              <p className="text-[11px] text-muted">View past and active roast orders</p>
            </div>
          </Card>
        </Link>

        <Link to="/notifications">
          <Card className="flex items-center gap-4 p-4 hover:border-roast/40 transition hover:shadow-sm">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-cream text-roast">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-ink">Notifications</p>
              <p className="text-[11px] text-muted">Tupi kitchen status alerts</p>
            </div>
          </Card>
        </Link>

        {isStaff && (
          <Link to="/staff" className="sm:col-span-2">
            <Card className="flex items-center gap-4 p-4 border-amber-300 bg-amber-50/50 hover:bg-amber-50 hover:border-amber-400 transition">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-roast text-white">
                <ChefHat className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm text-ink">Staff & Kitchen Operations Portal</p>
                <p className="text-[11px] text-muted">Access KDS Kitchen Display, queue, and inventory telemetry</p>
              </div>
              <span className="text-xs font-bold text-roast">Open Portal →</span>
            </Card>
          </Link>
        )}
      </div>

      {/* Sign Out Card */}
      <Card className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-rose-200 bg-rose-50/40">
        <div>
          <h3 className="font-bold text-sm text-ink">Sign Out of Boytag's</h3>
          <p className="text-xs text-muted">Safely end your session on this browser.</p>
        </div>
        <Button
          variant="danger"
          onClick={() => {
            sound.play("click");
            logout();
          }}
          className="w-full sm:w-auto font-bold"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </Card>
    </div>
  );
}
