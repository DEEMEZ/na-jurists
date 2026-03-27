import http from "node:http";
import httpProxy from "http-proxy";

const PORT = 3000;
const WEBSITE_TARGET = "http://localhost:3001";
const PORTAL_TARGET = "http://localhost:5173";
const API_TARGET = "http://localhost:4000";

const websiteProxy = httpProxy.createProxyServer({
  target: WEBSITE_TARGET,
  changeOrigin: true,
  ws: true,
});

const portalProxy = httpProxy.createProxyServer({
  target: PORTAL_TARGET,
  changeOrigin: true,
  ws: true,
});

const apiProxy = httpProxy.createProxyServer({
  target: API_TARGET,
  changeOrigin: true,
  ws: true,
});

for (const proxy of [websiteProxy, portalProxy, apiProxy]) {
  proxy.on("error", (err, _req, res) => {
    if (!res || res.headersSent) return;
    res.writeHead(502, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "proxy_error", message: err.message }));
  });
}

function rewritePrefix(url, prefix) {
  const rewritten = url.replace(prefix, "");
  return rewritten === "" ? "/" : rewritten;
}

const server = http.createServer((req, res) => {
  const url = req.url ?? "/";

  if (url.startsWith("/api/portal")) {
    req.url = rewritePrefix(url, "/api/portal");
    apiProxy.web(req, res);
    return;
  }

  if (url.startsWith("/portal")) {
    portalProxy.web(req, res);
    return;
  }

  websiteProxy.web(req, res);
});

server.on("upgrade", (req, socket, head) => {
  const url = req.url ?? "/";

  if (url.startsWith("/portal")) {
    portalProxy.ws(req, socket, head);
    return;
  }

  if (url.startsWith("/api/portal")) {
    req.url = rewritePrefix(url, "/api/portal");
    apiProxy.ws(req, socket, head);
    return;
  }

  websiteProxy.ws(req, socket, head);
});

server.listen(PORT, () => {
  console.log(`[mono] proxy ready on http://localhost:${PORT}`);
  console.log(`[mono] website -> ${WEBSITE_TARGET}`);
  console.log(`[mono] portal  -> ${PORTAL_TARGET} (via /portal)`);
  console.log(`[mono] api     -> ${API_TARGET} (via /api/portal)`);
});
