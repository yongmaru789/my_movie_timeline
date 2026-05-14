import { useState } from "react";
import { useApp } from "../store/AppContext";

export default function Recommend() {
    const { state } = useApp();
    const [movies, setMovies] = useState(() => {
        const saved = localStorage.getItem("recommendResult");
        return saved ? JSON.parse(saved) : null;
    });
    const [loading, setLoading] = useState(false);
    const [taste, setTaste] = useState(null);

    const handleRecommend = async () => {
        setLoading(true);
        try {
            const response = await fetch(
                `http://localhost:8080/api/recommend?userId=${state.user.id}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );
            const data = await response.json();

            try {
                const parsed = JSON.parse(data.data);
                setMovies(parsed);
                localStorage.setItem("recommendResult", JSON.stringify(parsed));
            } catch {
                setMovies(null);
                alert(data.data); // "별점 4점 이상인 영화가 없습니다..." 메시지 표시
            }
        } catch (e) {
            alert("추천을 불러오는 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-3xl mx-auto px-6 py-12">

                {/* 헤더 */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-1.5 mb-6 text-sm text-gray-500">
                        ✨ AI 맞춤 추천
                    </div>
                    <h1 className="text-3xl font-semibold text-gray-900 mb-4 leading-snug">
                        내 취향을 분석해서<br />딱 맞는 영화를 골라드려요
                    </h1>
                    <p className="text-gray-500 mb-8 leading-relaxed">
                        별점 4점 이상 준 영화들을 바탕으로<br />AI가 취향을 파악하고 새로운 영화를 추천해드려요
                    </p>
                    <button
                        onClick={handleRecommend}
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-8 py-3 bg-gray-900 text-white rounded-full text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition"
                    >
                        {loading ? (
                            <>⏳ 취향 분석 중...</>
                        ) : (
                            <>🎬 추천 받기</>
                        )}
                    </button>
                </div>

                {/* 추천 결과 */}
                {movies && (
                    <>
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-sm text-gray-400">
                                AI가 선택한 영화 <span className="text-gray-700 font-medium">{movies.length}편</span>
                            </p>
                            <button
                                onClick={handleRecommend}
                                disabled={loading}
                                className="flex items-center gap-1.5 px-4 py-1.5 text-sm text-gray-500 border border-gray-200 rounded-full hover:bg-gray-100 transition disabled:opacity-50"
                            >
                                🔄 다시 추천받기
                            </button>
                        </div>

                        <div className="flex flex-col gap-3">
                            {movies.map((movie, index) => (
                                <div
                                    key={index}
                                    className="bg-white border border-gray-100 rounded-2xl p-5 flex items-start gap-4 hover:border-gray-300 transition"
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-medium text-base ${
                                        index === 0 ? "bg-violet-100 text-violet-500" :
                                        index === 1 ? "bg-sky-100 text-sky-500" :
                                        index === 2 ? "bg-emerald-100 text-emerald-500" :
                                        index === 3 ? "bg-amber-100 text-amber-500" :
                                        "bg-rose-100 text-rose-500"
                                    }`}>
                                        {index + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap mb-2">
                                            <span className="text-base font-semibold text-gray-900">{movie.title}</span>
                                            {movie.year && (
                                                <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">{movie.year}</span>
                                            )}
                                            {movie.genres && (
                                                <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">{movie.genres}</span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500 leading-relaxed">{movie.reason}</p>
                                    </div>
                                    <span className="text-gray-300 flex-shrink-0 mt-1">›</span>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}