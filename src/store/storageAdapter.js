const KEY = "my_movie_timeline";

export const storage = {
  load() {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.warn("[storage.load] parse error", e);
      return null;
    }
  },
  save(state) {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch (e) {
      console.warn("[storage.save] setItem error", e);
    }
  },
  clear() {
    localStorage.removeItem(KEY);
  }
};