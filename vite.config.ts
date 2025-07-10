import { defineConfig } from "vite";
import { tanstackRouter } from "@tanstack/router-vite-plugin";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react(), tanstackRouter()],
  base: "/phase-out-village",
});
