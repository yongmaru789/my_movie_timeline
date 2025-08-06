import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [movies, setMovies] = useState([]);
  const [date, setDate] = useState('');
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [editIndex, setEditIndex] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editComment, setEditComment] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');

  useEffect(() => {
    const stored = localStorage.getItem("my_movie_timeline");
    if (stored) {
      const parsed = JSON.parse(stored);
      setMovies(parsed);
    }
  }, []);

  useEffect(() => {
    if (movies.length > 0) {
      localStorage.setItem("my_movie_timeline", JSON.stringify(movies));
    }    
  }, [movies]);

  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!date || !title) return;

    const newMovie = { date, title, comment };
    const updatedMovies = [...movies, newMovie];
    
    setMovies(updatedMovies);    

    setDate('');
    setTitle('');
    setComment('');
  };

  const handleDelete = (indexToDelete) => {
    const updated = movies.filter((_, idx) => idx !== indexToDelete);
    setMovies(updated);    
  };

  const startEdit = (index) => {
    setEditIndex(index);
    setEditTitle(movies[index].title);
    setEditComment(movies[index].comment || '');
  };

  const handleUpdate = (index) => {
    const updatedMovies = movies.map((movie, idx) =>
      idx === index 
        ? { ...movie, title: editTitle, comment: editComment } 
        : movie
      );
    setMovies(updatedMovies);
    setEditIndex(null);
    setEditTitle('');
    setEditComment('');
  };

  const sortedMovies = [...movies].sort((a, b) => {
    if (sortOrder === 'newest' ) {
      return new Date(b.date) - new Date(a.date);
    } else {
      return new Date(a.date) - new Date(b.date);
    }
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
        <button type="submit">등록</button>
      </form>

      <div style={{ marginTop: '10px' }}>
        <button onClick={() => setSortOrder('newest')}>최신순</button>
        <button onClick={() => setSortOrder('oldest')}>오래된순</button>
      </div>

      <ul>
        {sortedMovies.map((movie, index) => (
          <li key={index}>
            <strong>{movie.date}</strong> -&nbsp;
            {editIndex === index ? (
              <>
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
                <input
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                />
                <button onClick={() => handleUpdate(index)}>저장</button>
              </>
            ) : (
              <>
                {movie.title}
                <div style={{ fontStyle: 'italic', color: '#666' }}>{movie.comment}</div> 
                <button onClick={() => startEdit(index, movie.title)}>수정</button>
              </>
            )}
            <button onClick={() => handleDelete(index)}>삭제</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;