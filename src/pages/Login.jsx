import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";
import "./Auth.css";
import logoKBM from "../assets/logo/logoKBM.png";

function Login() {
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !motDePasse) {
      toast.error("❗ Veuillez remplir tous les champs.");
      return;
    }

    try {
      const response = await api.post("/Utilisateurs/login", {
        email,
        motDePasse,
      });

      const { token } = response.data;

      if (token) {
        localStorage.setItem("token", token);
        const decoded = jwtDecode(token);

        const roles =
          decoded.role ||
          decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
        const roleList = Array.isArray(roles) ? roles : roles ? [roles] : [];

        toast.success("✅ Connexion réussie !");

        setTimeout(() => {
          if (roleList.includes("Admin")) navigate("/accueil");
          else if (roleList.includes("Collaborateur")) navigate("/dashboard");
          else toast.error("❌ Rôle non reconnu");
        }, 800);
      } else {
        toast.error("❌ Token manquant dans la réponse API");
      }
    } catch (error) {
      toast.error("❌ Email ou mot de passe incorrect");
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <img src={logoKBM} alt="Logo KBM" className="auth-logo" />
        <h2>Connexion à votre espace</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email professionnel"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
          />
          <button type="submit">Se connecter</button>
        </form>
        <p>
          Pas encore inscrit ? <Link to="/inscription">Créer un compte</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
