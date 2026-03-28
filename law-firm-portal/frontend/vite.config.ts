import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ command, mode }) => {
  // On Vercel, a missing VITE_API_URL silently bakes in localhost → "Failed to fetch" in production.
  if (
    command === "build" &&
    mode === "production" &&
    Boolean(process.env.VERCEL)
  ) {
    const url = process.env.VITE_API_URL?.trim() ?? "";
    // Missing → still allow build (e.g. first deploy); login will fail until env is set + redeploy.
    if (!url) {
      console.warn(
        "\n[law-firm-portal] VITE_API_URL is unset. Set it in Vercel (Production + Preview) to your public API HTTPS origin, then redeploy — otherwise the app will call localhost:4000.\n",
      );
    } else if (/localhost|127\.0\.0\.1/i.test(url)) {
      throw new Error(
        "VITE_API_URL cannot be localhost on Vercel. Use your deployed API HTTPS URL.",
      );
    }
  }

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 5173,
    },
  };
});
