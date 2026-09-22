import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Bell, ClipboardList, LayoutDashboard, LogOut, Menu, ShoppingBag, Store, Truck, UserRound, UtensilsCrossed } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useRealtime } from "@/hooks/useRealtime";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <span className="grid h-9 w-9 place-items-center rounded-full bg-roast text-sm font-bold text-white">B</span>
      <span className="leading-tight">
        <span className="display block text-lg leading-none">Boytag's</span>
        <span className="text-[11px] uppercase tracking-[0.18em] text-muted">Lechon Manok</span>
      </span>
    </Link>
  );
}

export function StoreShell() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const { data: notes } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => api<{ unread: number }>("/api/notifications"),
    enabled: Boolean(user),
  });
  useRealtime();
  const staff = user && user.role !== "CUSTOMER";

  return (
    <div className="min-h-screen bg-cream pb-20 md:pb-0">
      <header className="sticky top-0 z-30 border-b border-line/80 bg-cream/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Brand />
          <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
            <NavLink to="/" className={navClass}>Home</NavLink>
            <NavLink to="/menu" className={navClass}>Menu</NavLink>
            <NavLink to="/orders" className={navClass}>Orders</NavLink>
            {staff ? <NavLink to="/staff" className={navClass}>Kitchen</NavLink> : null}
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <Link to="/notifications" className="relative rounded-full p-2 hover:bg-line/60" aria-label="Notifications">
                <Bell className="h-5 w-5" />
                {notes?.unread ? <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-roast" /> : null}
              </Link>
            ) : null}
            <Link to="/cart" className="relative rounded-full p-2 hover:bg-line/60" aria-label="Cart">
              <ShoppingBag className="h-5 w-5" />
              {count ? <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-roast px-1 text-[10px] text-white">{count}</span> : null}
            </Link>
            {user ? (
              <Button variant="outline" className="hidden sm:inline-flex" onClick={logout}>
                <LogOut className="h-4 w-4" /> Sign out
              </Button>
            ) : (
              <Link to="/login"><Button>Sign in</Button></Link>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-line bg-paper md:hidden">
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
    navigate("/");
    return null;
  }
  return (
    <div className="min-h-screen bg-[#f3eee6] md:grid md:grid-cols-[240px_1fr]">
      <aside className="hidden border-r border-line bg-paper md:flex md:flex-col md:p-5">
        <Brand />
        <nav className="mt-8 space-y-1 text-sm font-medium">
          <StaffLink to="/staff" icon={<LayoutDashboard className="h-4 w-4" />} label="Dashboard" end />
          <StaffLink to="/staff/queue" icon={<ClipboardList className="h-4 w-4" />} label="Order queue" />
          <StaffLink to="/staff/products" icon={<UtensilsCrossed className="h-4 w-4" />} label="Products" />
          <StaffLink to="/staff/alerts" icon={<Bell className="h-4 w-4" />} label="Alerts" />
          <StaffLink to="/menu" icon={<Truck className="h-4 w-4" />} label="Customer menu" />
        </nav>
        <div className="mt-auto pt-6 text-sm">
          <p className="font-semibold">{user.name}</p>
          <p className="text-muted">{user.role}</p>
          <Button variant="ghost" className="mt-3 px-0" onClick={logout}>Sign out</Button>
        </div>
      </aside>
      <div>
        <header className="flex items-center justify-between border-b border-line bg-paper px-4 py-3 md:hidden">
          <Brand />
          <Menu className="h-5 w-5" />
        </header>
        <div className="p-4 md:p-8">
          <Outlet />
        </div>
        <nav className="fixed inset-x-0 bottom-0 grid grid-cols-4 border-t border-line bg-paper md:hidden">
          <MobileLink to="/staff" icon={<LayoutDashboard className="h-5 w-5" />} label="Dash" />
          <MobileLink to="/staff/queue" icon={<ClipboardList className="h-5 w-5" />} label="Queue" />
          <MobileLink to="/staff/products" icon={<UtensilsCrossed className="h-5 w-5" />} label="Menu" />
          <MobileLink to="/staff/alerts" icon={<Bell className="h-5 w-5" />} label="Alerts" />
        </nav>
      </div>
    </div>
  );
}

function navClass({ isActive }: { isActive: boolean }) {
  return cn("transition hover:text-roast", isActive && "text-roast");
}

function MobileLink({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <NavLink to={to} className={({ isActive }) => cn("flex flex-col items-center gap-1 py-2 text-[11px]", isActive ? "text-roast" : "text-muted")}>
      {icon}
      {label}
    </NavLink>
  );
}

function StaffLink({ to, icon, label, end }: { to: string; icon: React.ReactNode; label: string; end?: boolean }) {
  return (
    <NavLink to={to} end={end} className={({ isActive }) => cn("flex items-center gap-2 rounded-xl px-3 py-2", isActive ? "bg-cream text-roast" : "text-muted hover:bg-cream")}>
      {icon}
      {label}
    </NavLink>
  );
}

export function RequireAuth({ children, roles }: { children: React.ReactNode; roles?: string[] }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="p-10 text-sm text-muted">Checking your session…</div>;
  if (!user) {
    window.location.href = `/login?next=${encodeURIComponent(location.pathname)}`;
    return null;
  }
  if (roles && !roles.includes(user.role)) return <div className="p-10">You do not have access to this area.</div>;
  return children;
}
