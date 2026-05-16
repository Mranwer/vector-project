import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

import { setBaseUrl } from "@workspace/api-client-react";

// Fix: environment variable use karo
setBaseUrl(import.meta.env.VITE_API_URL || "http://localhost:5000");

createRoot(document.getElementById("root")!).render(<App />);
console.log("API URL:", import.meta.env.VITE_API_URL);