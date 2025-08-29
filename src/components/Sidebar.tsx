import React, { useEffect, useState } from "react";
import {
  LayoutDashboard, Users, Folder, ClipboardList, Ticket,
  CalendarClock, Bot, ChevronRight, LogOut, Moon, Sun, Menu
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { getUserRole, logout } from "../services/auth";
import logoKBM from "../assets/logo/logoKBM.png";
import api from "../services/api";
import "./Sidebar.css";

interface CurrentUser {
  nom: string;
  prenom: string;
  email: string;
  photoProfil?: string;
}

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = getUserRole();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    api.get<CurrentUser>("/Utilisateurs/me")
      .then(resp => {
        console.log("✅ User loaded:", resp.data);
        setUser(resp.data);
      })
      .catch(err => console.error("❌ Fetch user error:", err));

    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDarkMode(prefersDark);
    document.documentElement.classList.toggle("dark", prefersDark);
  }, []);

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle("dark", !darkMode);
    setDarkMode(!darkMode);
  };

  const navItems = role === "Admin"
    ? [
        { path: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
        { path: "/collaborateurs", label: "Collaborateurs", icon: <Users size={18} /> },
        { path: "/projets", label: "Projets", icon: <Folder size={18} /> },
        { path: "/affectations", label: "Affectations", icon: <ClipboardList size={18} /> },
        { path: "/taches", label: "Tâches", icon: <Ticket size={18} /> },
        { path: "/assistant-ia", label: "Assistant IA", icon: <Bot size={18} /> },
      ]
    : [
        { path: "/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
        { path: "/planning", label: "Mon planning", icon: <CalendarClock size={18} /> },
        { path: "/assistant-ia", label: "Assistant IA", icon: <Bot size={18} /> },
      ];

  const getProfileImage = () => {
    if (user?.photoProfil) return user.photoProfil;
    return `https://i.pravatar.cc/60?u=${user?.email}`;
  };

  return (
    <aside className={`custom-sidebar ${darkMode ? "dark" : ""} ${collapsed ? "collapsed" : ""}`}>
      <div className="sidebar-header">
        <button onClick={() => setCollapsed(!collapsed)} className="collapse-btn"><Menu size={20} /></button>
      </div>
      <div className="sidebar-top">
        <img src={logoKBM} alt="Logo KBM" className="brand-logo" />
        {!collapsed && user && (
          <div className="profile">
            <div className="profile-img-wrapper">
              <img
                src={getProfileImage()}
                alt="Profile"
                className="profile-img"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = `https://i.pravatar.cc/60?u=${user.email}`;
                }}
              />
            </div>
            <h3 className="name">{user.prenom} {user.nom}</h3>
            <p className="email">{user.email}</p>
          </div>
        )}
      </div>
      <nav className="nav-section">
        {navItems.map(item => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`nav-item ${location.pathname === item.path ? "active" : ""}`}
          >
            <span className="icon">{item.icon}</span>
            {!collapsed && <span className="label">{item.label}</span>}
            {!collapsed && location.pathname === item.path && <ChevronRight size={16} className="arrow" />}
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <button onClick={toggleDarkMode} className="theme-toggle">
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          {!collapsed && <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>}
        </button>
        <button onClick={() => { logout(); navigate("/login"); }} className="logout-btn">
          <LogOut size={18} />
          {!collapsed && <span>Déconnexion</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
