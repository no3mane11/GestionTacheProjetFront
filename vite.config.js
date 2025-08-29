import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    // 👇 nécessaire pour que toutes les routes (comme /taches, /projets) fonctionnent en mode SPA
    historyApiFallback: true,
  },
  
});
