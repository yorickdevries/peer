import express from "express";

const router = express.Router();

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
