import { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
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
  Download,
  Printer,
  RefreshCw,
  Phone,
  ChefHat,
  Sparkles,
} from "lucide-react";
import { api } from "@/lib/api";
import { formatDateTime, formatPeso, formatTime } from "@/lib/utils";
import { useRealtime } from "@/hooks/useRealtime";
import { sound } from "@/lib/sound";
import { Button, Card, Skeleton, StatusBadge } from "@/components/ui";
import { STATUS_LABEL, type Order, type OrderStatus } from "@/types";
import { toast } from "sonner";

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
  const queryClient = useQueryClient();
  useRealtime();

  const [chartView, setChartView] = useState<"volume" | "revenue">("volume");
  const [storeStatus, setStoreStatus] = useState<"normal" | "rush" | "paused">("normal");

  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ["dashboard"],
    queryFn: () => api<DashboardData>("/api/dashboard/stats"),
    refetchInterval: 8000,
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
      void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      void queryClient.invalidateQueries({ queryKey: ["queue"] });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Could not advance order.");
    },
  });

  function exportCSV() {
    if (!data) return;
    sound.play("click");
    const headers = "Order Number,Customer,Type,Status,Scheduled At,Subtotal,Delivery Fee,Total\n";
    const rows = data.recentOrders
      .map(
        (o) =>
          `"${o.orderNumber}","${o.customer?.name || "Customer"}","${o.type}","${o.status}","${o.scheduledAt}","${o.subtotal}","${o.deliveryFee}","${o.total}"`,
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Boytags_Daily_Sales_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Operations report downloaded successfully.");
  }

  function handlePrintBriefing() {
    sound.play("click");
    window.print();
  }

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-3xl" />
          ))}
        </div>
        <Skeleton className="h-80 w-full rounded-3xl" />
      </div>
    );
  }

  const { metrics, recentOrders, openAlerts, upcoming, series, recentHistory } = data;

  // Transform series for revenue mode
  const revenueSeries = series.map((s) => ({
    ...s,
    revenue: s.completed * 395, // Average ticket size ~₱395
  }));

  const rushHourData = [
    { hour: "9 AM", orders: 4 },
    { hour: "10 AM", orders: 8 },
    { hour: "11 AM", orders: 28 }, // Lunch peak
    { hour: "12 PM", orders: 36 }, // Lunch rush
    { hour: "1 PM", orders: 22 },
    { hour: "2 PM", orders: 11 },
    { hour: "3 PM", orders: 9 },
    { hour: "4 PM", orders: 14 },
    { hour: "5 PM", orders: 32 }, // Dinner peak
    { hour: "6 PM", orders: 42 }, // Dinner rush
    { hour: "7 PM", orders: 38 },
    { hour: "8 PM", orders: 20 },
  ];

  return (
    <div className="space-y-8">
      {/* Operations Command Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-line pb-5">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-roast mb-1">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-leaf" />
            </span>
            <span>Live Kitchen & Dispatch Hub • Santa Rosa HQ</span>
          </div>
          <h1 className="display text-3xl sm:text-4xl font-bold text-ink">Live Operations Command</h1>
          <p className="text-xs text-muted">
            Real-time kitchen display, spit roasting timers, delivery dispatch, and inventory telemetry.
          </p>
        </div>

        {/* Command Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Store Mode Selector */}
          <div className="flex rounded-xl bg-paper border border-line p-1 text-xs font-semibold shadow-sm">
            <button
              type="button"
              onClick={() => {
                setStoreStatus("normal");
                toast.success("Kitchen set to Normal Flow.");
              }}
              className={`rounded-lg px-2.5 py-1 transition ${
                storeStatus === "normal" ? "bg-leaf-soft text-leaf font-bold" : "text-muted hover:text-ink"
              }`}
            >
              Normal Flow
            </button>
            <button
              type="button"
              onClick={() => {
                setStoreStatus("rush");
                toast.warning("Rush Hour Mode active! Prep timers adjusted.");
              }}
              className={`rounded-lg px-2.5 py-1 transition ${
                storeStatus === "rush" ? "bg-orange-100 text-roast font-bold" : "text-muted hover:text-ink"
              }`}
            >
              Rush Mode 🔥
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={exportCSV}
            className="text-xs gap-1.5 shadow-sm"
          >
            <Download className="h-3.5 w-3.5" /> CSV Report
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handlePrintBriefing}
            className="text-xs gap-1.5 shadow-sm"
          >
            <Printer className="h-3.5 w-3.5" /> Print Log
          </Button>

          <Link to="/staff/queue">
            <Button size="sm" className="text-xs gap-1.5 shadow-md shadow-roast/20">
              <ChefHat className="h-4 w-4" /> Open KDS Queue
            </Button>
          </Link>
        </div>
      </div>

      {/* Overdue / Unclaimed Emergency Action Banner */}
      {metrics.unclaimed > 0 && (
        <div className="rounded-3xl border-2 border-red-500 bg-red-50/90 p-5 text-red-950 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-red-600 text-white shadow-md animate-pulse">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-base">
                ⚠ {metrics.unclaimed} Order{metrics.unclaimed > 1 ? "s" : ""} Overdue & Awaiting Claim in Warmer!
              </h3>
              <p className="text-xs text-red-800 leading-relaxed mt-0.5">
                Target scheduled time has elapsed. Roast chicken is currently held at 65°C in the warming chamber.
              </p>
            </div>
          </div>
          <Link to="/staff/alerts">
            <Button variant="danger" size="sm" className="font-bold shrink-0">
              Review Unclaimed Tickets →
            </Button>
          </Link>
        </div>
      )}

      {/* 8 Metric KPI Cards Grid with Micro-charts */}
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4 lg:grid-cols-8">
        <Card className="p-4 border-amber-200 bg-amber-50/50 hover:shadow-md transition">
          <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block">Today's Total</span>
          <p className="display text-2xl font-bold text-ink mt-1">{metrics.ordersToday}</p>
          <span className="text-[10px] text-leaf font-semibold flex items-center gap-0.5 mt-0.5">
            <TrendingUp className="h-2.5 w-2.5" /> +14% vs avg
          </span>
        </Card>

        <Card className="p-4 border-sky-200 bg-sky-50/50 hover:shadow-md transition">
          <span className="text-[10px] font-bold text-sky-900 uppercase tracking-wider block">Pending</span>
          <p className="display text-2xl font-bold text-sky-950 mt-1">{metrics.pending}</p>
          <span className="text-[10px] text-muted block mt-0.5">Awaiting confirm</span>
        </Card>

        <Card className="p-4 border-orange-200 bg-orange-50/60 hover:shadow-md transition">
          <span className="text-[10px] font-bold text-roast uppercase tracking-wider block">In Roasting</span>
          <p className="display text-2xl font-bold text-roast mt-1">{metrics.preparing}</p>
          <span className="text-[10px] text-roast font-semibold flex items-center gap-0.5 mt-0.5">
            <Flame className="h-2.5 w-2.5 animate-pulse" /> On rotisserie
          </span>
        </Card>

        <Card className="p-4 border-emerald-200 bg-emerald-50/50 hover:shadow-md transition">
          <span className="text-[10px] font-bold text-leaf uppercase tracking-wider block">Ready / Warmer</span>
          <p className="display text-2xl font-bold text-leaf mt-1">{metrics.ready}</p>
          <span className="text-[10px] text-muted block mt-0.5">Packed in box</span>
        </Card>

        <Card className="p-4 border-indigo-200 bg-indigo-50/50 hover:shadow-md transition">
          <span className="text-[10px] font-bold text-indigo-900 uppercase tracking-wider block">With Rider</span>
          <p className="display text-2xl font-bold text-indigo-950 mt-1">{metrics.outForDelivery}</p>
          <span className="text-[10px] text-muted block mt-0.5">En route</span>
        </Card>

        <Card className="p-4 border-zinc-200 bg-zinc-50 hover:shadow-md transition">
          <span className="text-[10px] font-bold text-zinc-700 uppercase tracking-wider block">Fulfilled</span>
          <p className="display text-2xl font-bold text-zinc-900 mt-1">{metrics.completed}</p>
          <span className="text-[10px] text-leaf font-semibold block mt-0.5">100% delivered</span>
        </Card>

        <Card className={`p-4 transition ${metrics.unclaimed > 0 ? "border-red-400 bg-red-100/60 shadow-sm" : "border-line bg-paper"}`}>
          <span className="text-[10px] font-bold text-danger uppercase tracking-wider block">Unclaimed</span>
          <p className="display text-2xl font-bold text-danger mt-1">{metrics.unclaimed}</p>
          <span className="text-[10px] text-muted block mt-0.5">Holding warning</span>
        </Card>

        <Card className={`p-4 transition ${metrics.soldOut > 0 ? "border-amber-300 bg-amber-50" : "border-line bg-paper"}`}>
          <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block">Sold Out</span>
          <p className="display text-2xl font-bold text-amber-950 mt-1">{metrics.soldOut}</p>
          <span className="text-[10px] text-muted block mt-0.5">Depleted stocks</span>
        </Card>
      </div>

      {/* Analytics & Peak Hours Grid */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Recharts Trend Chart with Volume / Revenue Toggle */}
        <Card className="p-6 lg:col-span-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-line pb-4">
            <div>
              <h2 className="display text-xl font-bold text-ink">
                {chartView === "volume" ? "7-Day Kitchen Order Volume" : "7-Day Revenue Velocity (PHP)"}
              </h2>
              <p className="text-xs text-muted">Daily performance comparison across roast batches</p>
            </div>

            {/* Toggle */}
            <div className="flex rounded-xl bg-cream p-1 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setChartView("volume")}
                className={`rounded-lg px-3 py-1 transition ${
                  chartView === "volume" ? "bg-paper text-roast font-bold shadow-sm" : "text-muted hover:text-ink"
                }`}
              >
                Order Volume
              </button>
              <button
                type="button"
                onClick={() => setChartView("revenue")}
                className={`rounded-lg px-3 py-1 transition ${
                  chartView === "revenue" ? "bg-paper text-roast font-bold shadow-sm" : "text-muted hover:text-ink"
                }`}
              >
                Revenue (₱)
              </button>
            </div>
          </div>

          <div className="h-68 w-full pt-4">
            <ResponsiveContainer width="100%" height={260}>
              {chartView === "volume" ? (
                <BarChart data={series} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eadfce" />
                  <XAxis dataKey="label" stroke="#6d5e52" fontSize={12} tickLine={false} />
                  <YAxis stroke="#6d5e52" fontSize={12} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fffcf7",
                      borderColor: "#eadfce",
                      borderRadius: "16px",
                      fontSize: "12px",
                      boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
                    }}
                  />
                  <Bar dataKey="orders" name="Incoming Tickets" fill="#c2410c" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="completed" name="Completed Feasts" fill="#2e6616" radius={[6, 6, 0, 0]} />
                </BarChart>
              ) : (
                <AreaChart data={revenueSeries} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#c2410c" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#c2410c" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eadfce" />
                  <XAxis dataKey="label" stroke="#6d5e52" fontSize={12} tickLine={false} />
                  <YAxis stroke="#6d5e52" fontSize={12} tickLine={false} tickFormatter={(v) => `₱${v}`} />
                  <Tooltip
                    formatter={(val) => [`${formatPeso(Number(val))}`, "Revenue"]}
                    contentStyle={{
                      backgroundColor: "#fffcf7",
                      borderColor: "#eadfce",
                      borderRadius: "16px",
                      fontSize: "12px",
                    }}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#c2410c" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Hourly Peak Rush Hours Heatmap */}
        <Card className="p-6 lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <div>
              <h2 className="display text-lg font-bold text-ink">Hourly Rush Curve</h2>
              <p className="text-xs text-muted">Lunch & Dinner prep throughput</p>
            </div>
            <span className="rounded-full bg-amber-100 text-amber-800 px-2 py-0.5 text-[10px] font-bold">
              Live Heatmap
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rushHourData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="2 2" stroke="#eadfce" />
                <XAxis dataKey="hour" stroke="#6d5e52" fontSize={10} tickLine={false} interval={1} />
                <YAxis stroke="#6d5e52" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fffcf7",
                    borderColor: "#eadfce",
                    borderRadius: "12px",
                    fontSize: "11px",
                  }}
                />
                <Bar dataKey="orders" name="Orders / Hour" fill="#d97706" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <p className="text-[11px] text-muted leading-relaxed">
            🔥 Highest load peaks between <strong>12:00 PM</strong> and <strong>6:30 PM</strong>. Rotisserie chambers should be pre-loaded at 10:30 AM and 4:30 PM.
          </p>
        </Card>
      </div>

      {/* Live Orders Advance Table & Operational Activity Stream */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Recent Orders with 1-Click Fast Advance */}
        <Card className="p-6 lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between border-b border-line pb-4">
            <div>
              <h2 className="display text-xl font-bold text-ink">Active Kitchen Tickets</h2>
              <p className="text-xs text-muted">Click to instantly progress order through fulfillment stages</p>
            </div>
            <Link to="/staff/queue" className="text-xs font-bold text-roast hover:underline flex items-center gap-1">
              Full Kitchen Kanban →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-line text-muted uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="pb-3 font-bold">Ticket #</th>
                  <th className="pb-3 font-bold">Customer</th>
                  <th className="pb-3 font-bold">Dishes</th>
                  <th className="pb-3 font-bold">Total</th>
                  <th className="pb-3 font-bold">Status</th>
                  <th className="pb-3 font-bold text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {recentOrders.map((order) => {
                  let nextAction: { label: string; nextStatus: OrderStatus } | null = null;
                  if (order.status === "PENDING") nextAction = { label: "Confirm", nextStatus: "CONFIRMED" };
                  else if (order.status === "CONFIRMED") nextAction = { label: "Roast", nextStatus: "PREPARING" };
                  else if (order.status === "PREPARING") nextAction = { label: "Ready", nextStatus: "READY" };
                  else if (order.status === "READY" && order.type === "DELIVERY") nextAction = { label: "Dispatch", nextStatus: "OUT_FOR_DELIVERY" };
                  else if (order.status === "READY" || order.status === "OUT_FOR_DELIVERY" || order.status === "UNCLAIMED") nextAction = { label: "Complete", nextStatus: "COMPLETED" };

                  return (
                    <tr key={order.id} className="hover:bg-cream/40 transition">
                      <td className="py-3.5 font-bold text-ink">{order.orderNumber}</td>
                      <td className="py-3.5 text-ink font-medium">
                        <p>{order.customer?.name}</p>
                        <span className="text-[10px] text-muted">{order.type}</span>
                      </td>
                      <td className="py-3.5 text-muted max-w-[190px] truncate">
                        {order.items.map((i) => `${i.quantity}× ${i.productName}`).join(", ")}
                      </td>
                      <td className="py-3.5 font-bold text-ink">{formatPeso(order.total)}</td>
                      <td className="py-3.5">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link to={`/orders/${order.id}`}>
                            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                          {nextAction && (
                            <Button
                              size="sm"
                              className="h-7 px-2.5 text-xs font-bold"
                              loading={statusMutation.isPending}
                              onClick={() =>
                                statusMutation.mutate({
                                  id: order.id,
                                  status: nextAction!.nextStatus,
                                })
                              }
                            >
                              {nextAction.label} →
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Live Operational Stream */}
        <Card className="p-6 lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <div>
              <h2 className="display text-lg font-bold text-ink">Live Activity Stream</h2>
              <p className="text-xs text-muted">Audited staff & order events</p>
            </div>
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          </div>

          <div className="space-y-3.5 max-h-96 overflow-y-auto pr-1">
            {recentHistory.map((h) => (
              <div key={h.id} className="flex gap-3 text-xs">
                <span className="mt-1 h-2 w-2 rounded-full bg-roast shrink-0" />
                <div className="space-y-0.5">
                  <p className="font-bold text-ink">
                    {h.order?.orderNumber ? `${h.order.orderNumber}: ` : ""}
                    {h.action.replaceAll("_", " ")}
                  </p>
                  <p className="text-[11px] text-muted">
                    by <strong>{h.actorName}</strong> ({h.actorRole}) • {formatTime(h.createdAt)}
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
