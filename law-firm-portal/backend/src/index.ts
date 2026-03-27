import "dotenv/config";
import { getEnv } from "./config/env.js";
import { createApp } from "./app.js";
import { startScheduler } from "./lib/scheduler.js";
import { ensureUploadDir } from "./lib/uploadMulter.js";

const env = getEnv();
ensureUploadDir();
const app = createApp(env);
startScheduler(env);

app.listen(env.PORT, () => {
  console.log(
    `[law-firm-portal-api] listening on http://localhost:${env.PORT} (CORS: ${env.FRONTEND_ORIGIN})`,
  );
});
