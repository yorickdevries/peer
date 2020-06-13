import express from "express";
import { eventLogger } from "../middleware/logger";
import saveUserinfo from "../middleware/userinfo";
import loginRoutes from "./login";

const router = express.Router();
router.use(eventLogger);

// initialize login/logout routes
loginRoutes(router);

// Save userinfo to the database
// TODO: Needs to be moved to the login callback so it is only saved once per session
router.use(saveUserinfo);

// Authentication route
router.get("/authenticated", (req, res) => {
  res.json({ authenticated: req.isAuthenticated() });
});

// TODO: Check always whether someone is logged in before accessing the routes below
//router.use(security.authorization.authorizeCheck);

// TODO: Routing
//router.use("/assignments", assignments);
//router.use("/courses", courses);
//router.use("/groups", groups);
//router.use("/reviews", reviews);
//router.use("/rubric", rubrics);
//router.use("/submissions", submissions);

// Route to get the userinfo
router.get("/user", (req, res) => {
  res.json({
    user: req.user,
  });
});

// If no other routes apply, send a 404
router.use((_req, res) => {
  res.sendStatus(404);
});

export default router;
