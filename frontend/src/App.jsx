import { useState, useEffect, useRef } from "react";
import "./App.css";
import { useApp } from "./store/AppContext";
import { Button, Input } from "./components/UiPrimitives";
import Card from "./components/Card";
import { Api } from "./lib/api";

const TMDB_BASE = "https://api.themoviedb.org/3";
export const TMDB_IMG_BASE = "https://image.tmdb.org/t/p/w200";

const TMDB_BEARER = import.meta.env.VITE_TMDB_BEARER?.trim();
const TMDB_KEY = import.meta.env.VITE_TMDB_KEY?.trim();

function StarIcon({ fillPercent = 0, size = 28, onClickLeft, onClickRight, onHoverLeft, onHoverRight, onMouseLeave }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className="shrink-0 cursor-pointer"
      onMouseLeave={onMouseLeave}
    >
      <defs>
        <clipPath id={`clip-${size}-${fillPercent}`}>
          <rect x="0" y="0" width={`${fillPercent}%`} height="24" />
        </clipPath>
      </defs>
      <path
        d="M12 2.5l2.938 5.953 6.569.955-4.753 4.633 1.122 6.543L12 17.49l-5.876 3.094 1.122-6.543L2.493 9.408l6.569-.955L12 2.5z"
        fill="#e5e7eb"
        stroke="#111827"
        strokeWidth="1.2"
      />
      <path
        d="M12 2.5l2.938 5.953 6.569.955-4.753 4.633 1.122 6.543L12 17.49l-5.876 3.094 1.122-6.543L2.493 9.408l6.569-.955L12 2.5z"
        fill="#facc15"
        stroke="#111827"
        strokeWidth="1.2"
        clipPath={`url(#clip-${size}-${fillPercent})`}
      />
      {/* 왼쪽 절반 - 0.5점 */}
      <rect
        x="0" y="0" width="12" height="24"
        fill="transparent"
        onMouseEnter={onHoverLeft}
        onClick={onClickLeft}
      />
      {/* 오른쪽 절반 - 1점 */}
      <rect
        x="12" y="0" width="12" height="24"
        fill="transparent"
        onMouseEnter={onHoverRight}
        onClick={onClickRight}
      />
    </svg>
  );
}

function RatingStars({ value, onChange, interactive = false, size = 28, showText = true }) {
  const [hoverValue, setHoverValue] = useState(null);

  const displayValue = hoverValue !== null ? hoverValue : value;

  return (
    <div className="flex items-center gap-3">
      <div
        className="flex items-center gap-1"
        onMouseLeave={() => setHoverValue(null)}
      >
        {[1, 2, 3, 4, 5].map((starIndex) => {
          let fillPercent = 0;
          if (displayValue >= starIndex) fillPercent = 100;
          else if (displayValue >= starIndex - 0.5) fillPercent = 50;

          return (
            <StarIcon
              key={starIndex}
              fillPercent={fillPercent}
              size={size}
              onHoverLeft={interactive ? () => setHoverValue(starIndex - 0.5) : undefined}
              onHoverRight={interactive ? () => setHoverValue(starIndex) : undefined}
              onClickLeft={interactive && onChange ? () => onChange(starIndex - 0.5) : undefined}
              onClickRight={interactive && onChange ? () => onChange(starIndex) : undefined}
            />
          );
        })}
      </div>
      {showText && (
        <span className="text-sm font-medium text-gray-700 min-w-[3rem]">
          {value.toFixed(1)} / 5.0
        </span>
      )}
    </div>
  );
}

