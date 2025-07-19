import React from "react";
import { createRoot } from "react-dom/client";

import "./application.css";
import { FlatApplication } from "./components/app/flatApplication";

createRoot(document.getElementById("app")!).render(<FlatApplication />);
