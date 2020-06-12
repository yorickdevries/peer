import express from "express";
require("express-async-errors");
import path from "path";
import cookieParser from "cookie-parser";
import api from "./old_api/routes/api";
import { errorLogger } from "./old_api/logger";
import helmet from "helmet";
import compression from "compression";

const app: express.Express = express();
app.use(helmet());
app.use(compression());
app.use(errorLogger);

const clientWebsite = path.join(__dirname, "../dist/public");
app.use(express.static(clientWebsite));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routing
app.use("/api", api);

// Send homepage
app.get("/*", (_, res) => {
    res.sendFile(path.join(clientWebsite, "index.html"));
});

// Error handler
app.use(function(err: any, _req: any, res: any, _next: any) {
    // Print error to the stderr
    console.error(`Error occured at ${new Date()}: ${err}`);

    // send generic 500 error response
    res.status(500);
    res.json({ error: "There is an error in your request" });
});

export default app;
