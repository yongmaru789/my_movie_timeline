import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [movies, setMovies] = useState([]);
  const [date, setDate] = useState('');
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [poster, setPoster] = useState('');  //
  const [editIndex, setEditIndex] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editComment, setEditComment] = useState('');
  const [editPoster, setEditPoster] = useState(''); //
  const [sortOrder, setSortOrder] = useState('newest');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("my_movie_timeline");
    if (stored) {
      const parsed = JSON.parse(stored);
      setMovies(parsed);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("my_movie_timeline", JSON.stringify(movies));
  }, [movies, hydrated]);

  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!date || !title) return;

    const newMovie = { date, title, comment, poster };  //
    const updatedMovies = [...movies, newMovie];
    
    setMovies(updatedMovies);    

    setDate('');
    setTitle('');
    setComment('');
    setPoster('');   //
  };

  const handleDelete = (indexToDelete) => {
    const updated = movies.filter((_, idx) => idx !== indexToDelete);
    setMovies(updated);    
  };

  const startEdit = (index) => {
    setEditIndex(index);
    setEditTitle(movies[index].title);
    setEditComment(movies[index].comment || '');
    setEditPoster(movies[index].poster || '');  //
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
    setEditPoster(''); //
  };

  const sortedMovies = [...movies].sort((a, b) => {
    if (sortOrder === 'newest' ) {
      return new Date(b.date) - new Date(a.date);
    } else {
      return new Date(a.date) - new Date(b.date);
    }
  })

  const filteredMovies = sortedMovies.filter((m) => {
    const kw = searchKeyword.trim().toLowerCase();
    if (!kw) return true;
    const t = (m.title || '').toLowerCase();
    const c = (m.comment || '').toLowerCase();
    return t.includes(kw) || c.includes(kw);
  })

  return (
    <div className="App">
      <h1>🎬 인생 영화 타임라인</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        <input
          type="text"
          placeholder="영화 제목을 입력하세요"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          type="text"
          placeholder="감상평"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <input   //
          type="text"
          placeholder="포스터 이미지 URL (선택)"
          value={poster}
          onChange={(e) => setPoster(e.target.value)}
        />
        <button type="submit">등록</button>
      </form>

      <div style={{ marginTop: '10px' }}>
        <input
          type="text"
          placeholder="검색어를 입력하세요 (제목/감상평)"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          style={{ padding: '6px 8px', width: 260, marginRight: 8}}
        />
        <button onClick={() => setSortOrder('newest')}>최신순</button>
        <button onClick={() => setSortOrder('oldest')}>오래된순</button>
      </div>

      <ul>
        {filteredMovies.map((movie) => {
          const originalIndex = movies.indexOf(movie);
          return (
            <li key={originalIndex} style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 12, alignItems: 'start' }}>
              <div>
                {editIndex === originalIndex ? (
                  editPoster ? (
                    <img 
                      src={editPoster}
                      alt="포스터 미리보기"
                      style={{ width: 120, height: 'auto', borderRadius: 8, objectFit: 'cover'}}
                      onError={(e) => {e.currentTarget.style.display = 'none'; }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 120, height: 160, background: '#f1f3f5',
                        borderRadius: 8, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', color: '#888'
                      }}
                    >
                    </div>
                  )
                ) : movie.poster ? (
                  <img
                    src={movie.poster}
                    alt={`${movie.title} 포스터`}
                    style={{ width: 120, height: 'auto', borderRadius: 8, objectFit: 'cover' }}
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                ) : (
                  <div
                    style={{
                      width: 120, height: 160, background: '#f1f3f5',
                      borderRadius: 8, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', color: '#888'
                    }}
                  >
                  </div>
                )}
              </div>
              
              <div>
                <strong>{movie.date}</strong>
                <br/>
                {editIndex === originalIndex ? (
                  <>
                     <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="제목"
                      style={{ display: 'block', marginTop: 6 }}
                    />
                    <input
                      value={editComment}
                      onChange={(e) => setEditComment(e.target.value)}
                      placeholder="감상평"
                      style={{ display: 'block', marginTop: 6 }}
                    />
                    <input
                      value={editPoster}
                      onChange={(e) => setEditPoster(e.target.value)}
                      placeholder="포스터 이미지 URL"
                      style={{ display: 'block', marginTop: 6 }}
                    />
                    <button onClick={() => handleUpdate(originalIndex)} style={{ marginTop: 8 }}>
                      저장
                    </button>
                  </>
                ) : (
                  <>
                    <div style={{ marginTop: 6 }}>{movie.title}</div>
                    <div style={{ fontStyle: 'italic', color: '#666' }}>{movie.comment}</div>
                    <button onClick={() => startEdit(originalIndex)} style={{ marginTop: 8 }}>
                      수정
                    </button>
                  </>
                )}
                <button onClick={() => handleDelete(originalIndex)} style={{ marginLeft: 8 }}>
                  삭제
                </button>
              </div>

            </li>            
          );
        })}
      </ul>

    </div>
  );
}

export default App;