import { useEffect, useState } from "react";
import api from "../services/api";
import "./AssistantIA.css";
import { jsPDF } from "jspdf";

// --- Import des icônes Material UI ---
import SmartToyIcon from "@mui/icons-material/SmartToy";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import ChecklistIcon from "@mui/icons-material/Checklist";
import TimelineIcon from "@mui/icons-material/Timeline";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import InsightsIcon from "@mui/icons-material/Insights";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import DownloadIcon from "@mui/icons-material/Download";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import HourglassTopIcon from "@mui/icons-material/HourglassTop";

function AssistantIA() {
  const [loading, setLoading] = useState(false);
  const [reponse, setReponse] = useState("");
  const [erreur, setErreur] = useState("");
  const [selectedProjetId, setSelectedProjetId] = useState("");
  const [projets, setProjets] = useState([]);
  const [loadingProjets, setLoadingProjets] = useState(true);
  const [statsProjet, setStatsProjet] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [promptLibre, setPromptLibre] = useState("");

  useEffect(() => {
    const chargerProjets = async () => {
      setLoadingProjets(true);
      try {
        const response = await api.get("/Projets/dto");
        setProjets(response.data);
      } catch (err) {
        setErreur("Impossible de charger les projets.");
      } finally {
        setLoadingProjets(false);
      }
    };
    chargerProjets();
  }, []);

  const interroger = async (endpoint) => {
    setLoading(true);
    setErreur("");
    setReponse("");
    setStatsProjet(null);
    try {
      const res = await api.get(endpoint);
      setReponse(res.data.reponse);
    } catch {
      setErreur("Erreur durant l'analyse IA.");
    } finally {
      setLoading(false);
    }
  };

  const interrogerPrediction = async () => {
    if (!selectedProjetId) return;

    setLoading(true);
    setErreur("");
    setReponse("");
    setStatsProjet(null);

    try {
      const res = await api.get(`/ia/projets-fin/${selectedProjetId}`);
      console.log("Réponse prédiction :", res.data);
      setReponse(res.data?.reponse || "");

      const projetIdNum = Number(selectedProjetId);
      const projet = projets.find((p) => Number(p.Id) === projetIdNum);

      if (projet && projet.TachesTotal > 0) {
        const avancement = Math.round(
          (projet.TachesTerminees / projet.TachesTotal) * 100
        );
        setStatsProjet({ nom: projet.NomProjet, avancement });
      }
    } catch (err) {
      console.error(err);
      setErreur(err.response?.data?.erreur || "Erreur prédiction projet.");
    } finally {
      setLoading(false);
    }
  };

  const interrogerLibre = async () => {
    if (!promptLibre.trim()) {
      alert("Veuillez saisir une question à l'IA.");
      return;
    }

    setLoading(true);
    setErreur("");
    setReponse("");
    try {
      const res = await api.post("/ia/question-libre", { prompt: promptLibre });
      setReponse(res.data.reponse);
    } catch {
      setErreur("Erreur IA (question libre).");
    } finally {
      setLoading(false);
    }
  };

  const getAvancementColor = (value) => {
    if (value >= 80) return "#4caf50";
    if (value >= 50) return "#ff9800";
    return "#f44336";
  };

  const exporterTxt = () => {
    if (!reponse) return;
    const blob = new Blob([reponse], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "reponse_IA.txt";
    link.click();
  };

const exporterPdf = () => {
  if (!reponse) return;

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const margin = 10;
  const maxLineWidth = 190; // A4 width (210mm) - 2*margin
  const lineHeight = 7;
  const pageHeight = doc.internal.pageSize.height;

  const lines = doc.splitTextToSize(reponse, maxLineWidth);
  let y = margin;

  lines.forEach((line) => {
    if (y + lineHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
    doc.text(line, margin, y);
    y += lineHeight;
  });

  doc.save("reponse_IA.pdf");
};


  return (
    <div className={`ia-container ${darkMode ? "dark" : ""}`}>
      <div className="mode-toggle">
        <button onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          {darkMode ? " Mode clair" : " Mode sombre"}
        </button>
      </div>

      <h1 className="ia-title">
        <SmartToyIcon fontSize="large" /> Assistant IA
      </h1>
      <p className="ia-description">
        Optimisez vos projets grâce à l’IA : urgences, performances, santé des
        projets et prédictions.
      </p>

      <div className="ia-buttons">
        <button
          className="ia-button"
          disabled={loading}
          onClick={() => interroger("/ia/taches-urgentes")}
        >
          <ChecklistIcon /> Tâches urgentes
        </button>
        <button
          className="ia-button"
          disabled={loading}
          onClick={() => interroger("/ia/collaborateurs-performance")}
        >
          <TimelineIcon /> Performance
        </button>
        <button
          className="ia-button"
          disabled={loading}
          onClick={() => interroger("/ia/projets-sante")}
        >
          <BusinessCenterIcon /> Santé projets
        </button>
      </div>

      <div className="ia-prediction-zone">
        <label htmlFor="projet-select">Projet à prédire :</label>
        <select
          id="projet-select"
          value={selectedProjetId}
          onChange={(e) => setSelectedProjetId(e.target.value)}
          disabled={loadingProjets}
        >
          <option value="">-- Choisir un projet --</option>
          {projets.map((p) => (
            <option key={p.Id} value={p.Id.toString()}>
              {p.NomProjet} {p.Deadline ? `(${p.Deadline.substring(0, 10)})` : ""}
            </option>
          ))}
        </select>

        <button
          className="ia-button"
          onClick={interrogerPrediction}
          disabled={!selectedProjetId || loading}
        >
          <InsightsIcon /> Prédire la fin
        </button>
      </div>

      <div className="ia-libre-zone">
        <h3>
          <QuestionAnswerIcon /> Question libre à l’IA
        </h3>
        <textarea
          value={promptLibre}
          onChange={(e) => setPromptLibre(e.target.value)}
          placeholder="Posez une question à l’IA…"
          disabled={loading}
          className="ia-textarea"
        />
        <button
          className="ia-button"
          onClick={interrogerLibre}
          disabled={loading || !promptLibre.trim()}
        >
          <SmartToyIcon /> Interroger
        </button>
      </div>

      {loading && (
        <p className="ia-thinking">
          <HourglassTopIcon /> L’IA réfléchit... Merci de patienter.
        </p>
      )}

      {!loading && reponse === "" && (
        <p className="ia-empty">Aucune réponse générée par l’IA pour ce projet.</p>
      )}

      {reponse && (
        <>
          <div className="ia-result">
            <div className="ia-result-header">Résultat IA</div>
            <div className="ia-result-content">
              {reponse
                .split("\n")
                .filter(Boolean)
                .map((ligne, index) => {
                  const trimmed = ligne.trim();
                  if (trimmed.startsWith("⚠️"))
                    return (
                      <p key={index} className="ia-alert">
                        <WarningAmberIcon /> {trimmed.replace("⚠️", "")}
                      </p>
                    );
                  if (trimmed.startsWith("💡"))
                    return (
                      <p key={index} className="ia-suggestion">
                        <LightbulbOutlinedIcon /> {trimmed.replace("💡", "")}
                      </p>
                    );
                  if (trimmed.startsWith("-"))
                    return (
                      <li key={index} className="ia-task">
                        {trimmed.substring(1).trim()}
                      </li>
                    );
                  return (
                    <p key={index} className="ia-text">
                      {trimmed}
                    </p>
                  );
                })}
            </div>
          </div>

          <div className="ia-export-buttons">
            <button onClick={exporterTxt}>
              <DownloadIcon /> Exporter en .txt
            </button>
            <button onClick={exporterPdf}>
              <PictureAsPdfIcon /> Exporter en .pdf
            </button>
          </div>
        </>
      )}

      {statsProjet && (
        <div className="ia-chart">
          <h4>
            <TimelineIcon /> Avancement : {statsProjet.nom}
          </h4>
          <div
            className="chart-circle"
            style={{
              "--progress": statsProjet.avancement,
              background: `conic-gradient(${getAvancementColor(
                statsProjet.avancement
              )} ${statsProjet.avancement}%, #ddd 0)`,
            }}
          >
            <span>{statsProjet.avancement}%</span>
          </div>
        </div>
      )}

      {erreur && (
        <p className="ia-error">
          <WarningAmberIcon /> {erreur}
        </p>
      )}
    </div>
  );
}

export default AssistantIA;
