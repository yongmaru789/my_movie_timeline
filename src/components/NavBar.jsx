import { Link, useLocation } from "react-router-dom";

export default function NavBar() {
  const { pathname } = useLocation();

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

  return (
    <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-200">
      <nav className="mx-auto max-w-4xl p-3 flex items-center gap-2">
        <div className="text-lg font-bold mr-auto">🎬 인생 영화</div>
        <Item to="/" label="홈" />
        <Item to="/timeline" label="타임라인" />
        <Item to="/login" label="로그인" />
      </nav>
    </header>
  );
}
