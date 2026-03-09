import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = __filename.slice(0, __filename.lastIndexOf('/'));
const DB_PATH = join(__dirname, 'db.json');

function load() {
  if (!existsSync(DB_PATH)) {
    const init = { users: [], movies: [] };
    writeFileSync(DB_PATH, JSON.stringify(init, null, 2), 'utf8');
    return init;
  }
  try {
    const raw = readFileSync(DB_PATH, 'utf8');
    return JSON.parse(raw);
  } catch {
    return { users: [], movies: [] };
  }
}

function save(data) {
  writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
}

export const db = {
  getAll() {
    return load();
  },
  getMoviesByUser(userId) {
    const data = load();
    if (!userId) return data.movies; 
    return data.movies.filter(m => m.userId === userId);
  },
  addMovie(movie) {
    const data = load();
    data.movies.unshift(movie);
    save(data);
    return movie;
  },
  updateMovie(updated) {
    const data = load();
    const idx = data.movies.findIndex(m => m.id === updated.id);
    if (idx === -1) return null;
    data.movies[idx] = updated;
    save(data);
    return updated;
  },
  deleteMovie(id) {
    const data = load();
    const before = data.movies.length;
    data.movies = data.movies.filter(m => m.id !== id);
    const removed = before !== data.movies.length;
    save(data);
    return removed;
  }
};
