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

  if (loading) return (
    <div className="flex items-center justify-center py-20" style={{color: "#93C5E8"}}>
      <i className="fa-solid fa-spinner fa-spin text-2xl mr-3"></i>
      불러오는 중...
    </div>
  );

  if (!allMovies.length) return (
    <div className="flex flex-col items-center justify-center py-20" style={{color: "#93C5E8"}}>
      <i className="fa-solid fa-film text-5xl mb-4"></i>
      <p>아직 등록한 영화가 없습니다.</p>
    </div>
  );

  const groups = groupByYearMonth(allMovies);
  const years = Object.keys(groups).sort((a, b) => b - a);

  return (
    <>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
      <div className="max-w-2xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-8 flex items-center gap-3" style={{color: "#1A5FA0"}}>
          <i className="fa-solid fa-timeline" style={{color: "#5BAAEE"}}></i>
          인생 영화 타임라인
        </h1>
        {years.map((year) => (
          <div key={year} className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-xl font-bold" style={{color: "#1A5FA0"}}>{year}년</span>
              <div className="flex-1 h-px" style={{background: "#C8E4FF"}}></div>
              <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{background: "#EBF5FF", color: "#5BAAEE"}}>
                {Object.values(groups[year]).flat().length}편
              </span>
            </div>
            {Object.keys(groups[year]).sort((a, b) => b - a).map((month) => (
              <div key={month} className="mb-6 ml-4">
                <div className="flex items-center gap-2 mb-3">
                  <i className="fa-regular fa-calendar-days text-sm" style={{color: "#93C5E8"}}></i>
                  <span className="text-sm font-semibold" style={{color: "#5BAAEE"}}>
                    {MONTH_KR[parseInt(month) - 1]}
                  </span>
                </div>
                <div className="flex flex-col gap-3 ml-4">
                  {groups[year][month].map((movie) => (
                    <div key={movie.id} className="flex items-center gap-4 bg-white rounded-2xl border border-sky-100 p-3 shadow-sm hover:shadow-md transition-shadow">
                      {movie.poster ? (
                        <img src={movie.poster} alt={movie.title} className="w-12 h-16 object-cover rounded-xl border border-sky-100" />
                      ) : (
                        <div className="w-12 h-16 rounded-xl flex items-center justify-center text-xl" style={{background: "#EBF5FF"}}>
                          🎬
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold truncate" style={{color: "#1A5FA0"}}>{movie.title}</p>
                        <p className="text-xs mt-0.5 flex items-center gap-1" style={{color: "#93C5E8"}}>
                          <i className="fa-regular fa-calendar-days"></i>
                          {movie.watchedDate || movie.date}
                        </p>
                        <p className="text-sm mt-1" style={{color: "#FFB347"}}>
                          {"★".repeat(Math.round(movie.rating))}{"☆".repeat(5 - Math.round(movie.rating))}
                          <span className="ml-1 text-xs" style={{color: "#93C5E8"}}>{movie.rating} / 5.0</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}