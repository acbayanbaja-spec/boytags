import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Flame,
  PackageCheck,
  ShoppingBag,
  TrendingUp,
  Truck,
  UtensilsCrossed,
  XCircle,
  Bell,
  Eye,
  Store,
} from "lucide-react";
import { api } from "@/lib/api";
import { formatDateTime, formatPeso, formatTime } from "@/lib/utils";
import { useRealtime } from "@/hooks/useRealtime";
import { Button, Card, Skeleton, StatusBadge } from "@/components/ui";
import type { Order, OrderStatus } from "@/types";

type DashboardData = {
  metrics: {
    ordersToday: number;
    pending: number;
    preparing: number;
    ready: number;
    outForDelivery: number;
    completed: number;
    unclaimed: number;
    soldOut: number;
  };
  recentOrders: Order[];
  recentHistory: Array<{
    id: string;
    action: string;
    actorName: string;
    actorRole: string;
    createdAt: string;
    order?: { orderNumber: string };
  }>;
  openAlerts: Array<{
    id: string;
    type: string;
    message: string;
    createdAt: string;
    order?: { orderNumber: string };
  }>;
  upcoming: Order[];
  series: Array<{
    date: string;
    label: string;
    orders: number;
    completed: number;
  }>;
};

export function StaffDashboardPage() {
  useRealtime();

  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: () => api<DashboardData>("/api/dashboard/stats"),
    refetchInterval: 10000,
  });

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
    );
  }

  const { metrics, recentOrders, openAlerts, upcoming, series, recentHistory } = data;

  return (
    <div className="space-y-8">
      {/* Operations Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-line pb-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-roast">
            <span className="h-2 w-2 rounded-full bg-leaf animate-ping" />
            <span>Kitchen & Delivery Dispatch Command</span>
          </div>
          <h1 className="display text-3xl font-bold text-ink mt-0.5">Live Operations Dashboard</h1>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/staff/queue">
            <Button className="text-xs h-10 px-4 shadow-sm">
              <UtensilsCrossed className="h-4 w-4 mr-1.5" />
              Open Kitchen Queue
            </Button>
          </Link>
          <Link to="/staff/products">
            <Button variant="outline" className="text-xs h-10 px-4">
              Inventory & Stock
            </Button>
          </Link>
        </div>
      </div>

      {/* Critical Alerts Banner (if Unclaimed or Sold Out exist) */}
      {metrics.unclaimed > 0 && (
        <div className="rounded-2xl border-2 border-red-500 bg-red-50 p-4 text-red-900 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-red-600 text-white">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm">
                {metrics.unclaimed} Order{metrics.unclaimed > 1 ? "s" : ""} Overdue & Unclaimed!
              </h3>
              <p className="text-xs text-red-800">
                Scheduled claim time has passed. Check holding area and customer contact details.
              </p>
            </div>
          </div>
          <Link to="/staff/alerts">
            <Button variant="danger" className="text-xs h-9 px-4">
              Manage Unclaimed Orders
            </Button>
          </Link>
        </div>
      )}

      {/* 8 Metric KPI Cards Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-8">
        <Card className="p-4 border-amber-200 bg-amber-50/40">
          <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wide">Today's Total</span>
          <p className="display text-2xl font-bold text-ink mt-1">{metrics.ordersToday}</p>
          <span className="text-[10px] text-muted">All active & finished</span>
        </Card>

        <Card className="p-4 border-sky-200 bg-sky-50/40">
          <span className="text-[11px] font-semibold text-sky-800 uppercase tracking-wide">New / Pending</span>
          <p className="display text-2xl font-bold text-sky-900 mt-1">{metrics.pending}</p>
          <span className="text-[10px] text-muted">Awaiting confirm</span>
        </Card>

        <Card className="p-4 border-orange-200 bg-orange-50/40">
          <span className="text-[11px] font-semibold text-roast uppercase tracking-wide">In Roasting</span>
          <p className="display text-2xl font-bold text-roast mt-1">{metrics.preparing}</p>
          <span className="text-[10px] text-muted">Cooking on grill</span>
        </Card>

        <Card className="p-4 border-lime-200 bg-lime-50/40">
          <span className="text-[11px] font-semibold text-leaf uppercase tracking-wide">Ready for Pack</span>
          <p className="display text-2xl font-bold text-leaf mt-1">{metrics.ready}</p>
          <span className="text-[10px] text-muted">In warmer box</span>
        </Card>

        <Card className="p-4 border-indigo-200 bg-indigo-50/40">
          <span className="text-[11px] font-semibold text-indigo-800 uppercase tracking-wide">Out For Delivery</span>
          <p className="display text-2xl font-bold text-indigo-900 mt-1">{metrics.outForDelivery}</p>
          <span className="text-[10px] text-muted">With rider</span>
        </Card>

        <Card className="p-4 border-zinc-200 bg-zinc-50">
          <span className="text-[11px] font-semibold text-zinc-700 uppercase tracking-wide">Completed</span>
          <p className="display text-2xl font-bold text-zinc-800 mt-1">{metrics.completed}</p>
          <span className="text-[10px] text-muted">Fulfilled today</span>
        </Card>

        <Card className={`p-4 ${metrics.unclaimed > 0 ? "border-red-400 bg-red-50 text-red-900" : "border-line bg-paper"}`}>
          <span className="text-[11px] font-semibold text-danger uppercase tracking-wide">Unclaimed</span>
          <p className="display text-2xl font-bold text-danger mt-1">{metrics.unclaimed}</p>
          <span className="text-[10px] text-muted">Holding warning</span>
        </Card>

        <Card className={`p-4 ${metrics.soldOut > 0 ? "border-amber-300 bg-amber-50" : "border-line bg-paper"}`}>
          <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wide">Sold-Out</span>
          <p className="display text-2xl font-bold text-amber-900 mt-1">{metrics.soldOut}</p>
          <span className="text-[10px] text-muted">Zero stock items</span>
        </Card>
      </div>

      {/* Analytics & Upcoming Orders Grid */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Recharts 7-Day Trend Chart */}
        <Card className="p-6 lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <div>
              <h2 className="display text-lg font-bold text-ink">7-Day Order & Fulfillment Volume</h2>
              <p className="text-xs text-muted">Daily incoming customer orders vs completed orders</p>
            </div>
            <span className="text-xs text-leaf font-semibold flex items-center gap-1 bg-leaf-soft px-2.5 py-1 rounded-full">
              <TrendingUp className="h-3.5 w-3.5" /> High Demand
            </span>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={series} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eadfce" />
                <XAxis dataKey="label" stroke="#6d5e52" fontSize={12} tickLine={false} />
                <YAxis stroke="#6d5e52" fontSize={12} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fffbf5",
                    borderColor: "#eadfce",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
                <Bar dataKey="orders" name="Incoming Orders" fill="#c2410c" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed" name="Completed" fill="#3f6212" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Upcoming Scheduled Orders */}
        <Card className="p-6 lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <div>
              <h2 className="display text-lg font-bold text-ink">Upcoming Schedules</h2>
              <p className="text-xs text-muted">Orders queued for immediate or later prep</p>
            </div>
            <Link to="/staff/queue" className="text-xs font-semibold text-roast hover:underline">
              View All
            </Link>
          </div>

          {upcoming.length === 0 ? (
            <p className="text-xs text-muted text-center py-8">No upcoming scheduled orders.</p>
          ) : (
            <div className="divide-y divide-line">
              {upcoming.map((order) => (
                <div key={order.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-ink">{order.orderNumber}</span>
                      <span className="text-[11px] text-muted">({order.customer?.name})</span>
                      <span className="text-[10px] bg-cream px-1.5 py-0.5 rounded border border-line">
                        {order.type}
                      </span>
                    </div>
                    <p className="text-muted text-[11px] flex items-center gap-1">
                      <Clock className="h-3 w-3 text-roast" />
                      Scheduled: <strong>{formatTime(order.scheduledAt)}</strong>
                    </p>
                  </div>
                  <Link to={`/orders/${order.id}`}>
                    <Button variant="ghost" className="h-7 px-2 text-xs">
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Recent Orders & Audit Log Stream */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Recent Orders Table */}
        <Card className="p-6 lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <h2 className="display text-lg font-bold text-ink">Recent Orders Placed</h2>
            <Link to="/staff/queue" className="text-xs font-semibold text-roast hover:underline">
              Go to Full Queue →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-line text-muted">
                <tr>
                  <th className="pb-2 font-semibold">Order</th>
                  <th className="pb-2 font-semibold">Customer</th>
                  <th className="pb-2 font-semibold">Items</th>
                  <th className="pb-2 font-semibold">Total</th>
                  <th className="pb-2 font-semibold">Status</th>
                  <th className="pb-2 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-cream/50 transition">
                    <td className="py-3 font-bold text-ink">{order.orderNumber}</td>
                    <td className="py-3 text-muted">{order.customer?.name}</td>
                    <td className="py-3 text-muted max-w-[180px] truncate">
                      {order.items.map((i) => `${i.quantity}x ${i.productName}`).join(", ")}
                    </td>
                    <td className="py-3 font-semibold text-ink">{formatPeso(order.total)}</td>
                    <td className="py-3">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="py-3 text-right">
                      <Link to={`/orders/${order.id}`}>
                        <Button variant="outline" className="h-7 px-2 text-xs">
                          Inspect
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Live Operational Activity Log */}
        <Card className="p-6 lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <h2 className="display text-lg font-bold text-ink">Recent Activity</h2>
            <span className="text-[11px] text-muted">Live Stream</span>
          </div>

          <div className="space-y-3">
            {recentHistory.map((h) => (
              <div key={h.id} className="flex gap-2.5 text-xs">
                <span className="mt-1 h-2 w-2 rounded-full bg-roast shrink-0" />
                <div>
                  <p className="font-semibold text-ink">
                    {h.order?.orderNumber ? `${h.order.orderNumber}: ` : ""}
                    {h.action.replaceAll("_", " ")}
                  </p>
                  <p className="text-[11px] text-muted">
                    by {h.actorName} ({h.actorRole}) • {formatTime(h.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
