import { useState } from 'react';

function App() {

  const [date, setDate] = useState("");
  const [title, setTitle] = useState("");
  const [movies, setMovies] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (date && title) {
      const newMovie = { date, title };
      setMovies([...movies, newMovie]);
      setDate("");
      setTitle("");
    }
  };

  return (
    <>
      <h1>인생 영화 타임라인</h1>
      <p>내 인생의 각 시기를 기록해보는 공간</p>

      <form onSubmit={handleSubmit}>
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
        <button type="submit">등록</button>
      </form>

      <ul>
        {movies.map((movie, index) => (
          <li key={index}>
            {movie.date} - {movie.title}
          </li>
        ))}
      </ul>
    </>
  );
}

export default App;

