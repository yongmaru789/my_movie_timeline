import { Link, useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../store/AppContext";

export default function NavBar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { state, actions } = useApp();

  const Item = ({ to, label }) => (
    <Link
      to={to}
      className={`px-3 py-2 rounded-lg hover:bg-gray-100 transition ${
        pathname === to ? "font-semibold text-gray-900 bg-gray-100" : "text-gray-600"
      }`}
    >
      {label}
    </Link>
  );

  const handleLogout = () => {
    actions.logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-200">
      <nav className="w-full px-6 py-3 flex items-center justify-between">
        <div className="text-lg font-bold">🎬 인생 영화</div>
        <div className="flex items-center gap-2">
          <Item to="/" label="홈" />
          <Item to="/timeline" label="타임라인" />
          {state.user ? (
            <button
              onClick={handleLogout}
              className="px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
            >
              로그아웃
            </button>
          ) : (
            <Item to="/login" label="로그인" />
          )}
        </div>
      </nav>
    </header>
  );
}
