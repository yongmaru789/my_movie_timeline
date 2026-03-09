import { useState, useEffect, useRef } from "react";
import "./App.css";
import { useApp } from "./store/AppContext";
import { Button, Input } from "./components/UiPrimitives";
import Card from "./components/Card";

const TMDB_BASE = "https://api.themoviedb.org/3";
export const TMDB_IMG_BASE = "https://image.tmdb.org/t/p/w200";

const TMDB_BEARER = import.meta.env.VITE_TMDB_BEARER?.trim();
const TMDB_KEY = import.meta.env.VITE_TMDB_KEY?.trim();

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
  const [comment, setComment] = useState("");
  const [poster, setPoster] = useState("");

  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editComment, setEditComment] = useState("");
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

    const newMovie = { date, title, comment, poster };
    if (selectedTmdbRef.current?.tmdbId) newMovie.tmdbId = selectedTmdbRef.current.tmdbId;
    if (selectedTmdbRef.current?.genres) newMovie.genres = selectedTmdbRef.current.genres;

    try {
      await actions.addMovie(newMovie);
    } catch (err) {
      console.error("addMovie failed", err);
    }

    setDate("");
    setTitle("");
    setComment("");
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
    setEditComment(target.comment || "");
    setEditPoster(target.poster || "");
  };

  const handleUpdate = (id) => {
    const target = movies.find((m) => m.id === id);
    if (!target) return;
    const updated = { ...target, title: editTitle, comment: editComment, poster: editPoster };
    actions.updateMovie(updated);
    setEditId(null);
    setEditTitle("");
    setEditComment("");
    setEditPoster("");
  };

  const sortedMovies = [...movies].sort((a, b) => {
    if (sortOrder === "newest") return new Date(b.date) - new Date(a.date);
    return new Date(a.date) - new Date(b.date);
  });

  const filteredMovies = sortedMovies.filter((m) => {
    const kw = searchKeyword.trim().toLowerCase();
    if (!kw) return true;
    const t = (m.title || "").toLowerCase();
    const c = (m.comment || "").toLowerCase();
    const g = Array.isArray(m.genres) ? m.genres.join(" ").toLowerCase() : "";
    return t.includes(kw) || c.includes(kw) || g.includes(kw);
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
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto w-full max-w-screen-2xl p-4 sm:p-6 lg:p-8">
        <h1 className="text-2xl font-bold mb-4">인생 영화 타임라인</h1>

        <form onSubmit={handleSubmit} className="form space-y-3 mb-6" autoComplete="off">
          <div className="form-row">
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="sm:w-40"
            />
            <div className="title-autocomplete" ref={dropdownRef}>
              <Input
                type="text"
                placeholder="영화 제목"
                value={title}
                onChange={handleTitleChange}
                onFocus={() => setShowDropdown(!!title.trim())}
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
                      className="ac-item"
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
                        <div className="ac-title">{it.title || it.name}</div>
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

          <Input
            type="text"
            placeholder="감상평"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <Input
            type="text"
            placeholder="포스터 이미지 URL"
            value={poster}
            onChange={(e) => setPoster(e.target.value)}
          />
          {poster.trim() && (
            <img
              src={poster}
              alt="포스터 미리보기"
              className="h-36 w-auto rounded-lg border border-gray-200"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          )}
          <Button className="bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:text-white">
            등록
          </Button>
        </form>

        <div className="flex items-center gap-2 mb-4">
          <Input
            className="flex-1"
            type="text"
            placeholder="제목/감상평/장르 검색"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
          <Button
            onClick={() => setSortOrder("newest")}
            className={
              sortOrder === "newest"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-blue-100 text-black border-blue-100"
            }
          >
            최신순
          </Button>
          <Button
            onClick={() => setSortOrder("oldest")}
            className={
              sortOrder === "oldest"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-blue-100 text-black border-blue-100"
            }
          >
            오래된순
          </Button>
        </div>

        {filteredMovies.length === 0 && <div className="empty">아직 등록한 영화가 없습니다.</div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredMovies.map((movie) => {
            const originalIndex = movies.indexOf(movie);
            const id = movie.id;
            const isEditing = editId && id && editId === id;

            return (
              <Card key={id || originalIndex}>
                <div className={`p-4 flex gap-4 ${isEditing ? "bg-blue-50" : ""}`}>
                  <div className="w-24 shrink-0">
                    {isEditing ? (
                      editPoster ? (
                        <img
                          src={editPoster}
                          alt="포스터 미리보기"
                          className="h-36 w-auto rounded-lg border"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      ) : null
                    ) : movie.poster ? (
                      <img
                        src={movie.poster}
                        alt={`${movie.title} 포스터`}
                        className="h-36 w-auto rounded-lg border"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="h-36 rounded-lg bg-gray-100" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="text-sm text-gray-500">{movie.date}</div>
                    <div className="text-lg font-semibold">{movie.title}</div>

                    {Array.isArray(movie.genres) && movie.genres.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {movie.genres.map((g) => (
                          <span
                            key={g}
                            className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs border"
                          >
                            {g}
                          </span>
                        ))}
                      </div>
                    )}

                    {isEditing ? (
                      <div className="mt-3 space-y-2">
                        <Input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          placeholder="제목"
                        />
                        <Input
                          value={editComment}
                          onChange={(e) => setEditComment(e.target.value)}
                          placeholder="감상평"
                        />
                        <Input
                          value={editPoster}
                          onChange={(e) => setEditPoster(e.target.value)}
                          placeholder="포스터 이미지 URL"
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleUpdate(id)}
                            className="bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                          >
                            저장
                          </Button>
                          <Button onClick={() => setEditId(null)}>취소</Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {movie.comment && <p className="mt-2 text-gray-700">{movie.comment}</p>}
                        <div className="mt-3 flex gap-2">
                          <Button onClick={() => id && startEdit(id)} disabled={!id}>
                            수정
                          </Button>
                          <Button
                            onClick={() => id && handleDelete(id)}
                            disabled={!id}
                            className="bg-red-500 text-white border-red-500 hover:bg-red-600"
                          >
                            삭제
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default App;