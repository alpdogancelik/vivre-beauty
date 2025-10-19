import React from "react";
import { createRoot } from "react-dom/client";

import "./index.css"; // Tailwind directifleri
import App from "./App.jsx";

const root = createRoot(document.getElementById("root"));

// Nude tema işaretleyicisi (stil dosyasında kullanmak için)
document.documentElement.classList.add("theme-nude");

root.render(
  // <React.StrictMode>
  <App />
  // </React.StrictMode>
);
