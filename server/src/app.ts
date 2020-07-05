import express, { Request, Response, NextFunction } from "express";
// library to make sure async errors are handled
require("express-async-errors");
import path from "path";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import compression from "compression";
import { errorLogger } from "./middleware/logger";
import HttpStatusCode from "./enum/HttpStatusCode";

import api from "./routes/api";
import ResponseMessage from "./enum/ResponseMessage";

// instantiate the app
const app = express();

app.use(helmet());
app.use(compression());
app.use(errorLogger);

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

// Error handler
app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  // Print error to the stderr
  const errorString = String(error);
  console.error(`Error occured at ${new Date()}: ${errorString}`);

  // Send generic 500 error response
  res.status(HttpStatusCode.INTERNAL_SERVER_ERROR);
  if (process.env.NODE_ENV === "production") {
    res.send(ResponseMessage.INTERNAL_SERVER_ERROR);
  } else {
    // Send error to frontend if not in production
    res.send(errorString);
    throw error;
  }
});

export default app;
