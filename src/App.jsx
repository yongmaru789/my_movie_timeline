import { useState, useEffect, useRef } from 'react';
import './App.css';

const TMDB_IMG_BASE = 'https://image.tmdb.org/t/p/w500';

function App() {
  const [movies, setMovies] = useState([]);
  const [date, setDate] = useState('');
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [poster, setPoster] = useState('');
  const [editIndex, setEditIndex] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editComment, setEditComment] = useState('');
  const [editPoster, setEditPoster] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [hydrated, setHydrated] = useState(false);

  const [tmdbQuery, setTmdbQuery] = useState('');
  const [tmdbResults, setTmdbResults] = useState([]);
  const [tmdbLoading, setTmdbLoading] = useState(false);
  const [tmdbError, setTmdbError] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const abortRef = useRef(null);
  const debounceRef = useRef(null);
  const dropdownRef = useRef(null);

  const selectedTmdbRef = useRef(null);

  
  useEffect(() => {
    const stored = localStorage.getItem('my_movie_timeline');
    if (stored) {
      const parsed = JSON.parse(stored);
      setMovies(parsed);
    }
    setHydrated(true);
  }, []);

  
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem('my_movie_timeline', JSON.stringify(movies));
  }, [movies, hydrated]);

  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!date || !title) return;

    const newMovie = { date, title, comment, poster };
    if (selectedTmdbRef.current?.tmdbId) newMovie.tmdbId = selectedTmdbRef.current.tmdbId;
    if (selectedTmdbRef.current?.genres) newMovie.genres = selectedTmdbRef.current.genres;

    setMovies([...movies, newMovie]);
    
    setDate('');
    setTitle('');
    setComment('');
    setPoster('');
    setTmdbQuery('');
    setTmdbResults([]);
    setShowDropdown(false);
    selectedTmdbRef.current = null;
  };

  
  const handleDelete = (indexToDelete) => {
    const updated = movies.filter((_, idx) => idx !== indexToDelete);
    setMovies(updated);
  };

  
  const startEdit = (index) => {
    setEditIndex(index);
    setEditTitle(movies[index].title);
    setEditComment(movies[index].comment || '');
    setEditPoster(movies[index].poster || '');
  };

  
  const handleUpdate = (index) => {
    const updatedMovies = movies.map((movie, idx) =>
      idx === index
        ? { ...movie, title: editTitle, comment: editComment, poster: editPoster }
        : movie
    );
    setMovies(updatedMovies);
    setEditIndex(null);
    setEditTitle('');
    setEditComment('');
    setEditPoster('');
  };

  
  const sortedMovies = [...movies].sort((a, b) => {
    if (sortOrder === 'newest') {
      return new Date(b.date) - new Date(a.date);
    } else {
      return new Date(a.date) - new Date(b.date);
    }
  });

  
  const filteredMovies = sortedMovies.filter((m) => {
    const kw = searchKeyword.trim().toLowerCase();
    if (!kw) return true;
    const t = (m.title || '').toLowerCase();
    const c = (m.comment || '').toLowerCase();
    const g = Array.isArray(m.genres) ? m.genres.join(' ').toLowerCase() : '';
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
      setTmdbError('');
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
        setTmdbError('');

        const key = import.meta.env.VITE_TMDB_API_KEY;
        console.log("TMDB API KEY:", key);
        const url = `https://api.themoviedb.org/3/search/movie?api_key=${key}&query=${encodeURIComponent(q)}&language=ko-KR&page=1&include_adult=false`;
        const res = await fetch(url, { signal: ctrl.signal });
        if (!res.ok) throw new Error('TMDB 검색 실패');
        const data = await res.json();
        setTmdbResults(data.results?.slice(0, 8) || []);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setTmdbError('검색 중 오류가 발생.');
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

  
  const fetchTmdbDetail = async (id) => {
    try {
      const key = import.meta.env.VITE_TMDB_API_KEY;
      const url = `https://api.themoviedb.org/3/movie/${id}?api_key=${key}&language=ko-KR`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('TMDB 상세 실패');
      return await res.json();
    } catch {
      return null;
    }
  };

  
  const handlePickSuggestion = async (item) => {
    
    setTitle(item.title || item.name || '');
    setTmdbQuery(item.title || item.name || '');

    const url = item.poster_path ? `${TMDB_IMG_BASE}${item.poster_path}` : '';
    setPoster(url);

    const detail = await fetchTmdbDetail(item.id);
    const genres = detail?.genres?.map(g => g.name) || [];
    selectedTmdbRef.current = {
      tmdbId: item.id,
      genres,
    };

    setShowDropdown(false);
    setTmdbResults([]);
  };

  // 드롭다운 외부 클릭 닫기
  useEffect(() => {
    const onClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  

  
  return (
    <div className="App app-container">
      <h1>🎬 인생 영화 타임라인</h1>

      <form onSubmit={handleSubmit} className="form" autoComplete="off">
        <div className="form-row">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          
          <div className="title-autocomplete" ref={dropdownRef}>
            <input
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
                        {it.release_date ? it.release_date.slice(0, 4) : '—'}
                        {it.original_title && it.original_title !== it.title
                          ? ` · ${it.original_title}`
                          : ''}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <input
          type="text"
          placeholder="감상평"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <input
          type="text"
          placeholder="포스터 이미지 URL"
          value={poster}
          onChange={(e) => setPoster(e.target.value)}
        />

        
        {poster.trim() && (
          <img
            src={poster}
            alt="포스터 미리보기"
            className="poster-preview-sm"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        )}

        <button type="submit" className="btn submit-btn">등록</button>
      </form>

      
      <div className="toolbar">
        <input
          type="text"
          placeholder="제목/감상평/장르 검색"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          className="search-input"
        />
        <button
          onClick={() => setSortOrder('newest')}
          className={`btn ${sortOrder === 'newest' ? 'btn--active' : ''}`}
        >
          최신순
        </button>
        <button
          onClick={() => setSortOrder('oldest')}
          className={`btn ${sortOrder === 'oldest' ? 'btn--active' : ''}`}
        >
          오래된순
        </button>
      </div>

      
      {filteredMovies.length === 0 && (
        <div className="empty">아직 등록한 영화가 없습니다.</div>
      )}

      
      <div className="card-grid">
        {filteredMovies.map((movie) => {
          const originalIndex = movies.indexOf(movie); 

          return (
            <div key={originalIndex} className="card" aria-hidden="true">
              
              <div className="card-poster">
                {editIndex === originalIndex ? (
                  editPoster ? (
                    <img
                      src={editPoster}
                      alt="포스터 미리보기"
                      className="card-poster-img"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  ) : null
                ) : movie.poster ? (
                  <img
                    src={movie.poster}
                    alt={`${movie.title} 포스터`}
                    className="card-poster-img"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                ) : null}
              </div>

              
              <div className="card-body">
                <div className="date-text">{movie.date}</div>
                <div className="card-title">{movie.title}</div>

                {Array.isArray(movie.genres) && movie.genres.length > 0 && (
                  <div className="genre-chips">
                    {movie.genres.map((g) => (
                      <span key={g} className="chip">{g}</span>
                    ))}
                  </div>
                )}

                {editIndex === originalIndex ? (
                  <>
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="제목"
                      className="input-block"
                    />
                    <input
                      value={editComment}
                      onChange={(e) => setEditComment(e.target.value)}
                      placeholder="감상평"
                      className="input-block"
                    />
                    <input
                      value={editPoster}
                      onChange={(e) => setEditPoster(e.target.value)}
                      placeholder="포스터 이미지 URL"
                      className="input-block"
                    />
                    <div className="btn-row">
                      <button onClick={() => handleUpdate(originalIndex)} className="btn">저장</button>
                      <button onClick={() => setEditIndex(null)} className="btn">취소</button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="card-comment">{movie.comment}</div>
                    <div className="btn-row">
                      <button onClick={() => startEdit(originalIndex)} className="btn">수정</button>
                      <button onClick={() => handleDelete(originalIndex)} className="btn">삭제</button>
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;
