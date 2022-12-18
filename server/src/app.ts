import express, { Request, Response, NextFunction } from "express";
// library to make sure async errors are handled
require("express-async-errors");
import path from "path";
import config from "config";
import * as Sentry from "@sentry/node";
import * as Tracing from "@sentry/tracing";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import compression from "compression";
import HttpStatusCode from "./enum/HttpStatusCode";

import api from "./routes/api";
import ResponseMessage from "./enum/ResponseMessage";

// instantiate the app
const app = express();

if (config.has("sentryDSN")) {
  Sentry.init({
    release: process.env.SENTRY_RELEASE,
    dsn: config.get("sentryDSN"),
    integrations: [
      // enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
      // enable Express.js middleware tracing
      new Tracing.Integrations.Express({ app }),
    ],

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
  });

  // RequestHandler creates a separate execution context using domains, so that every
  // transaction/span/breadcrumb is attached to its own Hub instance
  app.use(
    Sentry.Handlers.requestHandler({
      user: ["id", "netid", "email"],
    })
  );
  // TracingHandler creates a trace for every incoming request
  app.use(Sentry.Handlers.tracingHandler());
}

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        "connect-src": [
          "'self'",
          "https://*.adobe.com",
          "https://*.adobe.io",
          "*.typekit.com",
          "*.typekit.net",
        ],
        "script-src": [
          "'self'",
          "'unsafe-eval'",
          "https://documentservices.adobe.com",
        ],
        "frame-src": ["'self'", "https://documentservices.adobe.com"],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);
app.use(compression());

const clientWebsite = path.resolve(__dirname, "../dist/public");
app.use(express.static(clientWebsite));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routing
app.use("/api", api);

// Send homepage index.html
const clientIndex = path.resolve(clientWebsite, "index.html");
app.get("/*", (_req, res) => {
  res.sendFile(clientIndex);
});
if (config.has("sentryDSN")) {
  //Sentry error handler
  app.use(Sentry.Handlers.errorHandler());
}
// Error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  // Print error to the stderr
  const errorString = String(error);
  console.error(`Error occured at ${new Date()}: ${errorString}`);

  // Send generic 500 error response
  if (!res.headersSent) {
    res.status(HttpStatusCode.INTERNAL_SERVER_ERROR);
    if (process.env.NODE_ENV === "production") {
      res.send(ResponseMessage.INTERNAL_SERVER_ERROR);
    } else {
      // Send error to frontend if not in production
      res.send(errorString);
      throw error;
    }
  }
});

export default app;
