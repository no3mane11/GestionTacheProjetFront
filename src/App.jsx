import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import MainLayout from "./components/MainLayout";
import Login from "./pages/Login";
import Inscription from "./pages/Inscription";
import Accueil from "./pages/Accueil";
import Taches from "./pages/Taches";
import Projets from "./pages/Projets";
import Affectations from "./pages/Affectations";
import Collaborateurs from "./pages/Collaborateurs";
import Dashboard from "./pages/Dashboard";
import PrivateRoute from "./components/PrivateRoute";
import PlanningIntelligent from "./pages/PlanningIntelligent";
import AssistantIA from "./pages/AssistantIA";
import { isAuthenticated, getUserRole } from "./services/auth";

function RootRedirect() {
  if (!isAuthenticated()) return <Navigate to="/login" />;
  const role = getUserRole();
  if (role === "Admin") return <Navigate to="/accueil" />;
  if (role === "Collaborateur") return <Navigate to="/dashboard" />;
  return <Navigate to="/unauthorized" />;
}

function AppContent() {
  const location = useLocation();
  const noSidebarRoutes = ["/login", "/inscription"];
  const showSidebar = !noSidebarRoutes.includes(location.pathname.toLowerCase());

  const RoutesTree = (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/inscription" element={<Inscription />} />
      <Route path="/" element={<RootRedirect />} />
      <Route path="/accueil" element={<PrivateRoute roles={["Admin"]}><Accueil /></PrivateRoute>} />
      <Route path="/dashboard" element={<PrivateRoute roles={["Collaborateur", "Admin"]}><Dashboard /></PrivateRoute>} />
      <Route path="/taches" element={<PrivateRoute roles={["Admin", "Collaborateur"]}><Taches /></PrivateRoute>} />
      <Route path="/projets" element={<PrivateRoute roles={["Admin"]}><Projets /></PrivateRoute>} />
      <Route path="/affectations" element={<PrivateRoute roles={["Admin"]}><Affectations /></PrivateRoute>} />
      <Route path="/collaborateurs" element={<PrivateRoute roles={["Admin"]}><Collaborateurs /></PrivateRoute>} />
      <Route path="/planning" element={<PlanningIntelligent />} />
      <Route path="/assistant-ia" element={<AssistantIA />} />
      <Route path="/unauthorized" element={<h2 className="text-center">⛔ Accès non autorisé</h2>} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );

  return showSidebar ? <MainLayout>{RoutesTree}</MainLayout> : RoutesTree;
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
