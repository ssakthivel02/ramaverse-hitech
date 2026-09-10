import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { assertActiveCorpus } from "../corpusRuntime";
import { getDb } from "../db";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, "0.0.0.0", () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) return port;
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

function releaseIdentity() {
  const commit = process.env.RENDER_GIT_COMMIT?.trim() || process.env.GIT_COMMIT?.trim() || "unknown";
  const repository = process.env.RENDER_GIT_REPO_SLUG?.trim() || process.env.GIT_REPOSITORY?.trim() || "unknown";
  return {
    service: "ramaverse",
    environment: process.env.NODE_ENV || "unknown",
    repository,
    commit,
    exactCommitKnown: commit !== "unknown",
    exactRepositoryKnown: repository !== "unknown",
  };
}

function isOperationalPath(path: string) {
  return path === "/healthz" || path === "/readyz" || path === "/releasez" || path.startsWith("/ops/");
}

async function startServer() {
  const activeCorpus = await assertActiveCorpus();
  console.log(`[Corpus] Active ${activeCorpus.pointer.activeCorpusVersion} (${activeCorpus.pointer.canonicalCount} records)`);
  const app = express();
  app.disable("x-powered-by");
  const server = createServer(app);
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Baseline hardening: no user content is logged or exposed by these surfaces.
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Permissions-Policy", "camera=(), geolocation=(), payment=(), usb=()");
    if (process.env.NODE_ENV === "production") {
      res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    }
    res.setHeader("Content-Security-Policy-Report-Only", "default-src 'self'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; script-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self' https:; frame-ancestors 'self'");
    if (req.path.startsWith("/api/") || req.path.startsWith("/reconciliation") || req.path.toLowerCase().includes("staging") || req.path.startsWith("/__manus__") || isOperationalPath(req.path)) {
      res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
    }
    if (isOperationalPath(req.path)) {
      res.setHeader("Cache-Control", "no-store, max-age=0");
      res.setHeader("Pragma", "no-cache");
    }
    next();
  });

  app.get("/healthz", (_req, res) => {
    res.status(200).json({ status: "alive", service: "ramaverse", environment: process.env.NODE_ENV || "unknown" });
  });

  app.get("/releasez", (_req, res) => res.status(200).json(releaseIdentity()));

  app.get("/readyz", async (_req, res) => {
    try {
      const [active, db] = await Promise.all([assertActiveCorpus(), getDb()]);
      const databaseReady = Boolean(db);
      const ready = databaseReady;
      res.status(ready ? 200 : 503).json({
        status: ready ? "ready" : "not_ready",
        service: "ramaverse",
        dependencies: {
          canonicalCorpus: "available",
          database: databaseReady ? "configured" : "unavailable",
        },
        activeCorpusVersion: active.pointer.activeCorpusVersion,
        canonicalCount: active.pointer.canonicalCount,
        pwaVersion: "ramaverse-cache-v6",
      });
    } catch {
      res.status(503).json({ status: "not_ready", service: "ramaverse", reason: "active_corpus_unavailable" });
    }
  });

  app.get("/ops/health", async (_req, res) => {
    try {
      const active = await assertActiveCorpus();
      const db = await getDb();
      const databaseReady = Boolean(db);
      res.status(databaseReady ? 200 : 503).json({ ok: databaseReady, deployment: process.env.NODE_ENV || "unknown", activeCorpusVersion: active.pointer.activeCorpusVersion, canonicalCount: active.pointer.canonicalCount, database: databaseReady ? "configured" : "unavailable", pwaVersion: "ramaverse-cache-v6" });
    } catch {
      res.status(503).json({ ok: false, reason: "active_corpus_unavailable" });
    }
  });

  app.get("/ops/release-state", async (_req, res) => {
    try {
      const active = await assertActiveCorpus();
      res.json({ deployment: process.env.NODE_ENV || "unknown", corpus: { version: active.pointer.activeCorpusVersion, canonicalCount: active.pointer.canonicalCount }, stagingPublished: 0, pwaVersion: "ramaverse-cache-v6", userQuestionLogging: "disabled", release: releaseIdentity() });
    } catch {
      res.status(503).json({ ok: false, reason: "release_state_unavailable" });
    }
  });

  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );

  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000", 10);
  const port = await findAvailablePort(preferredPort);
  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }
  server.listen(port, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${port}/`);
  });
}

startServer().catch(console.error);
