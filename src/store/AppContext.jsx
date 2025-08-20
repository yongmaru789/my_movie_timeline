import { createContext, useContext, useEffect, useMemo, useReducer, useRef } from "react";
import { storage } from "./storageAdapter";

const AppContext = createContext(null);

const initialState = { user: null, movies: [] };

function reducer(state, action) {
  switch (action.type) {
    case "INIT":
      return { ...state, ...action.payload };
    case "LOGIN":
      return { ...state, user: action.payload };
    case "LOGOUT":
      return { ...state, user: null };
    case "ADD_MOVIE":
      return { ...state, movies: [action.payload, ...state.movies] };
    case "UPDATE_MOVIE":
      return {
        ...state,
        movies: state.movies.map(m => m.id === action.payload.id ? action.payload : m)
      };
    case "DELETE_MOVIE":
      return { ...state, movies: state.movies.filter(m => m.id !== action.payload) };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  
  useEffect(() => {
    const saved = storage.load();

    const normalized =
      Array.isArray(saved)
        ? { user: null, movies: saved }
        : (saved && typeof saved === "object")
          ? saved
          : null;

    if (normalized) {
      const fixedMovies = Array.isArray(normalized.movies)
        ? normalized.movies.map(m =>
            (m && m.id)
              ? m
              : { ...m, id: (crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`) }
          )
        : [];
      dispatch({ type: "INIT", payload: { ...normalized, movies: fixedMovies } });
    }
  }, []);

  
  const skipFirstSaveRef = useRef(true);
  useEffect(() => {
    if (skipFirstSaveRef.current) {
      skipFirstSaveRef.current = false;
      return;
    }
    storage.save(state);
  }, [state]);

  const actions = useMemo(() => ({
    login: (user) => dispatch({ type: "LOGIN", payload: user }),
    logout: () => dispatch({ type: "LOGOUT" }),
    addMovie: (movie) => {
      const withId = movie.id ? movie : { ...movie, id: crypto.randomUUID?.() || String(Date.now()) };
      dispatch({ type: "ADD_MOVIE", payload: withId });
    },
    updateMovie: (movie) => dispatch({ type: "UPDATE_MOVIE", payload: movie }),
    deleteMovie: (id) => dispatch({ type: "DELETE_MOVIE", payload: id }),
  }), []);

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
