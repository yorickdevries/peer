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
import UserPS from "../prepared_statements/user_ps";

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

// This route checks the user and updates it in the database
router.use("*", async function(req: any, res, next) {
    const userinfo = req.userinfo;
    // check whether userinfo exists
    if (userinfo == undefined || userinfo.given_name == undefined) {
        // no user logged in
        next();
    } else {
        // get userinfo
        const netid = userinfo.given_name.toLowerCase();
        const email = userinfo.preferred_username;
        try {
            // check whether user is in the database
            const userExists: any = await UserPS.executeExistsUserById(netid);
            // in case the user is not in the database
            if (!userExists.exists) {
                // Adding user
                await UserPS.executeAddUser(netid, email);
            } else {
                const user: any = await UserPS.executeGetUserById(netid);
                // in case the new email is not undefined
                // or different from what's in the database
                if (email !== undefined && user.email !== email) {
                    // Updating user email
                    await UserPS.executeUpdateEmailUser(netid, email);
                }
            }
            next();
        } catch (err) {
            next(err);
        }
    }
});

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
