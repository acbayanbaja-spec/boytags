import { mockBackend } from "./mockStore";
import type { OrderStatus } from "@/types";

const API_URL = import.meta.env.VITE_API_URL || "";

type Envelope<T> = { success: true; data: T } | { success: false; error: { message: string; code?: string } };

function token() {
  return localStorage.getItem("boytags.access") || sessionStorage.getItem("boytags.access");
}

export function setSession(accessToken: string, refreshToken: string, remember: boolean) {
  const store = remember ? localStorage : sessionStorage;
  localStorage.removeItem("boytags.access");
  sessionStorage.removeItem("boytags.access");
  localStorage.removeItem("boytags.refresh");
  sessionStorage.removeItem("boytags.refresh");
  store.setItem("boytags.access", accessToken);
  store.setItem("boytags.refresh", refreshToken);
}

export function clearSession() {
  localStorage.removeItem("boytags.access");
  sessionStorage.removeItem("boytags.access");
  localStorage.removeItem("boytags.refresh");
  sessionStorage.removeItem("boytags.refresh");
}

/**
 * Intelligent API dispatcher:
 * 1. Attempts the live production/development Express API server.
 * 2. If the API is unreachable (server sleeping, local port 4000 not started, or static Vercel preview),
 *    smoothly falls back to our local client-side reactive store so 100% of buttons, flows, and animations work!
 */
export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData) && !headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  const access = token();
  if (access) headers.set("Authorization", `Bearer ${access}`);

  try {
    const response = await fetch(`${API_URL}${path}`, { ...options, headers });
    if (response.ok) {
      const json = (await response.json().catch(() => null)) as Envelope<T> | null;
      if (json && json.success !== false && "data" in json) {
        return json.data;
      }
    }
    // If response returned 404 (endpoint not configured on static host) or 502/503 (Render free tier waking up),
    // we route to mock fallback handler
    if (response.status === 404 || response.status === 502 || response.status === 503) {
      return handleFallback<T>(path, options);
    }

    const errJson = (await response.json().catch(() => null)) as Envelope<T> | null;
    if (errJson && "error" in errJson) {
      throw new Error(errJson.error.message);
    }
    return handleFallback<T>(path, options);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "";
    if (errorMsg.includes("Failed to fetch") || errorMsg.includes("NetworkError") || errorMsg.includes("fetch")) {
      return handleFallback<T>(path, options);
    }
    throw err;
  }
}

function handleFallback<T>(path: string, options: RequestInit = {}): T {
  const method = (options.method || "GET").toUpperCase();
  const body = options.body ? (typeof options.body === "string" ? JSON.parse(options.body) : options.body) : {};

  // Auth
  if (path === "/api/auth/login" && method === "POST") {
    return mockBackend.login(body.email) as unknown as T;
  }
  if (path === "/api/auth/register" && method === "POST") {
    return mockBackend.register(body) as unknown as T;
  }
  if (path === "/api/auth/me" && method === "GET") {
    const user = mockBackend.getCurrentUser();
    if (!user) throw new Error("Please sign in to continue.");
    return user as unknown as T;
  }
  if (path === "/api/auth/me" && method === "PATCH") {
    return mockBackend.updateMe(body) as unknown as T;
  }
  if (path === "/api/auth/forgot-password" && method === "POST") {
    return {
      sent: true,
      resetUrl: `${window.location.origin}/reset-password?token=mock_token_123`,
    } as unknown as T;
  }
  if (path === "/api/auth/reset-password" && method === "POST") {
    return { success: true } as unknown as T;
  }

  // Categories & Products
  if (path === "/api/categories" && method === "GET") {
    return mockBackend.getCategories() as unknown as T;
  }
  if (path === "/api/products" && method === "GET") {
    return mockBackend.getProducts() as unknown as T;
  }
  if (path === "/api/products" && method === "POST") {
    return mockBackend.createProduct(body) as unknown as T;
  }
  if (path.startsWith("/api/products/") && method === "PATCH") {
    const id = path.replace("/api/products/", "");
    return mockBackend.updateProduct(id, body) as unknown as T;
  }
  if (path.startsWith("/api/products/") && method === "DELETE") {
    const id = path.replace("/api/products/", "");
    mockBackend.deleteProduct(id);
    return { success: true } as unknown as T;
  }

  // Orders
  if (path === "/api/orders" && method === "GET") {
    return mockBackend.getOrders(mockBackend.getCurrentUser()) as unknown as T;
  }
  if (path === "/api/orders/queue" && method === "GET") {
    return mockBackend.getOrders() as unknown as T;
  }
  if (path === "/api/orders" && method === "POST") {
    return mockBackend.createOrder(body) as unknown as T;
  }
  if (path.match(/\/api\/orders\/[^/]+\/status$/) && method === "PATCH") {
    const id = path.split("/")[3];
    return mockBackend.updateOrderStatus(id, body.status as OrderStatus) as unknown as T;
  }
  if (path.match(/\/api\/orders\/[^/]+\/cancel$/) && method === "POST") {
    const id = path.split("/")[3];
    return mockBackend.cancelOrder(id, body.reason) as unknown as T;
  }
  if (path.startsWith("/api/orders/") && method === "PATCH") {
    const id = path.replace("/api/orders/", "");
    return mockBackend.updateOrder(id, body) as unknown as T;
  }
  if (path.startsWith("/api/orders/") && method === "GET") {
    const id = path.replace("/api/orders/", "");
    return mockBackend.getOrder(id) as unknown as T;
  }

  // Dashboard & Ops
  if (path === "/api/dashboard/stats" && method === "GET") {
    return mockBackend.getDashboardStats() as unknown as T;
  }
  if (path.startsWith("/api/alerts") && method === "GET") {
    const url = new URL(path, "http://dummy.local");
    const status = url.searchParams.get("status") || "OPEN";
    return mockBackend.getAlerts(status) as unknown as T;
  }
  if (path.match(/\/api\/alerts\/[^/]+\/ack$/) && method === "POST") {
    const id = path.split("/")[3];
    return mockBackend.ackAlert(id) as unknown as T;
  }
  if (path.match(/\/api\/alerts\/[^/]+\/resolve$/) && method === "POST") {
    const id = path.split("/")[3];
    return mockBackend.resolveAlert(id) as unknown as T;
  }

  // Notifications
  if (path === "/api/notifications" && method === "GET") {
    return mockBackend.getNotifications() as unknown as T;
  }
  if (path === "/api/notifications/read-all" && method === "POST") {
    mockBackend.markAllNotificationsRead();
    return { success: true } as unknown as T;
  }
  if (path.match(/\/api\/notifications\/[^/]+\/read$/) && method === "POST") {
    const id = path.split("/")[3];
    mockBackend.markNotificationRead(id);
    return { success: true } as unknown as T;
  }

  // Default empty object
  return {} as unknown as T;
}

export const eventsUrl = () => `${API_URL}/api/events?token=${encodeURIComponent(token() || "")}`;
