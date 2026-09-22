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

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData) && !headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  const access = token();
  if (access) headers.set("Authorization", `Bearer ${access}`);

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const json = (await response.json().catch(() => null)) as Envelope<T> | null;

  if (!response.ok || !json || json.success === false) {
    const message = json && "error" in json ? json.error.message : "Something went wrong. Please try again.";
    throw new Error(message);
  }
  return json.data;
}

export const eventsUrl = () => `${API_URL}/api/events?token=${encodeURIComponent(token() || "")}`;
