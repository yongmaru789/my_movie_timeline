const BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";
const DEV_USER_ID = import.meta.env.VITE_DEV_USER_ID || "dev-user-1";

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { "Authorization": `Bearer ${token}` } : {};
}

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

  async listMovies(userId) {
    const res = await fetch(`${BASE}/api/movies?userId=${userId}`, {
      headers: { ...authHeaders() },
    });
    const movies = await json(res);
    return { movies };
  },

  async createMovie(payload) {
    const res = await fetch(`${BASE}/api/movies`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(payload),
    });
    const movie = await json(res);
    return { movie };
  },

  async updateMovie(id, payload) {
    const res = await fetch(`${BASE}/api/movies/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(payload),
    });
    const movie = await json(res);
    return { movie };
  },

  async deleteMovie(id) {
    const res = await fetch(`${BASE}/api/movies/${id}`, { 
      method: "DELETE",
      headers: { ...authHeaders() },
    });
    return {};
  },
};
