import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import App from "./App";            
import Login from "./pages/Login";
import Timeline from "./pages/Timeline";
import NavBar from "./components/NavBar";

export default function RouterRoot() {
  return (
    <BrowserRouter>
    <NavBar />
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}