import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import api from "./routes/api";
import logger from "morgan";
import helmet from "helmet";

const app: express.Express = express();
app.use(helmet());

// Add logger for errors
logger.token("netid", function(req, res) {
    if (req.user !== undefined) {
        return req.user.netid;
    } else {
        return undefined;
    }
});
// slightly formatted common string
app.use(logger("(:netid) - :remote-addr - :remote-user [:date[clf]] \":method :url HTTP/:http-version\" :status :res[content-length]",
    {
    skip: function (req, res) { return res.statusCode < 400; },
    stream: process.stderr
  }
));

const clientWebsite = path.join(__dirname, "../dist/public");

app.use(express.static(clientWebsite));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routing
app.use("/api", api);

// Send homepage
app.get("/*", (req, res) => {
    res.sendFile(path.join(clientWebsite, "index.html"));
});

// Error handler
app.use(function(err: any, req: any, res: any, next: any) {
    // Print error to the stderr
    console.error("Error: " + err);

    // send generic 500 error response
    res.status(500);
    res.json({ error: "There is an error in your request" });
});

export default app;
