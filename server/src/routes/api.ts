import express from "express";
import { eventLogger } from "../middleware/logger";
import authenticationRoutes from "./authentication";
import checkAndSetAuthentication from "../middleware/authentication/checkAuthentication";
import HttpStatusCode from "../enum/HttpStatusCode";
import ResponseMessage from "../enum/ResponseMessage";
// routes
import users from "./users";
import faculties from "./faculties";
import academicyears from "./academicyears";
import courses from "./courses";
import enrollments from "./enrollments";
import assignments from "./assignments";
import assignmentversions from "./assignmentversions";
import groups from "./groups";
import submissions from "./submissions";
import submissionquestionnaires from "./submissionquestionnaires";
import reviewquestionnaires from "./reviewquestionnaires";
import checkboxquestions from "./checkboxquestions";
import multiplechoicequestions from "./multiplechoicequestions";
import openquestions from "./openquestions";
import rangequestions from "./rangequestions";
import uploadquestions from "./uploadquestions";
import checkboxquestionoptions from "./checkboxquestionoptions";
import multiplechoicequestionoptions from "./multiplechoicequestionoptions";
import reviewofsubmissions from "./reviewofsubmissions";
import reviewofreviews from "./reviewofreviews";
import openquestionanswers from "./openquestionanswers";
import rangequestionanswers from "./rangequestionanswers";
import uploadquestionanswers from "./uploadquestionanswers";
import multiplechoicequestionanswers from "./multiplechoicequestionanswers";
import checkboxquestionanswers from "./checkboxquestionanswers";
import pdfannotations from "./pdfannotations";
import assignmentexports from "./assignmentexports";
import codeannotations from "./codeannotations";
import statistics from "./statistics";
import banners from "./banners";
import Banner from "../models/Banner";
import isAdmin from "../middleware/authentication/isAdmin";
import preferences from "./preferences";

const router = express.Router();
router.use(eventLogger);

// initialize login/logout authentication routes
authenticationRoutes(router);

// Check authentication route
router.get("/authenticated", (req, res) => {
  res.send({ authenticated: req.isAuthenticated() });
});

// get active banner (allowed for unauthenticated users)
router.get("/banners/active", async (_req, res) => {
  // send active banner or empty object
  const banner = await Banner.findOne({
    where: { active: true },
  });

  const bannerToSend =
    banner !== undefined ? banner.getAnonymousBanner() : null;

  res.send(bannerToSend);
});

// Check always whether someone is logged in before accessing the other routes below
// additionally fixes the user object so all fields are copied over from the database
router.use(checkAndSetAuthentication);

// Route to get the current userinfo from SSO
// might need to be moved to /users route
router.get("/me", async (req, res) => {
  // the user is defined as it is checked and set with checkAndSetAuthentication
  res.send(req.user);
});

// TODO: Complete routing of the new API
router.use("/users", users);
router.use("/faculties", faculties);
router.use("/academicyears", academicyears);
router.use("/courses", courses);
router.use("/enrollments", enrollments);
router.use("/assignments", assignments);
router.use("/assignmentversions", assignmentversions);
router.use("/groups", groups);
router.use("/submissions", submissions);
router.use("/submissionquestionnaires", submissionquestionnaires);
router.use("/reviewquestionnaires", reviewquestionnaires);
router.use("/checkboxquestions", checkboxquestions);
router.use("/multiplechoicequestions", multiplechoicequestions);
router.use("/openquestions", openquestions);
router.use("/rangequestions", rangequestions);
router.use("/uploadquestions", uploadquestions);
router.use("/checkboxquestionoptions", checkboxquestionoptions);
router.use("/multiplechoicequestionoptions", multiplechoicequestionoptions);
router.use("/reviewofsubmissions", reviewofsubmissions);
router.use("/reviewofreviews", reviewofreviews);
router.use("/openquestionanswers", openquestionanswers);
router.use("/rangequestionanswers", rangequestionanswers);
router.use("/uploadquestionanswers", uploadquestionanswers);
router.use("/multiplechoicequestionanswers", multiplechoicequestionanswers);
router.use("/checkboxquestionanswers", checkboxquestionanswers);
router.use("/pdfannotations", pdfannotations);
router.use("/assignmentexports", assignmentexports);
router.use("/codeannotations", codeannotations);
router.use("/statistics", statistics);
router.use("/banners", isAdmin, banners);
router.use("/preferences", preferences);

// If no other routes apply, send a 404
router.use((_req, res) => {
  res.status(HttpStatusCode.NOT_FOUND).send(ResponseMessage.NOT_FOUND);
});

export default router;
