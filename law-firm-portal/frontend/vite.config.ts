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
    if (!url || /localhost|127\.0\.0\.1/i.test(url)) {
      throw new Error(
        "Set VITE_API_URL in the Vercel project (Settings → Environment Variables) to your public HTTPS API origin, e.g. https://api.example.com — not localhost. Then redeploy.",
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
