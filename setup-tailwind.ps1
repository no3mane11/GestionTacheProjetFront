# ----------------------------------------------
# Script PowerShell: setup-tailwind.ps1
# Installe Tailwind CSS dans un projet React + Vite
# ----------------------------------------------

Write-Host "📦 Suppression des anciens fichiers..."
if (Test-Path "node_modules") {
    Remove-Item -Recurse -Force node_modules
}
if (Test-Path "package-lock.json") {
    Remove-Item -Force package-lock.json
}

Write-Host "🧩 Réinstallation des dépendances..."
npm install

Write-Host "🎨 Installation de TailwindCSS et plugins..."
npm install -D tailwindcss postcss autoprefixer

Write-Host "⚙️ Génération des fichiers tailwind.config.js et postcss.config.js..."
npx.cmd tailwindcss init -p

Write-Host "Installation terminee avec succes."
