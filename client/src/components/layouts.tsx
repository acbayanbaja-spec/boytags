import { Link, NavLink, Outlet, useLocation, useNavigate, Navigate } from "react-router-dom";
import {
  Bell,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  ShoppingBag,
  Store,
  Truck,
  UserRound,
  UtensilsCrossed,
  Flame,
  ChevronRight,
  ShieldCheck,
  MapPin,
  Clock,
  Sparkles,
  Phone,
} from "lucide-react";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useRealtime } from "@/hooks/useRealtime";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button, SoundToggle } from "@/components/ui";
import type { Order } from "@/types";

export function Brand({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  return (
    <Link to="/" className="group flex items-center gap-2.5 transition">
      <div className="relative grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-orange-500 via-roast to-amber-700 text-white shadow-md shadow-roast/30 transition group-hover:scale-105">
        <Flame className="h-5 w-5 animate-pulse" />
      </div>
      <div className="leading-tight">
        <span className="display block text-xl font-bold tracking-tight text-ink group-hover:text-roast transition">
          Boytag's
        </span>
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted">
          Lechon Manok & Grill
        </span>
      </div>
    </Link>
  );
}

export function StoreShell() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  useRealtime();

  // Check unread notifications
  const { data: notes } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => api<{ unread: number }>("/api/notifications"),
    enabled: Boolean(user),
    refetchInterval: 10000,
  });

  // Check if current user has an active in-progress order to show live tracking pill in header
  const { data: activeOrders } = useQuery<Order[]>({
    queryKey: ["orders", "active-preview"],
    queryFn: () => api<Order[]>("/api/orders"),
    enabled: Boolean(user),
    refetchInterval: 6000,
  });

  const liveOrder = activeOrders?.find((o) =>
    ["PENDING", "CONFIRMED", "PREPARING", "READY", "OUT_FOR_DELIVERY"].includes(o.status),
  );

  const isStaff = user && (user.role === "STAFF" || user.role === "ADMIN");

  return (
    <div className="min-h-screen bg-cream pb-20 md:pb-0 flex flex-col justify-between">
      <div>
        {/* Sticky Header with Frosted Glassmorphism */}
        <header className="sticky top-0 z-40 border-b border-line/80 bg-cream/90 backdrop-blur-md transition">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Brand />

            {/* Desktop Navigation */}
            <nav className="hidden items-center gap-7 text-sm font-semibold md:flex">
              <NavLink to="/" className={navClass}>
                Home
              </NavLink>
              <NavLink to="/menu" className={navClass}>
                Menu
              </NavLink>
              <NavLink to="/orders" className={navClass}>
                My Orders
              </NavLink>
              {isStaff ? (
                <NavLink
                  to="/staff"
                  className="rounded-full bg-roast/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-roast transition hover:bg-roast/20"
                >
                  Kitchen Dispatch →
                </NavLink>
              ) : null}
            </nav>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <SoundToggle />

              {user ? (
                <Link
                  to="/notifications"
                  className="relative rounded-full p-2 text-ink hover:bg-line/60 transition"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  {notes && notes.unread > 0 ? (
                    <span className="absolute right-1 top-1 flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-roast opacity-75" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-roast" />
                    </span>
                  ) : null}
                </Link>
              ) : null}

              {/* Cart Button */}
              <Link
                to="/cart"
                className="relative rounded-full p-2 text-ink hover:bg-line/60 transition"
                aria-label="Cart"
              >
                <ShoppingBag className="h-5 w-5" />
                {count > 0 ? (
                  <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-roast px-1 text-[11px] font-bold text-white shadow-sm animate-bounce">
                    {count}
                  </span>
                ) : null}
              </Link>

              {/* Auth / Profile */}
              {user ? (
                <div className="hidden sm:flex items-center gap-2 pl-1">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 rounded-xl border border-line bg-paper px-3 py-1.5 text-xs font-semibold text-ink hover:border-roast/40 transition"
                  >
                    <span className="grid h-6 w-6 place-items-center rounded-lg bg-cream font-bold text-roast text-[11px]">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="max-w-[100px] truncate">{user.name.split(" ")[0]}</span>
                  </Link>
                  <Button
                    variant="ghost"
                    className="h-8 px-2 text-xs text-muted hover:text-danger"
                    onClick={logout}
                    title="Sign Out"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Link to="/login">
                  <Button size="sm" className="shadow-sm">
                    Sign in
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Active Live Order Pill Banner (shows if user has an order cooking / delivering) */}
          {liveOrder && (
            <div className="bg-gradient-to-r from-orange-700 via-roast to-amber-700 text-white text-xs py-1.5 px-4 shadow-inner">
              <div className="mx-auto max-w-6xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-amber-300 animate-ping" />
                  <span className="font-semibold">
                    Order {liveOrder.orderNumber}: {liveOrder.status.replace(/_/g, " ")}
                  </span>
                </div>
                <Link
                  to={`/orders/${liveOrder.id}`}
                  className="font-bold underline hover:text-amber-200 transition flex items-center gap-1"
                >
                  Track Live <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          )}
        </header>

        {/* Main Content View */}
        <main className="mx-auto max-w-6xl px-4 py-6">
          <Outlet />
        </main>
      </div>

      {/* High-End Culinary Footer */}
      <footer className="mt-20 border-t border-line bg-[#20120a] text-[#ead8c8] pt-12 pb-16 px-4">
        <div className="mx-auto max-w-6xl grid gap-8 md:grid-cols-4 text-xs">
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2 text-white">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-roast text-white">
                <Flame className="h-5 w-5" />
              </div>
              <span className="display text-xl font-bold">Boytag's</span>
            </div>
            <p className="text-[#c5b1a0] leading-relaxed">
              Santa Rosa's beloved lechon manok house. Native garlic and lemongrass infused, roasted slowly over live charcoal for peerless crispiness.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold uppercase tracking-wider text-amber-300">Quick Links</h4>
            <ul className="space-y-1.5 text-[#c5b1a0]">
              <li><Link to="/menu" className="hover:text-white transition">Full Roast Menu</Link></li>
              <li><Link to="/orders" className="hover:text-white transition">Track Your Order</Link></li>
              <li><Link to="/login" className="hover:text-white transition">Customer Sign In</Link></li>
              <li><Link to="/staff" className="hover:text-white transition">Kitchen Dispatch Portal</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold uppercase tracking-wider text-amber-300">Store Hours & Branch</h4>
            <p className="flex items-start gap-1.5 text-[#c5b1a0]">
              <MapPin className="h-4 w-4 shrink-0 text-roast mt-0.5" />
              <span>Maharlika Highway, Brgy. Dila, Santa Rosa, Laguna</span>
            </p>
            <p className="flex items-center gap-1.5 text-[#c5b1a0]">
              <Clock className="h-4 w-4 shrink-0 text-roast" />
              <span>Open Daily: 9:00 AM – 9:00 PM</span>
            </p>
            <p className="flex items-center gap-1.5 text-[#c5b1a0]">
              <Phone className="h-4 w-4 shrink-0 text-roast" />
              <span>Hotline: (049) 530-0192</span>
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-bold uppercase tracking-wider text-amber-300">Boytag's Standard</h4>
            <div className="space-y-1.5 text-[#c5b1a0]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-leaf" />
                <span>100% Fresh Charcoal Grilled</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <span>Native Lemongrass Aromatics</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-sky-400" />
                <span>Direct Doorstep Pinpointing</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-6xl mt-8 pt-6 border-t border-white/10 text-center text-[11px] text-[#a18c7c]">
          © {new Date().getFullYear()} Boytag's Lechon Manok & Chicken House. All rights reserved.
        </div>
      </footer>

      {/* Mobile Sticky Bottom Nav with Active Indicator */}
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-line bg-paper/95 backdrop-blur-md md:hidden shadow-lg">
        <MobileLink to="/" icon={<Store className="h-5 w-5" />} label="Home" />
        <MobileLink to="/menu" icon={<UtensilsCrossed className="h-5 w-5" />} label="Menu" />
        <MobileLink to="/orders" icon={<ClipboardList className="h-5 w-5" />} label="Orders" />
        <MobileLink to="/profile" icon={<UserRound className="h-5 w-5" />} label="Profile" />
      </nav>
    </div>
  );
}

export function StaffShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  useRealtime();

  if (!user || user.role === "CUSTOMER") {
    return <Navigate to="/login?next=/staff" replace />;
  }

  return (
    <div className="min-h-screen bg-[#f4eee6] md:grid md:grid-cols-[250px_1fr]">
      {/* Desktop Staff Sidebar */}
      <aside className="hidden border-r border-line bg-paper md:flex md:flex-col md:p-6 shadow-sm">
        <Brand />

        <div className="mt-8 space-y-1 text-sm font-semibold">
          <StaffLink to="/staff" icon={<LayoutDashboard className="h-4 w-4" />} label="Live Dashboard" end />
          <StaffLink to="/staff/queue" icon={<ClipboardList className="h-4 w-4" />} label="Kitchen Queue (KDS)" />
          <StaffLink to="/staff/products" icon={<UtensilsCrossed className="h-4 w-4" />} label="Inventory & Menu" />
          <StaffLink to="/staff/alerts" icon={<Bell className="h-4 w-4" />} label="Unclaimed Alerts" />
          <StaffLink to="/" icon={<Store className="h-4 w-4" />} label="Customer Storefront" />
        </div>

        <div className="mt-auto space-y-3 rounded-2xl border border-line bg-cream p-4 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-ink uppercase tracking-wider text-[10px]">Operations Station</span>
            <SoundToggle />
          </div>
          <div>
            <p className="font-bold text-sm text-ink">{user.name}</p>
            <span className="inline-block rounded bg-roast/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-roast mt-0.5">
              {user.role}
            </span>
          </div>
          <Button variant="ghost" size="sm" className="w-full text-xs text-danger justify-start px-0 hover:bg-transparent" onClick={logout}>
            <LogOut className="h-3.5 w-3.5 mr-1.5" /> Sign out
          </Button>
        </div>
      </aside>

      {/* Main Staff Content View */}
      <div className="min-w-0">
        <header className="flex items-center justify-between border-b border-line bg-paper px-4 py-3 md:hidden">
          <Brand />
          <SoundToggle />
        </header>

        <div className="p-4 sm:p-8">
          <Outlet />
        </div>

        {/* Mobile Staff Bottom Bar */}
        <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-line bg-paper md:hidden shadow-lg">
          <MobileLink to="/staff" icon={<LayoutDashboard className="h-5 w-5" />} label="Dash" />
          <MobileLink to="/staff/queue" icon={<ClipboardList className="h-5 w-5" />} label="Queue" />
          <MobileLink to="/staff/products" icon={<UtensilsCrossed className="h-5 w-5" />} label="Inventory" />
          <MobileLink to="/staff/alerts" icon={<Bell className="h-5 w-5" />} label="Alerts" />
        </nav>
      </div>
    </div>
  );
}

function navClass({ isActive }: { isActive: boolean }) {
  return cn(
    "transition hover:text-roast relative py-1",
    isActive ? "text-roast font-bold" : "text-ink/80",
  );
}

function MobileLink({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex flex-col items-center gap-1 py-2 text-[11px] font-semibold transition",
          isActive ? "text-roast" : "text-muted",
        )
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}

function StaffLink({
  to,
  icon,
  label,
  end,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  end?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 transition font-medium",
          isActive
            ? "bg-roast text-white font-bold shadow-sm shadow-roast/20"
            : "text-muted hover:bg-cream hover:text-ink",
        )
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}

export function RequireAuth({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted text-sm">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-roast border-t-transparent" />
          <span>Verifying session with Boytag's...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={`/login?next=${encodeURIComponent(location.pathname)}`} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
