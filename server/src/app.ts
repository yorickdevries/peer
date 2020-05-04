import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import bodyParser from "body-parser";
import api from "./routes/api";

const app: express.Express = express();
const client_website = path.join(__dirname, "../dist/public");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(client_website));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

// Routing
app.use("/api", api);

app.get("/*", (req, res) => {
    res.sendFile(path.join(client_website, "index.html"));
});

export default app;
