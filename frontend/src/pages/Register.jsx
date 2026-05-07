import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({ username: "", password: "", passwordConfirm: "" });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: form.username, password: form.password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "회원가입 실패");
      }
      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{background: "#F5FBFF"}}>
      <div className="bg-white rounded-3xl shadow-sm border border-sky-100 w-full max-w-sm p-8">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🎬</div>
          <h1 className="text-2xl font-bold" style={{color: "#1A5FA0"}}>회원가입</h1>
          <p className="text-sm mt-1" style={{color: "#93C5E8"}}>나만의 영화 감상 기록을 시작하세요</p>
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
          <div className="relative">
            <i className="fa-solid fa-lock absolute left-4 top-1/2 -translate-y-1/2" style={{color: "#93C5E8"}}></i>
            <input
              name="passwordConfirm"
              type="password"
              placeholder="비밀번호 확인"
              value={form.passwordConfirm}
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
            {loading ? "가입 중..." : "회원가입"}
          </button>
          <p className="text-center text-sm" style={{color: "#93C5E8"}}>
            이미 계정이 있으신가요?{" "}
            <Link to="/login" className="font-semibold" style={{color: "#3D8FE0"}}>로그인</Link>
          </p>
        </form>
      </div>
    </div>
  );
}