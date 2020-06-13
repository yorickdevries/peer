import { Router } from "express";
import passport from "passport";
import fs from "fs-extra";
import path from "path";
import session from "../middleware/login/session";
import passportConfiguration from "../middleware/login/passport";
import mockPassportConfiguration from "../middleware/login/passport_mock";

// Adds login routes
const loginRoutes = (router: Router) => {
  // setup sessions for login
  router.use(session);
  // initialize passport middleware
  router.use(passport.initialize());
  router.use(passport.session());

  // Depending of current mode, setup the login method
  if (process.env.NODE_ENV === "production") {
    // Initialize TU Delft passport
    passportConfiguration(passport);

    // Login route
    router.get(
      "/login",
      passport.authenticate("saml", {
        successRedirect: "https://peer.ewi.tudelft.nl/",
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
  // TODO: catch error if await fails
  router.get("/metadata.xml", async (_, res) => {
    const file = await fs.readFile("./SP_Metadata.xml");
    res.type("application/xml");
    res.send(file);
  });
};

export default loginRoutes;
