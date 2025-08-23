export function load(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn("[storage.load] parse error", e);
    return null;
  }
}

export function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn("[storage.save] setItem error", e);
  }
}

export function clear(key) {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    console.warn("[storage.clear] removeItem error", e);
  }
}