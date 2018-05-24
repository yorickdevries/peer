import { Router } from "express";
import assignments from "./assignments";
import courses from "./courses";
import groups from "./groups";
import reviews from "./reviews";
import rubrics from "./rubric";
import submissions from "./submissions";
import session from "express-session";
import { oidc } from "../express-oidc";

const router = Router();

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


// Only logged in users can access the API
router.use(function (req: any, res, next) {
    if (req.isAuthenticated()) {
        console.log(req.userinfo.given_name + " accesses the API");
        next();
    } else {
        next(new Error("Not Authenticated"));
    }
});

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
});

export default router;
