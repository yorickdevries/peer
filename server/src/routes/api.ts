import express from "express";
import { eventLogger } from "../middleware/logger";
import loginRoutes from "./login";

// old routes, can be deleted when not needed anymore
import oldRoutes from "../old_api/routes/api";

const router = express.Router();
router.use(eventLogger);

// initialize login/logout routes
loginRoutes(router);

// Authentication route
router.get("/authenticated", (req, res) => {
  res.json({ authenticated: req.isAuthenticated() });
});

// TODO: Check always whether someone is logged in before accessing the routes below
//router.use(security.authorization.authorizeCheck);

// Route to get the userinfo
router.get("/me", (req, res) => {
  res.json({
    user: req.user,
  });
});

// TODO: Complete routing of the new API

// old routes, can be deleted when not needed anymore
router.use("/oldroutes", oldRoutes);

// If no other routes apply, send a 404
router.use((_req, res) => {
  res.sendStatus(404);
});

export default router;
