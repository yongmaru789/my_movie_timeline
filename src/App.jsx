import { useState, useEffect } from 'react';
import './App.css';

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
    const updatedMovies = [...movies, newMovie];

    setMovies(updatedMovies);
    setDate('');
    setTitle('');
    setComment('');
    setPoster('');
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
    return t.includes(kw) || c.includes(kw);
  });

  
  return (
    <div className="App app-container">
      <h1>🎬 인생 영화 타임라인</h1>

      <form onSubmit={handleSubmit} className="form">
        <div className="form-row">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <input
            type="text"
            placeholder="영화 제목"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
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
          placeholder="제목/감상평 검색"
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
            <div key={originalIndex} className="card">
              
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
                    <div className="card-title">{movie.title}</div>
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
