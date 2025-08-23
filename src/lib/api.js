const BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";
const DEV_USER_ID = import.meta.env.VITE_DEV_USER_ID || "dev-user-1";

async function json(res) {
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(txt || `HTTP ${res.status}`);
  }
  return res.json();
}

export const Api = {
  devUserId() {
    return DEV_USER_ID;
  },

  async listMovies(userId = DEV_USER_ID) {
    const res = await fetch(`${BASE}/api/movies?userId=${encodeURIComponent(userId)}`);
    return json(res); 
  },

  async createMovie(payload) {
    const res = await fetch(`${BASE}/api/movies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return json(res); 
  },

  async updateMovie(id, payload) {
    const res = await fetch(`${BASE}/api/movies/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return json(res); 
  },

  async deleteMovie(id) {
    const res = await fetch(`${BASE}/api/movies/${id}`, { method: "DELETE" });
    return json(res); 
  },
};
