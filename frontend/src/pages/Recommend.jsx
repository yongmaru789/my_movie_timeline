import { useState } from "react";
import { useApp } from "../store/AppContext";

export default function Recommend() {
    const { state } = useApp();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

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
            setResult(data.data);
        } catch (e) {
            setResult("추천을 불러오는 중 오류가 발생했습니다.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <h1 className="text-2xl font-bold mb-6">🎬 AI 영화 추천</h1>
            <button
                onClick={handleRecommend}
                disabled={loading}
                className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
            >
                {loading ? "추천 받는 중..." : "내 취향 분석해서 추천받기"}
            </button>
            {result && (
                <div className="mt-8 bg-white p-6 rounded-xl shadow">
                    <pre className="whitespace-pre-wrap text-gray-700">{result}</pre>
                </div>
            )}
        </div>
    );
}