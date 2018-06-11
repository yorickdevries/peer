// Imports
import path from "path";
import fs from "fs";
import index from "../security/index";
import multer from "multer";
import AssignmentPS from "../prepared_statements/assignment_ps";
import ReviewPS from "../prepared_statements/review_ps";
import GroupParser from "../groupParser";
import reviewDistribution from "../reviewDistribution";
import bodyParser from "body-parser";

// Router
import express from "express";

const router = express();
const fileFolder = path.join(__dirname, "../files/assignments");

router.use(bodyParser.json());

// PDF of max 30 MB (in bytes)
const maxSizeAssignmentFile = 30 * 1024 * 1024;
const uploadAssignment = multer({
    limits: {fileSize: maxSizeAssignmentFile},
    fileFilter: function (req: any, file, callback) {
        const ext = path.extname(file.originalname);
        if (ext !== ".pdf") {
            req.fileValidationError = "File should be a .pdf file";
            // tslint:disable-next-line
            return callback(null, false);
        } else {
            // tslint:disable-next-line
            return callback(null, true);
        }
    }
}).single("assignmentFile");

// File upload handling
const uploadAssignmentFunction = function(req: any, res: any, next: any) {
    uploadAssignment(req, res, function (err) {
        // Error in case of too large file size
        if (err) {
            res.json({ error: err });
        }
        // Error in case of no file
        else if (req.file == undefined) {
            res.json({ error: "No file uploaded" });
        }
        // Error in case of wrong file type
        else if (req.fileValidationError) {
            res.json({ error: req.fileValidationError });
        } else {
            next();
        }
    });
};

/**
 * Update the assignment in the database.
 * Removes the file linked to the assignment.
 * @param req - a request object.
 * @param res - a response object.
 * @param next - a next object.
 * @return {Promise<void>}
 */
const updateAssignment = async function(req: any, res: any, next: any) {
    const oldFilename: string = (await AssignmentPS.executeGetAssignmentById(req.params.assignment_id)).filename;
    const oldFilePath: string = path.join(fileFolder, oldFilename);

    const newFilename: string = Date.now() + "-" + req.file.originalname;
    const newFilePath: string = path.join(fileFolder, newFilename);

    // Update the assignment in the database.
    let result: any = await AssignmentPS.executeUpdateAssignmentById(
        req.body.title,
        req.body.description,
        req.body.course_id,
        req.params.assignment_id,
        req.body.due_date,
        req.body.publish_date,
        req.body.reviews_per_user,
        newFilename,
        req.body.review_due_date,
        req.body.review_publish_date);

    // Remove the old file and add the new file if there was not error,
    // if a file is uploaded (ie. name of the file is not undefined).
    if (!result.error && req.file.originalname) {
        // Remove old file.
        const customRes0 = fs.unlinkSync(oldFilePath);
        console.log("res0: " + customRes0);

        // Add new file.
        const customRes1 = fs.writeFileSync(newFilePath, req.file.buffer);
        console.log("res1: " + customRes1);
    }
    res.json(result);
};

// Function which adds the assignment to the database.
const addAssignmentToDatabase = async function(req: any, res: any, next: any) {
    const fileName = Date.now() + "-" + req.file.originalname;
    const filePath = path.join(fileFolder, fileName);

    // add to database
    let result: any = await AssignmentPS.executeAddAssignment(
        req.body.title,
        req.body.description,
        req.body.due_date,
        req.body.publish_date,
        req.body.course_id,
        req.body.reviews_per_user,
        fileName,
        req.body.review_due_date,
        req.body.review_publish_date);
    // writing the file if no error is there
    if (!result.error) {
        const customRes = fs.writeFileSync(filePath, req.file.buffer);
        console.log("res2: " + customRes);
    }
    res.json(result);
};


