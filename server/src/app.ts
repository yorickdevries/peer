import createError from "http-errors";
import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
// Okta-login
import session from "express-session";
import { oidc } from "./express-oidc";

import api from "./routes/api";

const app: express.Express = express();

// Okta login
// session support is required to use ExpressOIDC
// needs a random secret
app.use(session({
  secret: "add something random here",
  resave: true,
  saveUninitialized: false
}));
// ExpressOIDC will attach handlers for the /login and /authorization-code/callback routes
app.use(oidc.router);

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "./public")));

// sample method to trigger login
app.get("/loginpage", (req: any, res) => {
  if (req.isAuthenticated()) {
    console.log(req.userinfo);
    res.send(`Hello ${req.userinfo.name}! <a href="logout">Logout</a>`);
  } else {
    res.send('Please <a href="/login">login</a>');
  }
});

// logout route
app.get("/logout", (req: any, res) => {
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
  res.json( { error: "error"} ) ;
});

export default app;
