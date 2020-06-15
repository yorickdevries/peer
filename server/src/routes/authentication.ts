import { Router } from "express";
import passport from "passport";
import path from "path";
import config from "config";
import Joi from "@hapi/joi";
import session from "../middleware/authentication/session";
import passportConfiguration from "../middleware/authentication/passport";
import mockPassportConfiguration from "../middleware/authentication/passportMock";
import saveUserinfo from "../middleware/authentication/saveUserinfo";
import HttpStatusCode from "../enum/HttpStatusCode";

// Adds authentication routes
const authenticationRoutes = function (router: Router): void {
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
      saveUserinfo, // Save userinfo to the database
      (_req, res) => {
        res.redirect("/");
      }
    );
  } else {
    // Mock Login form
    router.get("/login", (_req, res) => {
      res.sendFile(path.resolve("./mocklogin.html"));
    });

    // Joi inputvalidation
    const mockUserSchema = Joi.object({
      netid: Joi.string().required(),
      affiliation: [Joi.string(), Joi.array().items(Joi.string())],
    });

    // Mock login route
    router.post(
      "/mocklogin",
      (req, res, next) => {
        // check whether the schema is compliant with what is expected
        if (mockUserSchema.validate(req.body).error) {
          res.sendStatus(HttpStatusCode.BAD_REQUEST);
        } else {
          const netid = req.body.netid;
          const affiliation = req.body.affiliation;
          console.log(`Mocklogin: ${netid}, ${affiliation}`);
          // make Mocked passport configuration
          mockPassportConfiguration(passport, netid, affiliation);
          next();
        }
      },
      passport.authenticate("mock"),
      saveUserinfo, // Save userinfo to the database
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
  router.get("/metadata.xml", async (_, res) => {
    res.sendFile("./SP_Metadata.xml");
  });
};

export default authenticationRoutes;
