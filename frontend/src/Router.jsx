import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import App from "./App";            
import Login from "./pages/Login";
import Timeline from "./pages/Timeline";
import NavBar from "./components/NavBar";
import Register from "./pages/Register";
import PrivateRoute from "./components/PrivateRoute";

export default function RouterRoot() {
  return (
    <BrowserRouter>
    <NavBar />
      <Routes>
        <Route path="/" element={<PrivateRoute><App /></PrivateRoute>} />
        <Route path="/timeline" element={<PrivateRoute><Timeline /></PrivateRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}