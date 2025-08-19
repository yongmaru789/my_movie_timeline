import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import App from "./App";            
import Login from "./pages/Login";
import Timeline from "./pages/Timeline";

export default function RouterRoot() {
  return (
    <BrowserRouter>
      {/* 간단한 상단 메뉴 (임시) */}
      <nav style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>
        <Link to="/" style={{ marginRight: 12 }}>홈</Link>
        <Link to="/timeline" style={{ marginRight: 12 }}>타임라인</Link>
        <Link to="/login">로그인</Link>
      </nav>

      <Routes>
        {/* 기존 App.jsx 화면을 홈페이지로 사용 */}
        <Route path="/" element={<App />} />
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}