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
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  // Print error to the stderr
  console.error(`Error occured at ${new Date()}: ${err}`);
  // Send generic 500 error response
  res
    .status(HttpStatusCode.INTERNAL_SERVER_ERROR)
    .send("Internal server error, please contact the system administrator");
});

export default app;
