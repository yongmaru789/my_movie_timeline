const BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";
const DEV_USER_ID = import.meta.env.VITE_DEV_USER_ID || "dev-user-1";

function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { "Authorization": `Bearer ${token}` } : {};
}

async function json(res) {
  if (res.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    window.location.href = "/login";
    return;
  }
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

  async listMovies(userId, page = 0, size = 10, sortBy = "date", direction = "desc") {
    const res = await fetch(`${BASE}/api/movies?userId=${userId}&page=${page}&size=${size}&sortBy=${sortBy}&direction=${direction}`, {
      headers: { ...authHeaders() },
    });
    const body = await json(res);
    return { 
      movies: body.data.content,
      totalPages: body.data.totalPages,
      totalElements: body.data.totalElements,
    };
  },

  async listAllMovies(userId) {
    const res = await fetch(`${BASE}/api/movies?userId=${userId}&page=0&size=9999`, {
      headers: { ...authHeaders() },
    });
    const body = await json(res);
    return { movies: body.data.content };
  },

  async createMovie(payload) {
    const res = await fetch(`${BASE}/api/movies`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(payload),
    });
    const body = await json(res);
    return { movie: body.data };
  },

  async updateMovie(id, payload) {
    const res = await fetch(`${BASE}/api/movies/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(payload),
    });
    const body = await json(res);
    return { movie: body.data };
  },

  async deleteMovie(id) {
    const res = await fetch(`${BASE}/api/movies/${id}`, { 
      method: "DELETE",
      headers: { ...authHeaders() },
    });
    return {};
  },
};
