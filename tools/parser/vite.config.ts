import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite dev-server proxies `/ollama/*` to a local Ollama instance so the
// browser doesn't hit CORS. Ollama's HTTP API ignores CORS by default;
// rather than ask the user to set OLLAMA_ORIGINS, we just proxy.
export default defineConfig({
  server: {
    proxy: {
      "/ollama": {
        target: "http://localhost:11434",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/ollama/, ""),
      },
    },
  },
  plugins: [react()],
});
