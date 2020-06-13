import express from "express";
import assignments from "./assignments";
import courses from "./courses";
import groups from "./groups";
import reviews from "./reviews";
import rubrics from "./rubric";
import submissions from "./submissions";
import security from "../security";
import UserPS from "../prepared_statements/user_ps";

const router = express();

// This route checks the user and updates it in the database
router.use(async function(req: any, _, next) {
    const userinfo = req.user;
    // check whether userinfo exists
    if (userinfo == undefined || userinfo.netid == undefined) {
        // no user logged in
        next();
    } else {
        // get userinfo
        const netid = userinfo.netid;
        const studentNumber = userinfo.studentNumber;
        const firstName = userinfo.firstName;
        const prefix = userinfo.prefix;
        const lastName = userinfo.lastName;
        const email = userinfo.email;
        const affiliation = userinfo.affiliation;
        const displayName = userinfo.displayName;
        const study = userinfo.study;
        const organisationUnit = userinfo.organisationUnit;
        try {
            // check whether user is in the database
            const userExists: any = await UserPS.executeExistsUserById(netid);
            // in case the user is not in the database
            if (!userExists.exists) {
                // Adding user
                await UserPS.executeAddUser(netid, studentNumber, firstName, prefix, lastName, email, affiliation, displayName, study, organisationUnit);
            } else {
                // Updating userinfo
                await UserPS.executeUpdateUser(netid, studentNumber, firstName, prefix, lastName, email, affiliation, displayName, study, organisationUnit);
            }
            next();
        } catch (err) {
            next(err);
        }
    }
});

// Authentication route
router.get("/authenticated", function(req: any, res) {
    res.json({ authenticated: req.isAuthenticated() });
});

// Check always whether someone is logged in
router.use(security.authorization.authorizeCheck);

// Routing
router.use("/assignments", assignments);
router.use("/courses", courses);
router.use("/groups", groups);
router.use("/reviews", reviews);
router.use("/rubric", rubrics);
router.use("/submissions", submissions);

// Route to get the userinfo
router.get("/user", function(req: any, res) {
    res.json({
        user: req.user
    });
});

// If no other routes apply, send a 404
router.use(function(_, res) {
    res.sendStatus(404);
});

export default router;
