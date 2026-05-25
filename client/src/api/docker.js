const BASE = "/api";

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export const api = {
  // System
  ping: () => request("/system/ping"),
  info: () => request("/system/info"),
  df: () => request("/system/df"),
  health: () => request("/health"),

  // Containers
  listContainers: (all = true) =>
    request(`/containers?all=${all}`),

  containerAction: (id, action) =>
    request(`/containers/${id}/${action}`, { method: "POST" }),

  inspectContainer: (id) =>
    request(`/containers/${id}/inspect`),

  containerStats: (id) =>
    request(`/containers/${id}/stats`),

  containerLogs: (id, tail = 200) =>
    request(`/containers/${id}/logs?tail=${tail}`),

  // Images
  listImages: () => request("/images"),

  removeImage: (id) =>
    request(`/images/${id}`, { method: "DELETE" }),

  inspectImage: (id) =>
    request(`/images/${id}/inspect`),
};
