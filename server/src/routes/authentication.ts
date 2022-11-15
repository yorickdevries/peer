import { Router } from "express";
import config from "config";
import passport from "passport";
import passportConfiguration from "../middleware/authentication/passportTUDelft";
import path from "path";
import session from "../middleware/authentication/session";

// Adds authentication routes
const authenticationRoutes = function (router: Router): void {
  // setup sessions for login
  router.use(session);
  // initialize passport middleware
  router.use(passport.initialize());
  router.use(passport.session());

  // Depending of current mode, setup the login method
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
      res.redirect("/");
    }
  );

  // Retrieve SP metadata (Only works in production)
  const metadataPath = path.resolve(
    config.get("ServiceProviderMetadataFile")
  );
  router.get("/metadata.xml", async (_, res) => {
    res.sendFile(metadataPath);
  });

  // Route to logout.
  router.get("/logout", (req, res) => {
    req.logout();
    res.redirect("/");
  });
};

export default authenticationRoutes;
