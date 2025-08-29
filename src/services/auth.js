import { jwtDecode } from "jwt-decode";

// 🔒 Récupère le token depuis le localStorage
export function getToken() {
  return localStorage.getItem("token");
}

// ✅ Décode le token JWT
export function getDecodedToken() {
  const token = getToken();
  if (!token) return null;

  try {
    return jwtDecode(token);
  } catch (e) {
    console.error("❌ Token invalide ou corrompu :", e.message);
    return null;
  }
}

// ✅ Récupère tous les rôles, compatible avec plusieurs formats
export function getUserRoles() {
  const decoded = getDecodedToken();

  // 🔁 Compatibilité standard et ASP.NET claims
  const roles =
    decoded?.role || decoded?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

  return Array.isArray(roles) ? roles : roles ? [roles] : [];
}

// ✅ Récupère le premier rôle (utile pour affichage ou redirection)
export function getUserRole() {
  const roles = getUserRoles();
  return roles.length > 0 ? roles[0] : null;
}

// ✅ Vérifie si un utilisateur est connecté
export function isAuthenticated() {
  const token = getToken();
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);
    const exp = decoded.exp;
    const now = Date.now() / 1000;

    // 🔐 Check expiration
    return exp > now;
  } catch (e) {
    return false;
  }
}

// ✅ Déconnexion
export function logout() {
  localStorage.removeItem("token");
}
