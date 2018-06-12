// Imports
import path from "path";
import fs from "fs-extra";
import index from "../security/index";
import multer from "multer";
import AssignmentPS from "../prepared_statements/assignment_ps";
import UserPS from "../prepared_statements/user_ps";
import GroupPS from "../prepared_statements/group_ps";
import ReviewPS from "../prepared_statements/review_ps";
import RubricPS from "../prepared_statements/rubric_ps";
import GroupParser from "../groupParser";
import reviewDistribution from "../reviewDistribution";
import bodyParser from "body-parser";

// Router
import express from "express";
import SubmissionsPS from "../prepared_statements/submissions_ps";

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
            res.status(400);
            res.json({ error: "File is too large" });
        }
        // Error in case of wrong file type
        else if (req.fileValidationError) {
            res.status(400);
            res.json({ error: req.fileValidationError });
        } else {
            next();
        }
    });
};

/**
 * Update the assignment in the database.
 * Removes the file linked to the assignment and writes the new file,
 * if a new file is uploaded.
 * @param req - a request object.
 * @param res - a response object.
 * @param next - a next object.
 * @return {Promise<void>}
 */
const updateAssignment = async function(req: any, res: any) {
    try {
        const oldFilename: string = (await AssignmentPS.executeGetAssignmentById(req.params.assignment_id)).filename;
        // Determine whether a file is uploaded and set the filename accordingly.
        const updatedFileName: string = (req.file) ? Date.now() + "-" + req.file.originalname : oldFilename;

        // Update the assignment in the database.
        const result: any = await AssignmentPS.executeUpdateAssignmentById(
            req.body.title,
            req.body.description,
            req.body.course_id,
            req.params.assignment_id,
            req.body.due_date,
            req.body.publish_date,
            req.body.reviews_per_user,
            updatedFileName,
            req.body.review_due_date,
            req.body.review_publish_date);

        // Remove the old file and add the new file if a file is uploaded
        // (ie. name of the file is not undefined).
        if (req.file) {
            // Assemble the file path. Updated file name is the new file name.
            // It can never be the old since req.file would be undefined.
            const newFilePath = path.join(fileFolder, updatedFileName);
            const oldFilePath = path.join(fileFolder, oldFilename);

            // Remove the old file and write the new file.
            fs.unlinkSync(oldFilePath);
            fs.writeFileSync(newFilePath, req.file.buffer);
        }
        res.json(result);
    } catch (err) {
        res.status(400);
        res.json({ error: "An error occurred while updating the assignment" });
    }
};

