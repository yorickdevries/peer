import { Router } from "express";
import ReviewPS from "../prepared_statements/review_ps";
import auth from "./auth";
import assignments from "./assignments";
import courses from "./courses";
import groups from "./groups";
import reviews from "./reviews";
import rubrics from "./rubrics";
import submissions from "./submissions";

const router = Router();

router.use(auth);

// Only logged in users can access the API
router.use(function (req: any, res, next) {
    if (req.isAuthenticated()) {
        console.log(req.userinfo.given_name + " accesses the API");
        next();
    } else {
        next(new Error("Not Authenticated"));
    }
});

// Routing
router.use("/assignments", assignments);
router.use("/courses", courses);
router.use("/groups", groups);
router.use("/reviews", reviews);
router.use("/rubrics", rubrics);
router.use("/submissions", submissions);

router.get("/user", function (req: any, res, next) {
    res.json({
        user: req.userinfo
    });
});

export default router;
