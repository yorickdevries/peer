import express from "express";
import assignments from "./assignments";
import courses from "./courses";
import groups from "./groups";
import reviews from "./reviews";
import rubrics from "./rubric";
import submissions from "./submissions";
import session from "express-session";
import { oidc } from "../express-oidc";
import security from "../security";

const router = express();

// Okta login
// session support is required to use ExpressOIDC
// needs a random secret
router.use(session({
    secret: "add something random here",
    resave: true,
    saveUninitialized: false
  }));

// Login/login-redirect route from OIDC
router.use(oidc.router);

router.get("/logout", (req: any, res) => {
    req.logout();
    res.redirect("/");
});

// Authentication route
router.get("/authenticated", function (req: any, res) {
    res.json({ authenticated: req.isAuthenticated() });
});

router.use("*", security.authorization.authorizeCheck);

// Routing
router.use("/assignments", assignments);
router.use("/courses", courses);
router.use("/groups", groups);
router.use("/reviews", reviews);
router.use("/rubric", rubrics);
router.use("/submissions", submissions);

router.get("/user", function (req: any, res, next) {
    res.json({
        user: req.userinfo
    });

// error handler
router.use(function (err: any, req: any, res: any, next: any) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};
    // Print error to console
    console.log("Error: " + err.message);

    // render the error page
    res.status(err.status || 500);
    res.json({ error: "There is an error in your API request" });
  });

});

export default router;
