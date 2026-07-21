import { createRoot } from "react-dom/client";
import { Calculator } from "@/components/calculator/calculator";
import "./index.css";

createRoot(document.getElementById("root")!).render(<Calculator />);
