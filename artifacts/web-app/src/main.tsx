import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setBaseUrl, setAuthTokenGetter } from "@workspace/api-client-react";

setBaseUrl(import.meta.env.VITE_API_URL || "http://localhost:5000");
setAuthTokenGetter(() => localStorage.getItem('vtds_token'));

createRoot(document.getElementById("root")!).render(<App />);