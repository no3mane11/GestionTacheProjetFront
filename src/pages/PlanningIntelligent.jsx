import React, { useEffect, useState } from "react";
import api from "../services/api";
import { getDecodedToken } from "../services/auth";
import "./PlanningIntelligent.css";

// Icônes Material UI
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EventIcon from "@mui/icons-material/Event";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import TimelineIcon from "@mui/icons-material/Timeline";

function PlanningIntelligent() {
  const [taches, setTaches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const decoded = getDecodedToken();
    const collaborateurId = decoded?.collaborateur_id;

    if (!collaborateurId) {
      alert("Impossible d’identifier le collaborateur.");
      return;
    }

    const fetchTaches = async () => {
      try {
        const response = await api.get("/taches/me/planning-intelligent");
        // On trie les tâches par date prévue de fin
        const sortedTaches = response.data.sort(
          (a, b) => new Date(a.DateFinPrevue) - new Date(b.DateFinPrevue)
        );
        setTaches(sortedTaches);
      } catch (error) {
        console.error("Erreur récupération planning :", error);
        alert("Erreur chargement du planning.");
      } finally {
        setLoading(false);
      }
    };

    fetchTaches();
  }, []);

  const getPrioriteBadge = (score) => {
    if (score >= 8)
      return <span className="badge badge-high"><PriorityHighIcon /> {score}/10</span>;
    if (score >= 5)
      return <span className="badge badge-medium"><PriorityHighIcon /> {score}/10</span>;
    return <span className="badge badge-low"><PriorityHighIcon /> {score}/10</span>;
  };

  if (loading) return <p className="loading">Chargement du planning...</p>;

  return (
    <div className="planning-container">
      <h2 className="planning-title"><TimelineIcon fontSize="large" /> Planning Intelligent</h2>

      {taches.length === 0 ? (
        <p className="no-task">Aucune tâche planifiée pour aujourd’hui.</p>
      ) : (
        <div className="timeline">
          {taches.map((tache, index) => (
            <div className="timeline-item" key={tache.TacheId}>
              <div className="timeline-marker"></div>
              <div className="timeline-content">
                <div className="tache-card">
                  <div className="card-header">
                    <h3 className="tache-title"><TaskAltIcon /> {tache.Titre}</h3>
                    {getPrioriteBadge(tache.Priorite)}
                  </div>

                  <div className="tache-info">
                    <p><AccessTimeIcon /> Durée : <strong>{tache.Duree} h</strong></p>
                    <p><EventIcon /> Deadline : <strong>{tache.Deadline?.substring(0, 10) || "—"}</strong></p>
                    <p><AccessTimeIcon /> Fin prévue : <strong>{new Date(tache.DateFinPrevue).toLocaleString()}</strong></p>
                  </div>

                  <div className="progress-bar-container">
                    <div
                      className="progress-bar"
                      style={{
                        width: `${(tache.Priorite / 10) * 100}%`,
                        backgroundColor:
                          tache.Priorite >= 8 ? "#e74c3c" :
                          tache.Priorite >= 5 ? "#f1c40f" : "#2ecc71"
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PlanningIntelligent;
