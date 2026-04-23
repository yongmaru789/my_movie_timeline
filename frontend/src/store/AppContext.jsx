import { createContext, useContext, useEffect, useReducer } from "react";
import { Api } from "../lib/api";
import * as storage from "./storageAdapter";


const KEY = "movie_timeline_state_v2";
const LEGACY_KEYS = ["movie-timeline/state-v2", "movie_timeline_state_v1", "movie-timeline/state-v1"];

const AppContext = createContext(null);

const initialState = {
  user: null,
  movies: [],
  loading: true,
  error: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "INIT":
      return { ...state, ...action.payload, loading: false, error: null };
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };
    case "ADD":
      return { ...state, movies: [action.payload, ...state.movies] };
    case "UPDATE":
      return {
        ...state,
        movies: state.movies.map((m) => (m.id === action.payload.id ? action.payload : m)),
      };
    case "DELETE":
      return { ...state, movies: state.movies.filter((m) => m.id !== action.payload) };
    case "LOGIN":
      return { ...state, user: action.payload };
    case "LOGOUT":
      return { ...state, user: null, movies: [] };
    default:
      return state;
  }
}

function migrateStorageKey() {
  const hasNew = storage.load(KEY);
  if (!hasNew) {
    for (const k of LEGACY_KEYS) {
      const old = storage.load(k);
      if (old) {
        storage.save(KEY, old);
        storage.clear(k);
        break;
      }
    }
  }
}

function mergeById(local = [], remote = []) {
  const map = new Map();
  for (const m of local) if (m?.id) map.set(m.id, m);
  for (const m of remote) if (m?.id) map.set(m.id, m);
  return Array.from(map.values());
}

const genLocalId = () =>
  `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {

    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    if (token && userId) {
      dispatch({ type: "LOGIN", payload: { id: userId } });
    }

    let cancelled = false;

    (async () => {
      try {
        const currentUserId = userId || Api.devUserId();

        migrateStorageKey();
        const cached = storage.load(KEY);
        const bootstrap = {
          user: cached?.user || { id: currentUserId },
          movies: Array.isArray(cached?.movies) ? cached.movies : [],
        };
        if (!cancelled) {
          dispatch({ type: "INIT", payload: bootstrap });
        }

        try {
          const { movies: remoteMovies = [] } = await Api.listMovies(currentUserId);
          const merged = mergeById(bootstrap.movies, remoteMovies);
          if (!cancelled) {
            dispatch({ type: "INIT", payload: { user: { id: currentUserId }, movies: merged } });
          }
          storage.save(KEY, { user: { id: currentUserId }, movies: merged });
        } catch {
          
        }
      } catch (e) {
        if (!cancelled) {
          dispatch({ type: "SET_ERROR", payload: e.message || "load failed" });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const actions = {
    async addMovie(input) {
      const userId = state.user?.id || Api.devUserId();
      try {
        const { movie } = await Api.createMovie({ ...input, userId });
        dispatch({ type: "ADD", payload: movie });
        const snapshot = { user: state.user || { id: userId }, movies: [movie, ...state.movies] };
        storage.save(KEY, snapshot);
        return movie;
      } catch {
        const localMovie = { ...input, id: genLocalId(), userId };
        dispatch({ type: "ADD", payload: localMovie });
        const snapshot = { user: state.user || { id: userId }, movies: [localMovie, ...state.movies] };
        storage.save(KEY, snapshot);
        return localMovie;
      }
    },

    async updateMovie(movie) {
      const nextList = state.movies.map((m) => (m.id === movie.id ? movie : m));
      try {
        const { movie: saved } = await Api.updateMovie(movie.id, movie);
        dispatch({ type: "UPDATE", payload: saved });
        storage.save(KEY, { user: state.user, movies: nextList });
      } catch {
        dispatch({ type: "UPDATE", payload: movie });
        storage.save(KEY, { user: state.user, movies: nextList });
      }
    },

    async deleteMovie(id) {
      const next = state.movies.filter((m) => m.id !== id);
      try {
        await Api.deleteMovie(id);
        dispatch({ type: "DELETE", payload: id });
        storage.save(KEY, { user: state.user, movies: next });
      } catch {
        dispatch({ type: "DELETE", payload: id });
        storage.save(KEY, { user: state.user, movies: next });
      }
    },

    async login(username, password) {
      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) throw new Error("login failed");
      const data = await res.json();  // { token, userId, username } 형태
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.userId);
      dispatch({ type: "LOGIN", payload: { id: data.userId, username: data.username } });
    
      try {
        const {movies} = await Api.listMovies(String(data.userId));
        dispatch({ type: "INIT", payload: {user : {id: String(data.userId), username: data.username}, movies } });
      } catch {
      }
    },

    logout() {
      localStorage.removeItem("token");
      localStorage.removeItem("userId");
      storage.clear(KEY);
      dispatch({ type: "LOGOUT" });
    },

  };

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
};