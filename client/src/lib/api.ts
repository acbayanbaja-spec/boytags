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

let isBackendReachable = true;
let isSimulating = false;
let lastFailureTime = 0;
const RETRY_INTERVAL_MS = 25000;

type SimulationListener = (isSimulating: boolean) => void;
const simulationListeners = new Set<SimulationListener>();

function setSimulationActive(active: boolean) {
  if (isSimulating !== active) {
    isSimulating = active;
    simulationListeners.forEach((fn) => fn(active));
  }
}

export function isSimulationMode(): boolean {
  return isSimulating;
}

export function subscribeSimulationMode(listener: SimulationListener): () => void {
  simulationListeners.add(listener);
  listener(isSimulating);
  return () => {
    simulationListeners.delete(listener);
  };
}

export function useSimulationMode(): boolean {
  const [simulating, setSimulating] = useState(isSimulationMode());
  useEffect(() => {
    return subscribeSimulationMode(setSimulating);
  }, []);
  return simulating;
}

// Fast background health check
function scheduleLivenessCheck() {
  setTimeout(async () => {
    try {
      const c = new AbortController();
      const t = setTimeout(() => c.abort(), 800);
      const res = await fetch(`${API_URL}/health`, { signal: c.signal });
      clearTimeout(t);
      if (res.ok) {
        isBackendReachable = true;
        setSimulationActive(false);
      }
    } catch {
      isBackendReachable = false;
    }
  }, RETRY_INTERVAL_MS);
}

/**
 * High-performance, zero-hang API dispatcher:
 * 1. If backend previously failed within 25 seconds, instantly returns local store in 0ms.
 * 2. Uses a strict 1000ms timeout so the UI never freezes or hangs.
 * 3. Gracefully and instantly falls back to reactive local simulation store.
 */
export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const now = Date.now();
  if (!isBackendReachable && now - lastFailureTime < RETRY_INTERVAL_MS) {
    return handleFallback<T>(path, options);
  }

  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData) && !headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  const access = token();
  if (access) headers.set("Authorization", `Bearer ${access}`);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 1200);

  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      isBackendReachable = true;
      setSimulationActive(false);
      const json = (await response.json().catch(() => null)) as Envelope<T> | null;
      if (json && json.success !== false && "data" in json) {
        return json.data;
      }
    }

    if (response.status === 404 || response.status === 502 || response.status === 503) {
      isBackendReachable = false;
      lastFailureTime = Date.now();
      scheduleLivenessCheck();
      return handleFallback<T>(path, options);
    }

    const errJson = (await response.json().catch(() => null)) as Envelope<T> | null;
    if (errJson && "error" in errJson) {
      throw new Error(errJson.error.message);
    }
    return handleFallback<T>(path, options);
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    isBackendReachable = false;
    lastFailureTime = Date.now();
    scheduleLivenessCheck();
    return handleFallback<T>(path, options);
  }
}

function handleFallback<T>(path: string, options: RequestInit = {}): T {
  setSimulationActive(true);
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
