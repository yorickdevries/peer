import express from "express";
import { eventLogger } from "../middleware/logger";
import authenticationRoutes from "./authentication";
import checkAuthentication from "../middleware/authentication/checkAuthentication";
import HttpStatusCode from "../enum/HttpStatusCode";
import faculties from "./faculties";
import academicyears from "./academicyears";
import courses from "./courses";
import enrollments from "./enrollments";

// old routes, can be deleted when not needed anymore
import oldRoutes from "../old_api/routes/api";

const router = express.Router();
router.use(eventLogger);

// initialize login/logout authentication routes
authenticationRoutes(router);

// Check authentication route
router.get("/authenticated", (req, res) => {
  res.json({ authenticated: req.isAuthenticated() });
});

// Check always whether someone is logged in before accessing the other routes below
router.use(checkAuthentication);

// Route to get the current userinfo from SSO
// might need to be moved to /users route
router.get("/me", (req, res) => {
  res.json(req.user);
});

// TODO: Complete routing of the new API
router.use("/faculties", faculties);
router.use("/academicyears", academicyears);
router.use("/courses", courses);
router.use("/enrollments", enrollments);

// old routes, can be deleted when not needed anymore
router.use("/oldroutes", oldRoutes);

// If no other routes apply, send a 404
router.use((_req, res) => {
  res.status(HttpStatusCode.NOT_FOUND).send("Resource not found");
});

export default router;
