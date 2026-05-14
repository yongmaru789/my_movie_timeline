import { Link, useLocation, useNavigate } from "react-router-dom";
import { useApp } from "../store/AppContext";

export default function NavBar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { state, actions } = useApp();

  const Item = ({ to, label, icon }) => (
    <Link
      to={to}
      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition ${
        pathname === to
          ? "bg-sky-100 text-sky-500 font-semibold"
          : "text-gray-400 hover:bg-sky-50 hover:text-sky-400"
      }`}
    >
      <i className={icon}></i>
      {label}
    </Link>
  );

  const handleLogout = () => {
    actions.logout();
    navigate("/login");
  };

  return (
    <>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css" />
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-sky-100">
        <nav className="w-full px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-lg font-bold text-sky-500">
            <i className="fa-solid fa-film"></i>
            인생 영화
          </div>
          <div className="flex items-center gap-2">
            <Item to="/" label="홈" icon="fa-solid fa-house" />
            <Item to="/timeline" label="타임라인" icon="fa-solid fa-timeline" />
            <Item to="/recommend" label="추천" icon="fa-solid fa-star" />
            {state.user ? (
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-2 text-sm text-sky-500 font-semibold bg-sky-50 px-4 py-2 rounded-full">
                  <i className="fa-solid fa-user-circle"></i>
                  {state.user.username || localStorage.getItem("username")}님
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm text-gray-400 border border-gray-200 hover:bg-sky-50 hover:text-sky-400 transition"
                >
                  <i className="fa-solid fa-right-from-bracket"></i>
                  로그아웃
                </button>
              </div>
            ) : (
              <Item to="/login" label="로그인" icon="fa-solid fa-right-to-bracket" />
            )}
          </div>
        </nav>
      </header>
    </>
  );
}