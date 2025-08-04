import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [movies, setMovies] = useState([]);
  const [date, setDate] = useState('');
  const [title, setTitle] = useState('');
  const [editIndex, setEditIndex] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem("my_movie_timeline");
    console.log('로컬스토리지에 저장된 값:', stored); 

    if (stored) {
    const parsed = JSON.parse(stored);
    console.log('파싱된 영화 목록:', parsed);    
    setMovies(parsed);
    }
  }, []);

  useEffect(() => {
    if (movies.length > 0) {
      localStorage.setItem("my_movie_timeline", JSON.stringify(movies));
      console.log('저장됨:', JSON.stringify(movies));
    }    
  }, [movies]);

  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!date || !title) return;

    const newMovie = { date, title };
    const updatedMovies = [...movies, newMovie];
    
    setMovies(updatedMovies);    
    setDate('');
    setTitle('');
  };

  const handleDelete = (indexToDelete) => {
    const updated = movies.filter((_, idx) => idx !== indexToDelete);
    setMovies(updated);    
  };

  const startEdit = (index) => {
    setEditIndex(index);
    setEditTitle(movies[index].title);
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