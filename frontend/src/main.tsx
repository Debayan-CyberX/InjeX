import { createRoot } from "react-dom/client";
import App from "./App";
import { VisualSystem } from "./components/visuals/VisualSystem";
import "./fonts.css";
import "./void.css";
import "./void-research.css";
import "./void-responsive.css";
import "./silver-glass.css";
createRoot(document.getElementById("root")!).render(
  <VisualSystem>
    <App />
  </VisualSystem>,
);
