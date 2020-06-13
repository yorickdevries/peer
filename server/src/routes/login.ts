import { Router } from "express";
import passport from "passport";
import path from "path";
import config from "config";
import session from "../middleware/login/session";
import passportConfiguration from "../middleware/login/passport";
import mockPassportConfiguration from "../middleware/login/passport_mock";

// Adds login routes
const loginRoutes = function (router: Router): void {
  // setup sessions for login
  router.use(session);
  // initialize passport middleware
  router.use(passport.initialize());
  router.use(passport.session());

  // Depending of current mode, setup the login method
  if (process.env.NODE_ENV === "production") {
    // Initialize TU Delft passport
    passportConfiguration(passport);

    const url: string = config.get("url");
    // Login route
    router.get(
      "/login",
      passport.authenticate("saml", {
        successRedirect: url,
        failureRedirect: "/login",
      })
    );

    // Callback of the login route
    router.post(
      "/login/callback",
      passport.authenticate("saml", {
        failureRedirect: "/",
        failureFlash: true,
      }),
      (_req, res) => {
        // TODO: ADD HERE SAVING OF USERINFO
        res.redirect("/");
      }
    );
  } else {
    // Mock Login form
    router.get("/login", (_req, res) => {
      res.sendFile(path.resolve("./mocklogin.html"));
    });

    // Mock login route
    router.post(
      "/mocklogin",
      (req, _res, next) => {
        const netid = req.body.netid;
        const affiliation = req.body.affiliation;
        console.log(`Mocklogin: ${netid}, ${affiliation}`);
        // make Mocked passport configuration
        mockPassportConfiguration(passport, netid, affiliation);
        next();
      },
      passport.authenticate("mock"),
      (_req, res) => {
        // TODO: ADD HERE SAVING OF USERINFO
        res.redirect("/");
      }
    );
  }
  // Route to logout.
  router.get("/logout", (req, res) => {
    req.logout();
    // TODO: invalidate session on IP
    res.redirect("/");
  });

  // Retrieve SP metadata (Only works in production)
  router.get("/metadata.xml", async (_, res) => {
    res.sendFile("./SP_Metadata.xml");
  });
};

export default loginRoutes;
