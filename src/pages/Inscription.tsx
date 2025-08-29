import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../services/api";
import toast from "react-hot-toast";
import "./Auth.css";
import logoKBM from "../assets/logo/logoKBM.png";

const Inscription = () => {
  const [nomUtilisateur, setNomUtilisateur] = useState("");
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [telephone, setTelephone] = useState("");
  const [photo, setPhoto] = useState(null);
  const navigate = useNavigate();

  const handleInscription = async (e) => {
    e.preventDefault();

    if (!nomUtilisateur || !email || !motDePasse || !nom || !prenom || !telephone) {
      toast.error("❗ Veuillez remplir tous les champs.");
      return;
    }

    const formData = new FormData();
    formData.append("NomUtilisateur", nomUtilisateur);
    formData.append("Email", email);
    formData.append("MotDePasse", motDePasse);
    formData.append("Nom", nom);
    formData.append("Prenom", prenom);
    formData.append("Telephone", telephone);
    if (photo) formData.append("PhotoProfil", photo);

    try {
      await api.post("/Utilisateurs/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("✅ Compte créé avec succès ! Redirection en cours...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data ||
        "Une erreur est survenue.";
      toast.error("❌ " + msg);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <img src={logoKBM} alt="Logo KBM" className="auth-logo" />
        <h2>Créer votre compte</h2>

        <form onSubmit={handleInscription} encType="multipart/form-data">
          <input
            type="text"
            placeholder="Nom"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
          />
          <input
            type="text"
            placeholder="Prénom"
            value={prenom}
            onChange={(e) => setPrenom(e.target.value)}
          />
          <input
            type="tel"
            placeholder="Téléphone"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
          />
          <input
            type="text"
            placeholder="Nom d'utilisateur"
            value={nomUtilisateur}
            onChange={(e) => setNomUtilisateur(e.target.value)}
          />
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
          <label className="file-label">
            Photo de profil :
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPhoto(e.target.files?.[0] || null)}
            />
          </label>
          <button type="submit">S'inscrire</button>
        </form>

        <p>
          Déjà inscrit ? <Link to="/login">Se connecter</Link>
        </p>
      </div>
    </div>
  );
};

export default Inscription;
