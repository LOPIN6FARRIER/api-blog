import app from "./app.js";
import dotenv from "dotenv";
import { logger } from "./shared/logger.utils.js";
import { validateEnvironment } from "./config/env.validator.js";
import {
  katax,
  RedisTransport,
  registerProjectInRedis,
  registerVersionToRedis,
  startHeartbeat,
} from "katax-service-manager";
import { createServer } from "http";

dotenv.config();

katax
  .init({
    logger: {
      level: katax.env("LOG_LEVEL", "info") as
        | "info"
        | "debug"
        | "warn"
        | "error",
      prettyPrint: katax.isDev,
      enableBroadcast: true,
    },
  })
  .then(async () => {
    const PORT = process.env.PORT || 3055;

    await katax.database({
      name: "main",
      type: "postgresql",
      connection: {
        host: katax.envRequired("DB_HOST"),
        port: parseInt(katax.env("DB_PORT", "5432")),
        database: katax.envRequired("DB_NAME"),
        user: katax.envRequired("DB_USER"),
        password: katax.envRequired("DB_PASSWORD"),
      },
    });

    const httpServer = createServer(app);

    let socket = await katax.socket({
      name: "main",
      httpServer,
      cors: { origin: "*" },
    });

    await katax.database({
      name: "cache",
      type: "redis",
      connection: process.env.REDIS_URL ?? {
        host: katax.env("REDIS_HOST", "127.0.0.1"),
        port: Number(katax.env("REDIS_PORT", "6379")),
        password: katax.env("REDIS_PASSWORD", ""),
        db: 0,
      },
    });
    try {
      const redisDb = katax.db("cache");
      // set a readable app name for logs
      katax.logger.setAppName("vinicioBlog");

      const redisTransport = new RedisTransport(redisDb, "katax:logs");
      // default: persist errors and forced persists
      redisTransport.filter = (log) =>
        (log as any).level === "error" || (log as any).persist === true;
      katax.logger.addTransport(redisTransport);

      // register project metadata for dashboards (index + hash)
      await registerProjectInRedis(redisDb, {
        app: katax.appName,
        version: katax.version,
        port: PORT,
        extra: {
          env: process.env.NODE_ENV ?? "unknown",
          url: katax.env(
            "PRODUCTION_URL",
            `https://api-blog.vinicioesparza.dev`,
          ),
        },
      });

      // register current version in events stream (one-off)
      await registerVersionToRedis(redisDb, {
        app: katax.appName,
        version: katax.version,
        port: PORT,
      });

      // start presence heartbeat (renews a TTL key)
      const hb = startHeartbeat(
        redisDb,
        {
          app: katax.appName,
          port: PORT,
          intervalMs: 10000,
          version: katax.version,
        },
        socket,
      );
      process.on("SIGTERM", async () => {
        hb.stop();
      });
    } catch (err) {
      katax.logger.warn({
        err,
        message: "Redis transport or helpers failed to initialize",
      });
    }

    httpServer.listen(PORT, () => {
      logger.info({ message: `Server running on http://localhost:${PORT}` });
      logger.info({
        message: `API endpoints available at http://localhost:${PORT}/api`,
      });
      logger.info({
        message: `Health check: http://localhost:${PORT}/api/health`,
      });
    });
  })
  .catch((error) => {
    logger.error({ message: "Failed to initialize Katax:", error });
    process.exit(1);
  });
