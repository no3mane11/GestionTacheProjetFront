GestionTache – Frontend (React + Vite)

Application web de gestion de projets et de tâches : administration (projets, tâches, affectations, collaborateurs), dashboard et espace collaborateur, plus un assistant IA (Mistral via Ollama) pour la génération des tâches urgentes, la prédiction des fins de projet et l’analyse des performances.

Backend associé : API ASP.NET Core + EF Core (repo séparé).

🚀 Fonctionnalités

Authentification JWT (login / inscription)

Modules d’administration : Collaborateurs, Projets, Tâches, Affectations

Dashboard global et Espace collaborateur (tâches urgentes calculées)

Assistant IA (prompts libres, prédiction fin projet, analyse performance)

Tables avancées (Material React Table) : tri / filtre / pagination / cacher colonnes

Mode sombre

Exports de résultats IA (texte & PDF)

🧱 Stack technique

React + Vite

MUI (Material UI) + Material React Table

Axios (intercepteurs JWT)

React Router

Tailwind CSS (présent si configuré : tailwind.config.js, postcss.config.js)

📁 Structure (indicative)
frontend-gestion-taches/
├─ public/
├─ src/
│  ├─ assets/
│  ├─ components/
│  ├─ pages/              # Login, Inscription, Accueil, Assistant IA, etc.
│  ├─ services/           # axios.ts (intercepteur JWT, baseURL)
│  ├─ types/
│  ├─ index.css
│  ├─ main.(ts|jsx)
│  └─ App.(ts|jsx)
├─ .gitignore
├─ package.json
├─ vite.config.(ts|js)
└─ (tailwind.config.js / postcss.config.js si utilisés)

✅ Prérequis

Node.js ≥ 18 (recommandé)

npm (ou pnpm / yarn si tu préfères)

API backend ASP.NET Core disponible (dev : http://localhost:5000 par ex.)

🔧 Configuration (env)

Crée un fichier .env.local à la racine du frontend :

# URL de l'API backend
VITE_API_BASE_URL=http://localhost:5000/api

# (optionnel) URL serveur IA (Ollama / passerelle)
VITE_AI_API_URL=http://localhost:11434

# (optionnel) Nom d’appli, flags de build, etc.
VITE_APP_NAME=GestionTaches


Les variables VITE_* sont injectées côté front par Vite.

Dans src/services/axios.ts (ou équivalent), assure-toi d’utiliser cette variable :

import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

// Intercepteur JWT
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem("authToken");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

▶️ Démarrage (dev)
# 1) Installer les dépendances
npm ci       # (ou: npm install)

# 2) Lancer le serveur de dev
npm run dev  # Vite démarre (par défaut http://localhost:5173)

🏗️ Build & Preview
npm run build    # build de prod (dist/)
npm run preview  # prévisualiser le build localement

🧹 Qualité (selon scripts disponibles)
npm run lint      # ESLint
npm run format    # Prettier (si script)

🔒 Sécurité & bonnes pratiques

Ne jamais committer node_modules/ ni des secrets → déjà géré dans .gitignore.

Conserver JWT le temps du stage dans localStorage si c’est ce que fait l’app, mais en production privilégier un cookie httpOnly.

Paramétrer CORS côté API pour http://localhost:5173 en dev.

📡 Connexion au backend

L’API doit être lancée (dev : http://localhost:5000).

Vérifie que VITE_API_BASE_URL pointe vers /api.

Si tu vois des 401/403 : ton token est absent/expiré → reconnecte-toi.

Si tu as des erreurs CORS : ajuste la politique CORS côté API ASP.NET Core.

🧪 Scénarios clés à tester

Login / Inscription → obtention d’un JWT → navigation vers l’accueil

CRUD Collaborateurs/Projets/Tâches/Affectations

Dashboard (admin & collaborateur)

Assistant IA : prompt libre, tâches urgentes, prédiction fin projet, analyse perf

Mode sombre + filtres/tri + cacher colonnes (MRT)

Exports (texte / PDF)

📦 Déploiement (pistes)

Build statique avec Vite → servir le contenu de dist/ derrière Nginx / S3+CloudFront / GitHub Pages.

En prod, régler VITE_API_BASE_URL vers le domaine de l’API publique.

🐞 Dépannage rapide

Écran blanc après login → vérifier baseURL et intercepteur Axios.

CORS en dev → mettre à jour la policy CORS côté API (http://localhost:5173).

.env non pris en compte → relancer npm run dev après modification.

📜 Licence

Projet académique – usage pédagogique.

👤 Crédits

Réalisation : Nouaman Haimoudi

Encadrement entreprise : KBM Consulting – Saad Chahi

Backend : ASP.NET Core + EF Core (repo séparé)
