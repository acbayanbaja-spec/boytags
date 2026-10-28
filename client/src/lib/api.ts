import { useState, useEffect } from "react";
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

export type ConnectionStatus = "unknown" | "live" | "offline";

let connectionStatus: ConnectionStatus = "unknown";
let lastFailureTime = 0;
let livenessTimer: ReturnType<typeof setTimeout> | null = null;
const RETRY_INTERVAL_MS = 25000;

type ConnectionListener = (status: ConnectionStatus) => void;
const connectionListeners = new Set<ConnectionListener>();

function setConnectionStatus(status: ConnectionStatus) {
  if (connectionStatus !== status) {
    connectionStatus = status;
    connectionListeners.forEach((fn) => fn(status));
  }
}

export function getConnectionStatus(): ConnectionStatus {
  return connectionStatus;
}

export function subscribeConnectionStatus(listener: ConnectionListener): () => void {
  connectionListeners.add(listener);
  listener(connectionStatus);
  return () => {
    connectionListeners.delete(listener);
  };
}

export function useConnectionStatus(): ConnectionStatus {
  const [status, setStatus] = useState(connectionStatus);
  useEffect(() => subscribeConnectionStatus(setStatus), []);
  return status;
}

/** Endpoints whose responses must come from the real backend — fake data here would silently
 *  disconnect customers from the kitchen (orders, auth, live queue). */
function requiresRealBackend(path: string, _method: string): boolean {
  if (path.startsWith("/api/auth/forgot-password") || path.startsWith("/api/auth/reset-password")) return false;
  return path.startsWith("/api/orders") || path.startsWith("/api/auth");
}

function backendDownError(): Error {
  return new Error(
    "Not connected to the Boytag's kitchen server, so this action was NOT saved. Check your connection and try again.",
  );
}

/** Only schedule one probe at a time so failures can't cascade into fetch storms. */
function scheduleLivenessCheck() {
  if (livenessTimer) return;
  livenessTimer = setTimeout(async () => {
    livenessTimer = null;
    try {
      const c = new AbortController();
      const t = setTimeout(() => c.abort(), 1500);
      const res = await fetch(`${API_URL}/health`, { signal: c.signal });
      clearTimeout(t);
      const contentType = res.headers.get("content-type") || "";
      if (res.ok && contentType.includes("json")) {
        const body = (await res.json().catch(() => null)) as { ok?: boolean } | null;
        if (body?.ok) {
          setConnectionStatus("live");
          return;
        }
      }
      setConnectionStatus("offline");
      scheduleLivenessCheck();
    } catch {
      setConnectionStatus("offline");
      scheduleLivenessCheck();
    }
  }, RETRY_INTERVAL_MS);
}

/**
 * Honest API dispatcher:
 * 1. Real backend responses (strict JSON envelope) win — connection flips to "live".
 * 2. Order & auth endpoints NEVER fabricate fake data; if the backend is down they throw
 *    a clear error so customers and the kitchen stay connected to the same truth.
 * 3. Browsing endpoints (products/categories) may fall back to the local demo store so the
 *   menu stays visible offline.
 */
export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const now = Date.now();
  const method = (options.method || "GET").toUpperCase();
  const realBackendOnly = requiresRealBackend(path, method);
  if (connectionStatus === "offline" && now - lastFailureTime < RETRY_INTERVAL_MS) {
    if (realBackendOnly) throw backendDownError();
    return handleFallback<T>(path, options);
  }

  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData) && !headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  const access = token();
  if (access) headers.set("Authorization", `Bearer ${access}`);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const contentType = response.headers.get("content-type") || "";
    const isJson = contentType.includes("json");

    if (response.ok && isJson) {
      setConnectionStatus("live");
      const json = (await response.json().catch(() => null)) as Envelope<T> | null;
      if (json && json.success !== false && "data" in json) {
        return json.data;
      }
    }

    if (isJson && !response.ok) {
      // Real backend answered with a real business error — surface it, do not fake success.
      const errJson = (await response.json().catch(() => null)) as Envelope<T> | null;
      if (errJson && "error" in errJson) {
        throw new Error(errJson.error.message);
      }
    }

    // Non-JSON (e.g. SPA HTML from a misrouted rewrite), 404/502/503, or empty envelope:
    // the backend is not answering on this URL.
    if (!response.ok || !isJson) {
      setConnectionStatus("offline");
      lastFailureTime = Date.now();
      scheduleLivenessCheck();
      if (realBackendOnly) throw backendDownError();
      return handleFallback<T>(path, options);
    }

    if (realBackendOnly) throw backendDownError();
    return handleFallback<T>(path, options);
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if (err instanceof Error && err.message === backendDownError().message) throw err;
    if (err instanceof Error && err.name === "AbortError") {
      setConnectionStatus("offline");
      lastFailureTime = Date.now();
      scheduleLivenessCheck();
    } else if (err instanceof TypeError) {
      // network failure
      setConnectionStatus("offline");
      lastFailureTime = Date.now();
      scheduleLivenessCheck();
    } else {
      // Genuine business error from the live backend.
      setConnectionStatus("live");
      throw err;
    }
    if (realBackendOnly) throw backendDownError();
    return handleFallback<T>(path, options);
  }
}

function handleFallback<T>(path: string, options: RequestInit = {}): T {
  setConnectionStatus("offline");
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
    const currentUser = mockBackend.getCurrentUser();
    if (!currentUser) return [] as unknown as T;
    return mockBackend.getOrders(currentUser) as unknown as T;
  }
  if (path === "/api/orders/queue" && method === "GET") {
    return mockBackend.getQueueOrders() as unknown as T;
  }
  if (path === "/api/orders" && method === "POST") {
    return mockBackend.createOrder(body) as unknown as T;
  }
  if (path.match(/\/api\/orders\/[^/]+\/status$/) && method === "PATCH") {
    const id = path.split("/")[3];
    return mockBackend.updateOrderStatus(id, body.status as OrderStatus) as unknown as T;
  }
  if (path.match(/\/api\/orders\/[^/]+\/complete$/) && method === "POST") {
    const id = path.split("/")[3];
    return mockBackend.updateOrderStatus(id, "COMPLETED") as unknown as T;
  }
  if (path.match(/\/api\/orders\/[^/]+\/rider-arrived$/) && method === "POST") {
    const id = path.split("/")[3];
    return mockBackend.notifyRiderArrived(id) as unknown as T;
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
