import createError from "http-errors";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";

import session from "express-session";
import { oidc } from "./express-oidc";

import api from "./routes/api";
const app: express.Express = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "./public")));

// OKTA login - session support is required to use Express OIDC
app.use(session({
  secret: "add something random here",
  resave: true,
  saveUninitialized: false
}));

// Login/login-redirect route from OIDC
app.use(oidc.router);

// Authentication route
app.get("/api/authenticated", function (req: any, res) {
    res.json({ authenticated: req.isAuthenticated() });
});

app.get("/api/logout", (req: any, res) => {
  req.logout();
  res.redirect("/");
});

app.use("/api", api);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err: any, req: any, res: any, next: any) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  // Print error to console
  console.log("Error: " + err.message);

  // render the error page
  res.status(err.status || 500);
  res.json({ error: "error" });
});

export default app;