async function tmdbFetch(path, { signal } = {}) {
  if (TMDB_BEARER) {
    const res = await fetch(`${TMDB_BASE}${path}`, {
      headers: {
        Authorization: `Bearer ${TMDB_BEARER}`,
        "Content-Type": "application/json;charset=utf-8",
      },
      signal,
    });
    if (res.ok) return res.json();
    if (res.status !== 401 && res.status !== 403) {
      const text = await res.text().catch(() => "");
      throw new Error(text || `TMDB error ${res.status}`);
    }
  }
  if (!TMDB_KEY) throw new Error("TMDB KEY 또는 BEARER가 설정되지 않았습니다.");

  const sep = path.includes("?") ? "&" : "?";
  const res2 = await fetch(`${TMDB_BASE}${path}${sep}api_key=${TMDB_KEY}`, { signal });
  if (!res2.ok) {
    const text = await res2.text().catch(() => "");
    throw new Error(text || `TMDB error ${res2.status}`);
  }
  return res2.json();
}

async function searchTmdb(query, signal) {
  if (!query?.trim()) return [];
  const data = await tmdbFetch(
    `/search/multi?query=${encodeURIComponent(query)}&language=ko-KR&include_adult=false`,
    { signal }
  );
  return data.results?.slice(0, 8) ?? [];
}

async function fetchTmdbDetail(id, signal) {
  return tmdbFetch(`/movie/${id}?language=ko-KR`, { signal });
}

