import express from "express";
import { eventLogger } from "../middleware/logger";

const router = express.Router();
router.use(eventLogger);

// Authentication route
router.get("/authenticated", function (req, res) {
  res.json({ authenticated: req.isAuthenticated() });
});

// Rest of the api comes here

// If no other routes apply, send a 404
router.use(function (_, res) {
  res.sendStatus(404);
});

export default router;
