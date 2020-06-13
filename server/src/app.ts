import express, { Request, Response, NextFunction } from "express";
// library to make sure async errors are handled
require("express-async-errors");
import path from "path";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import compression from "compression";

// old api (can later be deleted)
import api from "./old_api/routes/api";
// this is the new version of the API
import api2 from "./routes/api";

// instantiate the app
const app = express();

app.use(helmet());
app.use(compression());
//app.use(errorLogger);

const clientWebsite = path.join(__dirname, "../dist/public");
app.use(express.static(clientWebsite));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routing
// old api (can later be deleted)
app.use("/api", api);
// this is the new version of the API
app.use("/api2", api2);

// Send homepage index.html
app.get("/*", (_, res) => {
  res.sendFile(path.join(clientWebsite, "index.html"));
});

// Error handler
app.use(function (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  // Print error to the stderr
  console.error(`Error occured at ${new Date()}: ${err}`);
  // Send generic 500 error response
  res.sendStatus(500);
});

export default app;
