import { Navigate } from "react-router-dom";
import { isAuthenticated, getUserRole } from "../services/auth";

const PrivateRoute = ({ children, roles = [] }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  const role = getUserRole();

  // 🔐 Si des rôles sont exigés et le rôle utilisateur n'est pas autorisé
  if (roles.length > 0 && !roles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default PrivateRoute;
