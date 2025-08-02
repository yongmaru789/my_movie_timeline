import { useState } from 'react';
import './App.css';

function App() {
  const [movies, setMovies] = useState([]);
  const [date, setDate] = useState('');
  const [title, setTitle] = useState('');
  const [editIndex, setEditIndex] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!date || !title) return;

    const newMovie = { date, title };
    setMovies([...movies, newMovie]);

    setDate('');
    setTitle('');
  };

  const handleDelete = (indexToDelete) => {
    const newMovies = movies.filter((_, idx) => idx !== indexToDelete);
    setMovies(newMovies);
  };

  const startEdit = (index, currentTitle) => {
    setEditIndex(index);
    setEditTitle(currentTitle);
  };

  const handleUpdate = (index) => {
    const updatedMovies = movies.map((movie, idx) =>
      idx === index ? { ...movie, title: editTitle } : movie
    );
    setMovies(updatedMovies);
    setEditIndex(null);
    setEditTitle('');
  };

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
        <button type="submit">등록</button>
      </form>

      <ul>
        {movies.map((movie, index) => (
          <li key={index}>
            <strong>{movie.date}</strong> -&nbsp;
            {editIndex === index ? (
              <>
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                />
                <button onClick={() => handleUpdate(index)}>저장</button>
              </>
            ) : (
              <>
                {movie.title}
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