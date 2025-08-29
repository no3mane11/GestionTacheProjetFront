import React, { useEffect, useState } from "react";
import {
  BarChart, Bar,
  LineChart, Line,
  AreaChart, Area,
  RadialBarChart, RadialBar,
  XAxis, YAxis,
  Tooltip, ResponsiveContainer,
  CartesianGrid, Legend
} from "recharts";
import api from "../services/api";
import "./Dashboard.css";
import InsightsIcon from "@mui/icons-material/Insights";

function Dashboard() {
  const currentYear = new Date().getFullYear();

  const [projets, setProjets] = useState([]);
  const [projetId, setProjetId] = useState(null);
  const [mois, setMois] = useState(new Date().getMonth() + 1);
  const [annee, setAnnee] = useState(currentYear);
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [chartType, setChartType] = useState("bar");

  /** --- Charger les projets --- */
  useEffect(() => {
    const fetchProjets = async () => {
      try {
        const response = await api.get("/Projets/dto");
        const cleaned = response.data.map((p) => ({
          id: p.Id,
          nomProjet: p.NomProjet
        }));
        setProjets(cleaned);
        if (cleaned.length > 0) setProjetId(cleaned[0].id);
      } catch (error) {
        console.error("❌ Erreur chargement projets :", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjets();
  }, []);

  /** --- Charger les heures --- */
  const fetchData = async () => {
    if (!projetId || !mois || !annee) return;

    try {
      const response = await api.get("/AffectationTaches/heures-par-collaborateur", {
        params: { projetId, mois, annee }
      });

      const normalized = response.data.map((item) => ({
        nomCollaborateur: item.NomCollaborateur,
        totalHeures: Number(item.TotalHeures ?? 0),
        fill: "#42a5f5"
      }));

      setData(normalized);
    } catch (error) {
      console.error("❌ Erreur chargement des heures :", error);
      setData([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, [projetId, mois, annee]);

  /** --- Changer de type de graphique --- */
  const toggleChartType = () => {
    const types = ["bar", "line", "area", "radial"];
    const next = types[(types.indexOf(chartType) + 1) % types.length];
    setChartType(next);
  };

  /** --- Rendu graphique dynamique --- */
  const renderChart = () => {
    switch (chartType) {
      case "line":
        return (
          <LineChart data={data} margin={{ top: 30, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="nomCollaborateur" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="totalHeures"
              stroke="#ff7043"
              strokeWidth={3}
              dot={{ r: 5, fill: "#ff7043" }}
            />
          </LineChart>
        );

      case "area":
        return (
          <AreaChart data={data} margin={{ top: 30, right: 30, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="colorHeures" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#42a5f5" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#42a5f5" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="nomCollaborateur" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area
              type="monotone"
              dataKey="totalHeures"
              stroke="#42a5f5"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorHeures)"
            />
          </AreaChart>
        );

      case "radial":
        return (
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="20%"
            outerRadius="90%"
            barSize={15}
            data={data}
          >
            <RadialBar
              minAngle={15}
              label={{ position: "insideStart", fill: "#fff" }}
              background
              clockWise
              dataKey="totalHeures"
            />
            <Tooltip />
            <Legend />
          </RadialBarChart>
        );

      default:
        return (
          <BarChart data={data} margin={{ top: 30, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="nomCollaborateur" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="totalHeures" fill="#42a5f5" radius={[8, 8, 0, 0]} maxBarSize={50} />
          </BarChart>
        );
    }
  };

  if (isLoading) {
    return <p style={{ textAlign: "center", marginTop: "2rem" }}>Chargement en cours...</p>;
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <InsightsIcon style={{ fontSize: 40, color: "var(--primary)" }} />
        <div>
          <h2>Tableau de Bord</h2>
          <p>Visualisez les performances et heures de travail par collaborateur</p>
        </div>
      </header>

      {/* --- Cartes statistiques --- */}
      <div className="stats-cards">
        <div className="stat-card">
          <h3>{projets.length}</h3>
          <p>Projets actifs</p>
        </div>
        <div className="stat-card">
          <h3>{data.reduce((a, b) => a + b.totalHeures, 0)}</h3>
          <p>Total heures</p>
        </div>
        <div className="stat-card">
          <h3>{data.length}</h3>
          <p>Collaborateurs</p>
        </div>
      </div>

      {/* --- Filtres --- */}
      <div className="filters">
        <div className="filter-group">
          <label>Projet :</label>
          <select value={projetId || ""} onChange={(e) => setProjetId(Number(e.target.value))}>
            {projets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nomProjet}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Mois :</label>
          <select value={mois} onChange={(e) => setMois(Number(e.target.value))}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Année :</label>
          <select value={annee} onChange={(e) => setAnnee(Number(e.target.value))}>
            {Array.from({ length: 5 }, (_, i) => currentYear - 2 + i).map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <button className="btn-toggle-chart" onClick={toggleChartType}>
          🔁 {chartType.toUpperCase()}
        </button>
      </div>

      {data.length > 0 ? (
        <div className="chart-card">
          <ResponsiveContainer width="100%" height={420}>
            {renderChart()}
          </ResponsiveContainer>
        </div>
      ) : (
        <p style={{ textAlign: "center", marginTop: "2rem" }}>
          Aucune donnée trouvée pour ce projet/mois/année.
        </p>
      )}
    </div>
  );
}

export default Dashboard;
