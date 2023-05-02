import Joi from "joi";
import { Router } from "express";
import config from "config";
import mockPassportConfiguration from "../middleware/authentication/passportMock";
import passport from "passport";
import passportConfiguration from "../middleware/authentication/passportTUDelft";
import path from "path";
import session from "../middleware/authentication/session";
import { validateBody } from "../middleware/validation";

// Adds authentication routes
const authenticationRoutes = function (router: Router): void {
  // setup sessions for login
  router.use(session);
  // initialize passport middleware
  router.use(passport.initialize());
  router.use(passport.session());

  // Depending of current mode, setup the login method
  if (process.env.NODE_ENV !== "test") {
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
  } else {
    // Joi inputvalidation
    const mockUserSchema = Joi.object({
      netid: Joi.string().required(),
      affiliation: Joi.string().required(),
      admin: Joi.boolean().optional(),
    });
    // Mock login route
    router.post(
      "/mocklogin",
      validateBody(mockUserSchema),
      async (req, _res, next) => {
        const netid = req.body.netid;
        const affiliation = req.body.affiliation;
        const admin = req.body.admin;
        console.log(`Mocklogin: ${netid}, ${affiliation}`);
        // make Mocked passport configuration
        await mockPassportConfiguration(passport, netid, affiliation, admin);
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
    res.redirect("/");
  });
};

export default authenticationRoutes;