// Function which adds the assignment to the database.
const addAssignmentToDatabase = async function(req: any, res: any) {
    try {
        // Error in case of no file
        if (req.file == undefined) {
            res.status(400);
            res.json({ error: "No file uploaded" });
            return;
        }

        const fileName = Date.now() + "-" + req.file.originalname;
        const filePath = path.join(fileFolder, fileName);
        // add to database
        const result: any = await AssignmentPS.executeAddAssignment(
            req.body.title,
            req.body.description,
            req.body.due_date,
            req.body.publish_date,
            req.body.course_id,
            req.body.reviews_per_user,
            fileName,
            req.body.review_due_date,
            req.body.review_publish_date);
        // Create rubric
        await RubricPS.executeCreateRubric(result.id);
        // writing the file if no error is there
        fs.writeFileSync(filePath, req.file.buffer);
        res.json(result);
    } catch (err) {
        res.status(400);
        res.json({ error: "An error occurred while creating the assignment" });
    }
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
    .get(index.authorization.enrolledAssignmentCheck, (req, res) => {
        AssignmentPS.executeGetAssignmentById(req.params.assignment_id)
        .then((data) => {
            res.json(data);
        }).catch((error) => {
            res.sendStatus(400);
        });
    });


/**
 * Route to post and update an assignment.
 */
router.post("/", uploadAssignmentFunction, index.authorization.enrolledAsTeacherAssignmentCheckForPost, addAssignmentToDatabase);

/**
 * Route to update an assignment.
 * Removes the old assignment (also from the files folder - if a file is uploaded)
 * and adds the new assignment.
 */
router.put("/:assignment_id", uploadAssignmentFunction, updateAssignment);

/**
 * Route to get a file from an assignment.
 * @param id - assignment id.
 */
router.get("/:id/file", async (req, res) => {
    try {
        const assignment: any = await AssignmentPS.executeGetAssignmentById(req.params.id);
        const fileName = path.join(__dirname, "../files/assignments", assignment.filename);
        res.sendfile(fileName);
    } catch (err) {
        res.sendStatus(400);
    }
});

/**
 * Route to get all submissions of a certain assignment of your specific group
 * @userinfo given_name - netId
 * @params assignment_id - assignment_id
 */
router.route("/:assignment_id/submissions")
    .get((req: any, res) => {
        AssignmentPS.executeGetSubmissionsByAssignmentId(
            req.userinfo.given_name,
            req.params.assignment_id
        ).then((data) => {
            res.json(data);
        }).catch((error) => {
            res.sendStatus(400);
        });
    });

/**
 * Route to get the latest submission of a certain assignment of your specific group
 */
router.route("/:id/latestsubmission")
.get(async (req: any, res) => {
    const netId = req.userinfo.given_name;
    const assignmentId = req.params.id;
    // get the groupId of this user for this assignment
    try {
        const groupAssignment: any = await AssignmentPS.executeGetGroupOfNetIdByAssignmentId(netId, assignmentId);
        const groupId = groupAssignment.group_id;
        // get the latest submission
        const result: any = await SubmissionsPS.executeGetLatestSubmissionByAssignmentIdByGroupId(assignmentId, groupId);
        res.json(result);
    } catch {
        res.status(400);
        res.json({error: "No latest submission could be found"});
    }
});

/**
 * Route to get all the submissions per assignment
 * @params assignment_id - assignment_id
 */
router.route("/:assignment_id/allsubmissions")
    .get(index.authorization.enrolledAsTAOrTeacherAssignment, (req, res) => {
        AssignmentPS.executeGetAllSubmissionsByAssignmentId(req.params.assignment_id)
        .then((data) => {
            res.json(data);
        }).catch((error) => {
            res.sendStatus(400);
        });
    });


/**
 * Route to request a list of reviews
 * @userinfo given_name - NetId
 * @params assignment_id - assignment_Id
 */
router.route("/:assignment_id/reviews")
    .get((req: any, res) => {
        ReviewPS.executeGetReviewsByUserIdAndAssignmentId(req.userinfo.given_name, req.params.assignment_id)
        .then((data) => {
            res.json(data);
        }).catch((error) => {
            res.sendStatus(400);
        });
    });

/**
 * Route to distribute reviews for a certain assignment
 */
router.route("/:assignment_id/distributeReviews")
    .get((req: any, res) => {
        reviewDistribution.distributeReviews(req.params.assignment_id)
        .then((data) => {
            res.json(data);
        }).catch((error) => {
            res.status(400);
            res.json({error: error.message});
        });
    });

/**
 * Route to import groups for a specific assignment.
 */
router.post("/:id/importgroups", (req: any, res) => {
    // File upload handling
    uploadGroups(req, res, function (err) {
        // Error in case of wrong file type
        if (req.fileValidationError) {
            res.status(400);
            res.json({ error: req.fileValidationError });
            // Error (in case of too large file size)
        } else if (err) {
            res.status(400);
            res.json({ error: "File is too large" });
            // error if no file was uploaded or no group column defined
        } else if (req.file == undefined) {
            res.status(400);
            res.json({error: "No file uploaded"});
        } else if (req.body.groupColumn == undefined) {
            res.status(400);
            res.json({error: "No groupcolumn defined"});
        } else {
            const groupColumn = req.body.groupColumn;
            const assignmentId = req.params.id;
            GroupParser.importGroups(req.file.buffer, groupColumn, assignmentId)
            .then((data) => {
                res.json(data);
            }).catch((error) => {
                res.status(400);
                res.json({error: error.message});
            });
        }
    });
});

/**
 * Route to get the reviews belonging to an assignment.
 * @param id - assignment id.
 */
router.get("/:id/allreviews", (req: any, res) => {
    AssignmentPS.executeGetReviewsById(req.params.id)
    .then((data) => {
        res.json(data);
    }).catch((error) => {
        res.sendStatus(400);
    });
});

/**
 * Route to get your group for this assignment
 * @param id - assignment id.
 */
router.get("/:id/group", async (req: any, res) => {
    try {
        const group = await UserPS.executeGetGroupsByNetIdByAssignmentId(req.userinfo.given_name, req.params.id);
        const groupId = group.group_groupid;
        const groupmembers = await GroupPS.executeGetUsersOfGroupById(groupId);
        res.json({group, groupmembers});
    } catch {
        res.sendStatus(400);
    }
});

/**
 * Route to get review Ids of a certain person.
 */
router.get("/:id/feedback", async (req: any, res) => {
    try {
        const assignmentId = req.params.id;
        const group = await UserPS.executeGetGroupsByNetIdByAssignmentId(req.userinfo.given_name, req.params.id);
        const groupId = group.group_groupid;
        const submission: any = await SubmissionsPS.executeGetLatestSubmissionByAssignmentIdByGroupId(assignmentId, groupId);
        const submissionId = submission.id;
        res.json(await ReviewPS.executeGetReviewsBySubmissionId(submissionId));
    } catch {
        res.sendStatus(400);
    }
});

/**
 * Route to get all groups of an assignment
 */
router.get("/:id/groups", (req: any, res) => {
    AssignmentPS.executeGetGroupsByAssignmentId(req.params.id)
    .then((data) => {
        res.json(data);
    }).catch((error) => {
        res.sendStatus(400);
    });
});

export default router;