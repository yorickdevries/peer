import fs from "fs-extra";
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
import sessionFileStore from "session-file-store";
import passport from "passport";
import config from "../config";
import passportConfiguration from "../passport";
import mockPassportConfiguration from "../passport_mock";
import logger from "morgan";

const router = express();
// Add logger for all API
logger.token("netid", function(req, res) {
    if (req.user != undefined) {
        return req.user.netid;
    } else {
        return undefined;
    }
});
// slightly formatted common string
router.use(logger("(:netid) - :remote-addr - :remote-user [:date[clf]] \":method :url HTTP/:http-version\" :status :res[content-length]"));

// session support is required to use Passport
const fileStore = sessionFileStore(session);
// needs a random secret
const sessionConfig: any = {
    cookie: {maxAge: config.session.maxAge},
    resave: true,
    saveUninitialized: true,
    secret: config.session.secret
  };
// Depending of current mode, setup the session store
if (process.env.NODE_ENV === "production") {
    sessionConfig.store = new fileStore();
}
router.use(session(sessionConfig));

// initialize passport middleware
router.use(passport.initialize());
router.use(passport.session());

// Depending of current mode, setup the login method
if (process.env.NODE_ENV === "production" ) {
    passportConfiguration(passport);
  } else {
    router.get("/mocklogin/:netid/:affiliation",
    function(req, res, next) {
        console.log("Mocked login: " + req.params.netid + ", " + req.params.affiliation);
        // make Mocked passport configuration
        mockPassportConfiguration(passport, req.params.netid, req.params.affiliation);
        next();
    },
    passport.authenticate("mock"),
    function(req, res, next) {
        res.redirect("/");
    });
}

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
  }), function(req, res) {
    res.redirect("/");
    }
);

// Route to logout.
router.get("/logout", function(req, res) {
    req.logout();
    // TODO: invalidate session on IP
    res.redirect("/");
});

// Retrieve SP metadata
router.get("/metadata.xml", async function(req, res) {
  const file = await fs.readFile("./SP_Metadata.xml");
  res.type("application/xml");
  res.send(file);
});

// This route checks the user and updates it in the database
router.use(async function(req: any, res, next) {
    const userinfo = req.user;
    // check whether userinfo exists
    if (userinfo == undefined || userinfo.netid == undefined) {
        // no user logged in
        next();
    } else {
        // get userinfo
        const netid = userinfo.netid;
        const studentNumber = userinfo.studentNumber;
        const firstName = userinfo.firstName;
        const prefix = userinfo.prefix;
        const lastName = userinfo.lastName;
        const email = userinfo.email;
        const affiliation = userinfo.affiliation;
        const displayName = userinfo.displayName;
        const study = userinfo.study;
        const organisationUnit = userinfo.organisationUnit;
        try {
            // check whether user is in the database
            const userExists: any = await UserPS.executeExistsUserById(netid);
            // in case the user is not in the database
            if (!userExists.exists) {
                // Adding user
                await UserPS.executeAddUser(netid, studentNumber, firstName, prefix, lastName, email, affiliation, displayName, study, organisationUnit);
            } else {
                // Updating userinfo
                await UserPS.executeUpdateUser(netid, studentNumber, firstName, prefix, lastName, email, affiliation, displayName, study, organisationUnit);
            }
            next();
        } catch (err) {
            next(err);
        }
    }
});

// Authentication route
router.get("/authenticated", function(req: any, res) {
    res.json({ authenticated: req.isAuthenticated() });
});

// Check always whether someone is logged in
router.use(security.authorization.authorizeCheck);

// Routing
router.use("/assignments", assignments);
router.use("/courses", courses);
router.use("/groups", groups);
router.use("/reviews", reviews);
router.use("/rubric", rubrics);
router.use("/submissions", submissions);

// Route to get the userinfo
router.get("/user", function(req: any, res, next) {
    res.json({
        user: req.user
    });
});

// If no other routes apply, send a 404
router.use(function(req, res) {
    res.sendStatus(404);
});

export default router;
