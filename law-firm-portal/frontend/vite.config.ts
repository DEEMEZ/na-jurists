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
      },
    },
    server: {
      port: 5173,
    },
  };
});
