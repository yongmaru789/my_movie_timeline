import { useApp } from "../store/AppContext";
import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children }) {
  const { state } = useApp();

  if (state.loading) return null;

  if (!state.user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}