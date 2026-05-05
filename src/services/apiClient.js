import { API_BASE_URL } from "../lib/supabaseClient.js";

function getStoredToken() {
  try {
    const s = JSON.parse(localStorage.getItem("pharmaderm_session") || "null");
    return s?.token || null;
  } catch {
    return null;
  }
}

export async function apiFetch(path, { method = "GET", headers = {}, body } = {}) {
  const token = getStoredToken();
  const h = { ...headers };
  if (!h["Content-Type"] && body !== undefined) h["Content-Type"] = "application/json";
  if (token && !h.Authorization) h.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`, {
    method,
    headers: h,
    body: body === undefined ? undefined : typeof body === "string" ? body : JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error || data?.message || "Request failed";
    throw new Error(msg);
  }
  return data;
}

