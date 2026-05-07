import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useApp } from "../store/AppContext";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { actions } = useApp();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await actions.login(form.username, form.password);
      navigate("/");
    } catch (err) {
      setError("아이디 또는 비밀번호가 올바르지 않습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{background: "#F5FBFF"}}>
      <div className="bg-white rounded-3xl shadow-sm border border-sky-100 w-full max-w-sm p-8">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🎬</div>
          <h1 className="text-2xl font-bold" style={{color: "#1A5FA0"}}>인생 영화</h1>
          <p className="text-sm mt-1" style={{color: "#93C5E8"}}>나만의 영화 감상 기록</p>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative">
            <i className="fa-solid fa-user absolute left-4 top-1/2 -translate-y-1/2" style={{color: "#93C5E8"}}></i>
            <input
              name="username"
              placeholder="아이디"
              value={form.username}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-sky-100 focus:outline-none focus:ring-2 focus:ring-sky-200 text-sm"
              style={{background: "#F5FBFF", color: "#1A5FA0"}}
            />
          </div>
          <div className="relative">
            <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2" style={{color: "#93C5E8"}}></i>
            <input
              name="password"
              type="password"
              placeholder="비밀번호"
              value={form.password}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-sky-100 focus:outline-none focus:ring-2 focus:ring-sky-200 text-sm"
              style={{background: "#F5FBFF", color: "#1A5FA0"}}
            />
          </div>
          {error && (
            <p className="text-sm text-center" style={{color: "#E07C7C"}}>{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="py-3 rounded-2xl text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            style={{background: "linear-gradient(135deg, #5BAAEE, #3D8FE0)"}}
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>
          <p className="text-center text-sm" style={{color: "#93C5E8"}}>
            계정이 없으신가요?{" "}
            <Link to="/register" className="font-semibold" style={{color: "#3D8FE0"}}>회원가입</Link>
          </p>
        </form>
      </div>
    </div>
  );
}