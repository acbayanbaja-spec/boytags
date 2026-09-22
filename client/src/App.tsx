import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { StoreShell, StaffShell, RequireAuth } from "@/components/layouts";
import { Button } from "@/components/ui";

// Customer Pages
import { HomePage } from "@/pages/HomePage";
import { MenuPage } from "@/pages/MenuPage";
import { CartPage } from "@/pages/CartPage";
import { CheckoutPage } from "@/pages/CheckoutPage";
import { OrdersPage } from "@/pages/OrdersPage";
import { OrderTrackingPage } from "@/pages/OrderTrackingPage";
import { ProfilePage } from "@/pages/ProfilePage";
import { NotificationsPage } from "@/pages/NotificationsPage";
import { AuthPage } from "@/pages/AuthPage";
import { ResetPasswordPage } from "@/pages/ResetPasswordPage";

// Staff Pages
import { StaffDashboardPage } from "@/pages/staff/DashboardPage";
import { StaffQueuePage } from "@/pages/staff/QueuePage";
import { StaffProductsPage } from "@/pages/staff/ProductsPage";
import { StaffAlertsPage } from "@/pages/staff/AlertsPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5000,
      retry: 1,
      refetchOnWindowFocus: true,
    },
  },
});

function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
      <span className="display text-6xl font-bold text-roast">404</span>
      <h1 className="display text-2xl font-bold text-ink mt-2">Page Not Found</h1>
      <p className="mt-1 text-xs text-muted max-w-sm">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link to="/" className="mt-6">
        <Button>Back to Boytag's Home</Button>
      </Link>
    </div>
  );
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <Toaster position="top-center" richColors closeButton />
            <Routes>
              {/* Customer Facing Store Routes */}
              <Route path="/" element={<StoreShell />}>
                <Route index element={<HomePage />} />
                <Route path="menu" element={<MenuPage />} />
                <Route path="cart" element={<CartPage />} />
                <Route
                  path="checkout"
                  element={
                    <RequireAuth>
                      <CheckoutPage />
                    </RequireAuth>
                  }
                />
                <Route
                  path="orders"
                  element={
                    <RequireAuth>
                      <OrdersPage />
                    </RequireAuth>
                  }
                />
                <Route
                  path="orders/:id"
                  element={
                    <RequireAuth>
                      <OrderTrackingPage />
                    </RequireAuth>
                  }
                />
                <Route
                  path="profile"
                  element={
                    <RequireAuth>
                      <ProfilePage />
                    </RequireAuth>
                  }
                />
                <Route
                  path="notifications"
                  element={
                    <RequireAuth>
                      <NotificationsPage />
                    </RequireAuth>
                  }
                />
                <Route path="login" element={<AuthPage />} />
                <Route path="reset-password" element={<ResetPasswordPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>

              {/* Staff / Admin Operations Routes */}
              <Route
                path="/staff"
                element={
                  <RequireAuth roles={["STAFF", "ADMIN"]}>
                    <StaffShell />
                  </RequireAuth>
                }
              >
                <Route index element={<StaffDashboardPage />} />
                <Route path="queue" element={<StaffQueuePage />} />
                <Route path="products" element={<StaffProductsPage />} />
                <Route path="alerts" element={<StaffAlertsPage />} />
                <Route path="*" element={<Navigate to="/staff" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
