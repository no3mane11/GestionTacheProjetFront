import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import "bootstrap/dist/css/bootstrap.min.css";
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 4000,
        style: {
          fontSize: "0.95rem",
          padding: "12px 16px",
          borderRadius: "8px",
          background: "#fff",
          color: "#333",
          boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
        },
      }}
    />
  </StrictMode>
);
