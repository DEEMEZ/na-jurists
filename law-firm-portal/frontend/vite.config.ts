import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ command, mode }) => {
  // Vite loads .env.* after config is evaluated; use loadEnv so checks see frontend/.env.production.
  const fileEnv = loadEnv(mode, __dirname, "VITE");
  const viteApiUrl =
    (fileEnv.VITE_API_URL ?? process.env.VITE_API_URL)?.trim() ?? "";

  if (
    command === "build" &&
    mode === "production" &&
    Boolean(process.env.VERCEL)
  ) {
    if (!viteApiUrl) {
      console.warn(
        "\n[law-firm-portal] VITE_API_URL is unset. Set frontend/.env.production (committed) to your public API HTTPS origin.\n",
      );
    } else if (/localhost|127\.0\.0\.1/i.test(viteApiUrl)) {
      throw new Error(
        "VITE_API_URL cannot be localhost on Vercel. Edit frontend/.env.production to your deployed API HTTPS URL.",
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
