import { useState, useEffect } from "react";
import { useApp } from "../store/AppContext";
import { Api } from "../lib/api";

function groupByYearMonth(movies) {
  const groups = {};
  for (const movie of movies) {
    const date = movie.watchedDate || movie.date;
    if (!date) continue;
    const [year, month] = date.split("-");
    if (!groups[year]) groups[year] = {};
    if (!groups[year][month]) groups[year][month] = [];
    groups[year][month].push(movie);
  }
  return groups;
}

const MONTH_KR = ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"];

export default function Timeline() {
  const { state } = useApp();
  const [allMovies, setAllMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = state.user?.id;
    if (!userId) return;

    (async () => {
      try {
        const { movies } = await Api.listAllMovies(userId);
        setAllMovies(movies);
      } catch {
      } finally {
        setLoading(false);
      }
    })();
  }, [state.user]);

  if (loading) return <div className="p-6">불러오는 중...</div>;
  if (!allMovies.length) return <div className="p-6">아직 등록한 영화가 없습니다.</div>;

  const groups = groupByYearMonth(allMovies);
  const years = Object.keys(groups).sort((a, b) => b - a);

  return (
    <div className="max-w-2xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold mb-8">🎬 인생 영화 타임라인</h1>
      {years.map((year) => (
        <div key={year} className="mb-10">
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">{year}년</h2>
          {Object.keys(groups[year]).sort((a, b) => b - a).map((month) => (
            <div key={month} className="mb-6 ml-4">
              <h3 className="text-md font-semibold text-gray-500 mb-3">
                {MONTH_KR[parseInt(month) - 1]}
              </h3>
              <div className="flex flex-col gap-3 ml-4">
                {groups[year][month].map((movie) => (
                  <div key={movie.id} className="flex items-center gap-4 bg-white rounded-xl shadow-sm p-3">
                    {movie.poster ? (
                      <img src={movie.poster} alt={movie.title} className="w-12 h-16 object-cover rounded-lg" />
                    ) : (
                      <div className="w-12 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">없음</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{movie.title}</p>
                      <p className="text-sm text-gray-400">{movie.watchedDate || movie.date}</p>
                      <p className="text-sm text-yellow-500">{"⭐".repeat(Math.round(movie.rating))} {movie.rating} / 5.0</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}