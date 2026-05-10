import path from "node:path";
import { fileURLToPath } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ command, mode }) => {
  const fileEnv = loadEnv(mode, __dirname, "VITE");
  const supabaseUrl =
    (fileEnv.VITE_SUPABASE_URL ?? process.env.VITE_SUPABASE_URL)?.trim() ?? "";
  const supabaseAnon =
    (fileEnv.VITE_SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY)?.trim() ??
    "";
  /** Next.js `npm run dev` URL when portal runs on Vite (default port 3000; use 3001 if 3000 is taken). */
  const nextDevOrigin =
    (fileEnv.VITE_NEXT_DEV_ORIGIN ?? process.env.VITE_NEXT_DEV_ORIGIN)?.trim() ||
    "http://127.0.0.1:3000";

  if (
    command === "build" &&
    mode === "production" &&
    Boolean(process.env.VERCEL)
  ) {
    if (!supabaseUrl || !supabaseAnon) {
      console.warn(
        "\n[law-firm-portal] Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in frontend/.env.production for production builds.\n",
      );
    }
  }

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
        "@site/constants": path.resolve(__dirname, "../../src/constants"),
        "@site/lib": path.resolve(__dirname, "../../src/lib"),
      },
    },
    server: {
      port: 5173,
      // Forward any `/api/*` to Next so `fetch("/api/reported-judgments")` from the portal gets JSON, not Vite's index.html.
      proxy: {
        "/api": {
          target: nextDevOrigin,
          changeOrigin: true,
        },
      },
    },
  };
});
