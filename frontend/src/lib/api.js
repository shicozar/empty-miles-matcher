const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
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
  getEmptyLegs: () => request("/empty-legs"),
  createEmptyLeg: (data) => request("/empty-legs", { method: "POST", body: JSON.stringify(data) }),
  getLoads: () => request("/loads"),
  createLoad: (data) => request("/loads", { method: "POST", body: JSON.stringify(data) }),
  getMatches: () => request("/matches"),
};