function App() {
  const { state, actions } = useApp();
  const movies = state.movies;

  const [date, setDate] = useState("");
  const [title, setTitle] = useState("");
  const [rating, setRating] = useState(0);
  const [poster, setPoster] = useState("");

  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editRating, setEditRating] = useState(0);
  const [editPoster, setEditPoster] = useState("");

  const [sortOrder, setSortOrder] = useState("newest");
  const [searchKeyword, setSearchKeyword] = useState("");

  const [tmdbQuery, setTmdbQuery] = useState("");
  const [tmdbResults, setTmdbResults] = useState([]);
  const [tmdbLoading, setTmdbLoading] = useState(false);
  const [tmdbError, setTmdbError] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  const abortRef = useRef(null);
  const debounceRef = useRef(null);
  const dropdownRef = useRef(null);
  const selectedTmdbRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date || !title) return;

    const newMovie = { date, title, rating, poster };
    if (selectedTmdbRef.current?.tmdbId) newMovie.tmdbId = selectedTmdbRef.current.tmdbId;
    if (selectedTmdbRef.current?.genres) newMovie.genres = selectedTmdbRef.current.genres;

    try {
      await actions.addMovie(newMovie);
    } catch (err) {
      console.error("addMovie failed", err);
    }

    setDate("");
    setTitle("");
    setRating(0);
    setPoster("");
    setTmdbQuery("");
    setTmdbResults([]);
    setShowDropdown(false);
    selectedTmdbRef.current = null;
  };

  const handleDelete = (id) => {
    if (!id) return;
    actions.deleteMovie(id);
  };

  const startEdit = (id) => {
    const target = movies.find((m) => m.id === id);
    if (!target) return;
    setEditId(id);
    setEditTitle(target.title);
    setEditRating(target.rating ?? 0);
    setEditPoster(target.poster || "");
  };

  const handleUpdate = (id) => {
    const target = movies.find((m) => m.id === id);
    if (!target) return;
    const updated = { ...target, title: editTitle, rating: editRating, poster: editPoster };
    actions.updateMovie(updated);
    setEditId(null);
    setEditTitle("");
    setEditRating(0);
    setEditPoster("");
  };

  const [allMoviesForSearch, setAllMoviesForSearch] = useState([]);
  useEffect(() => {
    if (!searchKeyword.trim()) {
      setAllMoviesForSearch([]);
      return;
    }
    const userId = state.user?.id;
    if (!userId) return;
    (async () => {
      try {
        const { movies: all } = await Api.listAllMovies(userId);
        setAllMoviesForSearch(all);
      } catch {}
    })();
  }, [searchKeyword, state.user]);

  const sourceMovies = searchKeyword.trim() ? allMoviesForSearch : movies;
  const filteredMovies = sourceMovies.filter((m) => {
    const kw = searchKeyword.trim().toLowerCase();
    if (!kw) return true;
    const t = (m.title || "").toLowerCase();
    const g = Array.isArray(m.genres) ? m.genres.join(" ").toLowerCase() : "";
    const r = m.rating != null ? String(m.rating) : "";
    return t.includes(kw) || g.includes(kw) || r.includes(kw);
  });

  const handleTitleChange = (e) => {
    const v = e.target.value;
    setTitle(v);
    setTmdbQuery(v);
    setShowDropdown(!!v.trim());
  };

  useEffect(() => {
    const q = tmdbQuery.trim();
    if (!q) {
      setTmdbResults([]);
      setTmdbError("");
      setTmdbLoading(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        if (abortRef.current) abortRef.current.abort();
        const ctrl = new AbortController();
        abortRef.current = ctrl;

        setTmdbLoading(true);
        setTmdbError("");

        const results = await searchTmdb(q, ctrl.signal);
        setTmdbResults(results);
      } catch (err) {
        if (err.name !== "AbortError") {
          setTmdbError("검색 중 오류가 발생.");
          setTmdbResults([]);
        }
      } finally {
        setTmdbLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [tmdbQuery]);

  const handlePickSuggestion = async (item) => {
    setTitle(item.title || item.name || "");
    const url = item.poster_path ? `${TMDB_IMG_BASE}${item.poster_path}` : "";
    setPoster(url);

    const detail = await fetchTmdbDetail(item.id);
    const genres = detail?.genres?.map((g) => g.name) || [];
    selectedTmdbRef.current = { tmdbId: item.id, genres };

    setShowDropdown(false);
    setTmdbResults([]);
  };

  useEffect(() => {
    const onClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div className="min-h-screen" style={{background: "#F0F8FF"}}>
      <div className="mx-auto w-full max-w-screen-2xl p-4 sm:p-6 lg:p-8">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-3" style={{color: "#1A5FA0"}}>
          <i className="fa-solid fa-clapperboard" style={{color: "#5BAAEE"}}></i>
          인생 영화 타임라인
        </h1>

        <div className="bg-white rounded-3xl p-6 mb-6 shadow-sm border border-sky-100">
          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
            <div className="flex flex-col gap-4">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-40 rounded-2xl px-4 py-2 text-sm border border-sky-100 focus:outline-none focus:ring-2 focus:ring-sky-200"
                style={{background: "#F0F8FF", color: "#1A5FA0"}}
              />
              <div className="title-autocomplete" ref={dropdownRef}>
                <input
                  type="text"
                  placeholder="🎬 영화 제목 검색..."
                  value={title}
                  onChange={handleTitleChange}
                  onFocus={() => setShowDropdown(!!title.trim())}
                  className="w-full rounded-2xl px-4 py-2 text-sm border border-sky-100 focus:outline-none focus:ring-2 focus:ring-sky-200"
                  style={{background: "#F0F8FF", color: "#1A5FA0"}}
                />
                {showDropdown && (
                  <div className="ac-panel">
                    {tmdbLoading && <div className="ac-item muted">검색 중</div>}
                    {tmdbError && <div className="ac-item error">{tmdbError}</div>}
                    {!tmdbLoading && !tmdbError && tmdbResults.length === 0 && (
                      <div className="ac-item muted">검색 결과가 없습니다.</div>
                    )}
                    {tmdbResults.map((it) => (
                      <button
                        type="button"
                        key={`${it.id}-${it.release_date}`}
                        className="ac-item border border-sky-100 bg-white hover:bg-sky-50"
                        onClick={() => handlePickSuggestion(it)}
                      >
                        <div className="ac-thumb">
                          {it.poster_path ? (
                            <img src={`${TMDB_IMG_BASE}${it.poster_path}`} alt="" />
                          ) : (
                            <div className="no-thumb">NO</div>
                          )}
                        </div>
                        <div className="ac-meta">
                          <div className="ac-title" style={{color: "#1A5FA0"}}>{it.title || it.name}</div>
                          <div className="ac-sub">
                            {it.release_date ? it.release_date.slice(0, 4) : "—"}
                            {it.original_title && it.original_title !== it.title
                              ? ` · ${it.original_title}`
                              : ""}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3">
              <div className="mb-2 text-sm font-semibold" style={{color: "#5BAAEE"}}>별점</div>
              <RatingStars value={rating} onChange={setRating} interactive />
              <p className="mt-2 text-xs" style={{color: "#93C5E8"}}>
                별의 왼쪽 절반을 클릭하면 0.5점, 오른쪽 절반을 클릭하면 1점입니다.
              </p>
            </div>

            <input
              type="text"
              placeholder="포스터 이미지 URL"
              value={poster}
              onChange={(e) => setPoster(e.target.value)}
              className="w-full rounded-2xl px-4 py-2 text-sm border border-sky-100 focus:outline-none focus:ring-2 focus:ring-sky-200"
              style={{background: "#F0F8FF", color: "#1A5FA0"}}
            />
            {poster.trim() && (
              <img
                src={poster}
                alt="포스터 미리보기"
                className="h-36 w-auto rounded-2xl border border-sky-100"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            )}
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2 rounded-2xl text-sm font-semibold text-white transition hover:opacity-90"
              style={{background: "linear-gradient(135deg, #5BAAEE, #3D8FE0)"}}
            >
              <i className="fa-solid fa-plus"></i> 등록하기
            </button>
          </form>
        </div>

        <div className="flex items-center gap-2 mb-6">
          <div className="relative flex-1">
            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-sky-300"></i>
            <input
              type="text"
              placeholder="제목 / 장르 / 별점 검색"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-2xl text-sm border border-sky-100 focus:outline-none focus:ring-2 focus:ring-sky-200 bg-white"
              style={{color: "#1A5FA0"}}
            />
          </div>
          <button
            onClick={() => { actions.loadPage(0, "date", "desc"); setSortOrder("newest"); }}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-semibold transition"
            style={sortOrder === "newest"
              ? {background: "#3D8FE0", color: "white"}
              : {background: "white", color: "#3D8FE0", border: "1.5px solid #C8E4FF"}}
          >
            <i className="fa-solid fa-arrow-down-wide-short"></i> 최신순
          </button>
          <button
            onClick={() => { actions.loadPage(0, "date", "asc"); setSortOrder("oldest"); }}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-semibold transition"
            style={sortOrder === "oldest"
              ? {background: "#3D8FE0", color: "white"}
              : {background: "white", color: "#3D8FE0", border: "1.5px solid #C8E4FF"}}
          >
            <i className="fa-solid fa-arrow-up-wide-short"></i> 오래된순
          </button>
        </div>

        {filteredMovies.length === 0 && (
          <div className="text-center py-16 text-sky-300">
            <i className="fa-solid fa-film text-4xl mb-4 block"></i>
            아직 등록한 영화가 없습니다.
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMovies.map((movie) => {
            const originalIndex = movies.indexOf(movie);
            const id = movie.id;
            const isEditing = editId && id && editId === id;

            return (
              <div key={id || originalIndex} className="bg-white rounded-3xl overflow-hidden border border-sky-100 shadow-sm hover:shadow-md transition-shadow">
                <div className={`p-4 flex gap-4 ${isEditing ? "bg-sky-50" : ""}`}>
                  <div className="w-24 shrink-0">
                    {isEditing ? (
                      editPoster ? (
                        <img src={editPoster} alt="포스터 미리보기" className="h-36 w-auto rounded-2xl border border-sky-100"
                          onError={(e) => { e.currentTarget.style.display = "none"; }} />
                      ) : null
                    ) : movie.poster ? (
                      <img src={movie.poster} alt={`${movie.title} 포스터`} className="h-36 w-auto rounded-2xl border border-sky-100"
                        onError={(e) => { e.currentTarget.style.display = "none"; }} />
                    ) : (
                      <div className="h-36 rounded-2xl flex items-center justify-center text-3xl" style={{background: "#EBF5FF"}}>🎬</div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="text-xs mb-1 flex items-center gap-1" style={{color: "#93C5E8"}}>
                      <i className="fa-regular fa-calendar-days"></i>
                      {movie.date}
                    </div>
                    <div className="text-base font-bold mb-2" style={{color: "#1A5FA0"}}>{movie.title}</div>

                    {Array.isArray(movie.genres) && movie.genres.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {movie.genres.map((g) => (
                          <span key={g} className="px-2 py-0.5 rounded-full text-xs font-semibold" style={{background: "#EBF5FF", color: "#3D8FE0"}}>
                            {g}
                          </span>
                        ))}
                      </div>
                    )}

                    {movie.rating != null && (
                      <div className="mb-3">
                        <RatingStars value={movie.rating} size={18} showText />
                      </div>
                    )}

                    {isEditing ? (
                      <div className="mt-2 space-y-2">
                        <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder="제목"
                          className="w-full rounded-2xl px-3 py-2 text-sm border border-sky-100 focus:outline-none focus:ring-2 focus:ring-sky-200"
                          style={{background: "#F0F8FF", color: "#1A5FA0"}} />
                        <div className="rounded-2xl border border-sky-100 bg-sky-50 px-3 py-3">
                          <div className="mb-2 text-xs font-semibold" style={{color: "#5BAAEE"}}>별점 수정</div>
                          <RatingStars value={editRating} onChange={setEditRating} interactive size={18} />
                        </div>
                        <input value={editPoster} onChange={(e) => setEditPoster(e.target.value)} placeholder="포스터 URL"
                          className="w-full rounded-2xl px-3 py-2 text-sm border border-sky-100 focus:outline-none focus:ring-2 focus:ring-sky-200"
                          style={{background: "#F0F8FF", color: "#1A5FA0"}} />
                        <div className="flex gap-2">
                          <button onClick={() => handleUpdate(id)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-2xl text-xs font-semibold text-white"
                            style={{background: "#3D8FE0"}}>
                            <i className="fa-solid fa-check"></i> 저장
                          </button>
                          <button onClick={() => setEditId(null)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-2xl text-xs font-semibold border border-sky-100"
                            style={{color: "#93C5E8"}}>
                            취소
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button onClick={() => id && startEdit(id)} disabled={!id}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-2xl text-xs font-semibold border border-sky-100 transition hover:bg-sky-50"
                          style={{color: "#3D8FE0", background: "#F0F8FF"}}>
                          <i className="fa-solid fa-pen"></i> 수정
                        </button>
                        <button onClick={() => id && handleDelete(id)} disabled={!id}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-2xl text-xs font-semibold border transition hover:bg-red-50"
                          style={{color: "#E07C7C", background: "#FFF5F5", borderColor: "#FFE4E4"}}>
                          <i className="fa-solid fa-trash"></i> 삭제
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {state.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => actions.loadPage(state.currentPage - 1)}
              disabled={state.currentPage === 0}
              className="px-4 py-2 rounded-2xl text-sm font-semibold border border-sky-100 bg-white disabled:opacity-40 transition hover:bg-sky-50"
              style={{color: "#3D8FE0"}}
            >
              <i className="fa-solid fa-chevron-left"></i> 이전
            </button>
            {Array.from({ length: state.totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => actions.loadPage(i)}
                className="px-4 py-2 rounded-2xl text-sm font-semibold transition"
                style={state.currentPage === i
                  ? {background: "#3D8FE0", color: "white"}
                  : {background: "white", color: "#3D8FE0", border: "1.5px solid #C8E4FF"}}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => actions.loadPage(state.currentPage + 1)}
              disabled={state.currentPage === state.totalPages - 1}
              className="px-4 py-2 rounded-2xl text-sm font-semibold border border-sky-100 bg-white disabled:opacity-40 transition hover:bg-sky-50"
              style={{color: "#3D8FE0"}}
            >
              다음 <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;