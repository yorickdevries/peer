import fs from "fs";
import express from "express";
import assignments from "./assignments";
import courses from "./courses";
import groups from "./groups";
import reviews from "./reviews";
import rubrics from "./rubric";
import submissions from "./submissions";
import security from "../security";
import UserPS from "../prepared_statements/user_ps";
import session from "express-session";
import passport from "passport";
import config from "../config";
import passportConfiguration from "../passport";

// configure passport
if (config.delftSSO) {
    // Enables TUDelft SSO when set in config file
    passportConfiguration(passport);
}

const router = express();
// session support is required to use Passport
// needs a random secret
router.use(session({
    resave: true,
    saveUninitialized: true,
    secret: config.session.secret
  }));

router.use(passport.initialize());
router.use(passport.session());

// Login route
router.get("/login", passport.authenticate("saml",
  {
    successRedirect: "https://peer.ewi.tudelft.nl/",
    failureRedirect: "/login"
  })
);

// Callback of the login route
router.post("/login/callback", passport.authenticate("saml",
  {
    failureRedirect: "/",
    failureFlash: true
  }), function (req, res) {
    res.redirect("/");
    }
);

// Route to logout.
router.get("/logout", function (req, res) {
    req.logout();
    // TODO: invalidate session on IP
    res.redirect("/");
});

// Retrieve SP metadata
router.get("/metadata.xml", function(req, res) {
  res.type("application/xml");
  res.send(fs.readFileSync("./SP_Metadata.xml"));
});

// This route checks the user and updates it in the database
router.use("*", async function(req: any, res, next) {
    const userinfo = req.user;
    // check whether userinfo exists
    if (userinfo == undefined || userinfo.netid == undefined) {
        // no user logged in
        next();
    } else {
        // get userinfo
        const netid = userinfo.netid.toLowerCase();
        const email = userinfo.email;
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

// Authentication route
router.get("/authenticated", function (req: any, res) {
    res.json({ authenticated: req.isAuthenticated() });
});

// Check always whether someone is logged in
router.use("*", security.authorization.authorizeCheck);

// Routing
router.use("/assignments", assignments);
router.use("/courses", courses);
router.use("/groups", groups);
router.use("/reviews", reviews);
router.use("/rubric", rubrics);
router.use("/submissions", submissions);

// Route to get the userinfo
router.get("/user", function (req: any, res, next) {
    res.json({
        user: req.user
    });

// Error handler
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