// CSV of max 1 MB (in bytes)
const maxSizeGroupsfile = 1 * 1024 * 1024;
// The file will be stored into the memory
const uploadGroups = multer({
    limits: {fileSize: maxSizeGroupsfile},
    fileFilter: function (req: any, file, callback) {
        const ext = path.extname(file.originalname);
        if (ext !== ".csv") {
            req.fileValidationError = "File should be a .csv file";
            // tslint:disable-next-line
            return callback(null, false);
        } else {
            // tslint:disable-next-line
            return callback(null, true);
        }
    }
}).single("groupFile");


/**
 * Route to get all the information about an assignment
 * @params assignment_id - assignment id
 */
router.route("/:assignment_id")
    .get(index.authorization.enrolledAssignmentCheck, async (req, res) => {
            res.json(await AssignmentPS.executeGetAssignmentById(
                req.params.assignment_id
            ));
    });


/**
 * Route to post and update an assignment.
 */
router.post("/", uploadAssignmentFunction, index.authorization.enrolledAsTeacherAssignmentCheckForPost, addAssignmentToDatabase);

/**
 * Route to update an assignment.
 * Removes the old assignment (also from the files folder) and adds the new assignment.
 */
router.put("/:assignment_id", uploadAssignmentFunction, updateAssignment);

/**
 * Route to get a file from an assignment.
 * @param id - assignment id.
 */
router.get("/:id/file", async (req, res) => {
    const assignment: any = await AssignmentPS.executeGetAssignmentById(req.params.id);
    const fileName = path.join(__dirname, "../files/assignments", assignment.filename);
    res.sendfile(fileName);
});

/**
 * Route to get all submissions of a certain assignment of your specific group
 * @userinfo given_name - netId
 * @params assignment_id - assignment_id
 */
router.route("/:assignment_id/submissions")
    .get(async (req: any, res) => {
        res.json(await AssignmentPS.executeGetSubmissionsByAssignmentId(
            req.userinfo.given_name,
            req.params.assignment_id
        ));
    });

/**
 * Route to get all the submissions per assignment
 * @params assignment_id - assignment_id
 */
router.route("/:assignment_id/allsubmissions")
    .get(index.authorization.enrolledAsTAOrTeacherAssignment, async (req, res) => {
            res.json(await AssignmentPS.executeGetAllSubmissionsByAssignmentId(
                req.params.assignment_id
            ));
    });


/**
 * Route to request a list of reviews
 * @userinfo given_name - NetId
 * @params assignment_id - assignment_Id
 */
router.route("/:assignment_id/reviews")
    .get(async (req: any, res) => {
        res.json(await ReviewPS.executeGetReviewsByUserIdAndAssignmentId(req.userinfo.given_name, req.params.assignment_id));
    });

/**
 * Route to distribute reviews for a certain assignment
 */
router.route("/:assignment_id/distributeReviews")
    .get(async (req: any, res) => {
        res.json(await reviewDistribution.distributeReviews(req.params.assignment_id));
    });

/**
 * Route to import groups for a specific assignment.
 */
router.post("/:id/importgroups", async (req: any, res) => {
    // File upload handling
    uploadGroups(req, res, async function (err) {
        // Error in case of wrong file type
        if (req.fileValidationError) {
            res.json({error: req.fileValidationError});
            // Error (in case of too large file size)
        } else if (err) {
            res.json({error: err});
            // error if no file was uploaded or no group column defined
        } else if (req.file == undefined) {
            res.json({error: "No file uploaded"});
        } else if (req.body.groupColumn == undefined) {
            res.json({error: "No groupcolumn defined"});
        } else {
            const groupColumn = req.body.groupColumn;
            const assignmentId = req.params.id;
            const groups = await GroupParser.importGroups(req.file.buffer, groupColumn, assignmentId);
            res.json(groups);
        }
    });
});

/**
 * Route to get the reviews belonging to an assignment.
 * @param id - assignment id.
 */
router.get("/:id/allreviews", async (req: any, res) => {
    res.json(await AssignmentPS.executeGetReviewsById(req.params.id));
});

export default router;