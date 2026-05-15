import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

import { setBaseUrl } from "@workspace/api-client-react";

// IMPORTANT: backend URL set karo
setBaseUrl("http://localhost:5000");

createRoot(document.getElementById("root")!).render(<App />);