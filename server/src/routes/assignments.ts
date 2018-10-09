// Imports
import path from "path";
import fs from "fs-extra";
import index from "../security/index";
import multer from "multer";
import AssignmentPS from "../prepared_statements/assignment_ps";
import UserPS from "../prepared_statements/user_ps";
import GroupPS, { default as GroupsPS } from "../prepared_statements/group_ps";
import ReviewPS from "../prepared_statements/review_ps";
import RubricPS from "../prepared_statements/rubric_ps";
import ExportResultsPS from "../prepared_statements/export_results_ps";
import CSVExport from "../CSVExport";
import GroupParser from "../groupParser";
import reviewDistribution from "../reviewDistribution";
import bodyParser from "body-parser";
import config from "../config";

// Router
import express from "express";
import SubmissionsPS from "../prepared_statements/submissions_ps";
import CoursesPS from "../prepared_statements/courses_ps";

const router = express();
const fileFolder = config.assignments.fileFolder;

router.use(bodyParser.json());

// PDF of max 30 MB (in bytes)
const maxSizeAssignmentFile = config.assignments.maxSizeAssignmentFile;
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
            req.body.reviews_per_user,
            updatedFileName,
            req.body.publish_date,
            req.body.due_date,
            req.body.review_publish_date,
            req.body.review_due_date,
            req.params.assignment_id
        );

        // Remove the old file and add the new file if a file is uploaded
        // (ie. name of the file is not undefined).
        if (req.file) {
            // Assemble the file path. Updated file name is the new file name.
            // It can never be the old since req.file would be undefined.
            const newFilePath = path.join(fileFolder, updatedFileName);
            const oldFilePath = path.join(fileFolder, oldFilename);

            // Remove the old file and write the new file.
            await fs.unlink(oldFilePath);
            await fs.writeFile(newFilePath, req.file.buffer);
        }
        res.json(result);
    } catch (err) {
        // Send appropriate error.
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
            req.body.course_id,
            req.body.reviews_per_user,
            fileName,
            req.body.publish_date,
            req.body.due_date,
            req.body.review_publish_date,
            req.body.review_due_date,
            req.body.one_person_groups);
        // writing the file if no error is there
        await fs.writeFile(filePath, req.file.buffer);
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
 * Route to get all information about an assignment
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
router.put("/:assignment_id", uploadAssignmentFunction, index.authorization.enrolledAsTeacherAssignmentCheck, updateAssignment);

/**
 * Route to get a file from an assignment.
 * @param id - assignment id.
 */
router.get("/:assignment_id/file", index.authorization.enrolledAssignmentCheck, async (req, res) => {
    try {
        const assignment: any = await AssignmentPS.executeGetAssignmentById(req.params.assignment_id);
        const fileName = path.join(fileFolder, assignment.filename);
        res.sendFile(fileName);
    } catch (err) {
        res.sendStatus(400);
    }
});

/**
 * Route to get all submissions of a certain assignment of your specific group.
 * @user netid - netId.
 * @params assignment_id - assignment_id.
 */
router.route("/:assignment_id/submissions", )
    .get((req: any, res) => {
        AssignmentPS.executeGetSubmissionsByAssignmentId(
            req.user.netid,
            req.params.assignment_id
        ).then((data) => {
            res.json(data);
        }).catch((error) => {
            res.sendStatus(400);
        });
    });

/**
 * Route to get the latest submission of a certain assignment of an assignment id.
 */
router.route("/:id/latestsubmission")
.get(async (req: any, res) => {
    const netId = req.user.netid;
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
 * Route to get all submissions per assignment
 * @params assignment_id - assignment_id
 */
router.route("/:assignment_id/allsubmissions")
    .get(index.authorization.enrolledAsTAOrTeacherAssignment, (req, res) => {
        SubmissionsPS.executeGetAllSubmissionsByAssignmentId(req.params.assignment_id)
        .then((data) => {
            res.json(data);
        }).catch((error) => {
            res.sendStatus(400);
        });
    });

/**
 * Route to get all latest submissions per assignment
 * @params assignment_id - assignment_id
 */
router.route("/:assignment_id/alllatestsubmissions")
    .get(index.authorization.enrolledAsTAOrTeacherAssignment, (req, res) => {
        SubmissionsPS.executeGetLatestSubmissionsByAssignmentId(req.params.assignment_id)
        .then((data) => {
            res.json(data);
        }).catch((error) => {
            res.sendStatus(400);
        });
    });


/**
 * Route to request a list of reviews
 * @user.netid - NetId
 * @params assignment_id - assignment_Id
 */
router.route("/:assignment_id/reviews")
    .get((req: any, res) => {
        ReviewPS.executeGetReviewsByUserIdAndAssignmentId(req.user.netid, req.params.assignment_id)
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
    .get(index.authorization.enrolledAsTAOrTeacherAssignment, (req: any, res) => {
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
router.post("/:assignment_id/importgroups", index.authorization.enrolledAsTAOrTeacherAssignment, (req: any, res) => {
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
            const assignmentId = req.params.assignment_id;
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
router.get("/:assignment_id/allreviews", index.authorization.enrolledAsTAOrTeacherAssignment, (req: any, res) => {
    ReviewPS.executeGetAllDoneReviewsByAssignmentId(req.params.assignment_id)
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
        const group = await UserPS.executeGetGroupsByNetIdByAssignmentId(req.user.netid, req.params.id);
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
        const assignment: any = await AssignmentPS.executeGetAssignmentById(req.params.id);
        if (new Date(assignment.review_due_date) > new Date()) {
            res.status(401);
            res.json({ error: "You can only access the review after the review due date is passed." });
        } else {
            const assignmentId = req.params.id;
            const group = await UserPS.executeGetGroupsByNetIdByAssignmentId(req.user.netid, req.params.id);
            const groupId = group.group_groupid;
            const submission: any = await SubmissionsPS.executeGetLatestSubmissionByAssignmentIdByGroupId(assignmentId, groupId);
            const submissionId = submission.id;
            res.json(await ReviewPS.executeGetReviewsBySubmissionId(submissionId));
        }
    } catch {
        res.sendStatus(400);
    }
});

/**
 * Route to get all groups of an assignment
 */
router.get("/:assignment_id/groups", index.authorization.enrolledAsTAOrTeacherAssignment, (req: any, res) => {
    AssignmentPS.executeGetGroupsByAssignmentId(req.params.assignment_id)
    .then((data) => {
        res.json(data);
    }).catch((error) => {
        res.sendStatus(400);
    });
});

/**
 * Route to enroll in an assignment as 1 person group.
 * Only possible for assignments with 1 person groups.
 * Student should be enrolled in the course.
 * @param id - assignment id.
 */
router.get("/:assignment_id/enroll", index.authorization.enrolledAsStudentAssignment, async (req: any, res) => {
    try {
        const assignment: any = await AssignmentPS.executeGetAssignmentById(req.params.assignment_id);

        // Check if the assignment due date is not passed, one person groups is enabled and student is without group.
        // Send custom error json (not throwing error and displaying that) since database error messages are confidential.
        if (new Date(assignment.due_date) <= new Date()) {
            res.status(400);
            res.json({error: "Student can only enroll until the assignment due date deadline."});
        } else if (new Date(assignment.publish_date) >= new Date()) {
            res.status(400);
            res.json({error: "Student can only enroll until after the assignment publish date."});
        } else if (assignment.one_person_groups === false) {
            res.status(400);
            res.json({error: "Assignment has one person groups not enabled."});
        } else if (await GroupParser.studentIsInGroup(req.user.netid, req.params.assignment_id) === true) {
            res.status(400);
            res.json({error: "Student is already in a group enrolled for this assignment."});
        } else {
            // Create group and add assignment and student.
            const groupId = await GroupParser.createGroupForAssignment(req.user.netid, req.params.assignment_id);
            await GroupPS.executeAddStudenttoGroup(req.user.netid, groupId);
            res.sendStatus(200);
        }
    } catch {
        res.sendStatus(400);
    }
});

/**
 * Export the approved ratings of each student for a specific assignment.
 * @param assignment_id - id of the assignment.
 */
router.get("/:assignment_id/gradeExport", index.authorization.enrolledAsTeacherAssignmentCheck, async (req: any, res) => {
    try {
        const exportData = await ExportResultsPS.executeGetStudentReviewExportAssignment(req.params.assignment_id);

        // Check if the export data contains data.
        if (exportData.length == 0) {
            res.status(400);
            res.json({error: "No grades to export."});
            return;
        }

        // Properly format the file name.
        const assignment: any = await AssignmentPS.executeGetAssignmentById(req.params.assignment_id);
        const course: any = await CoursesPS.executeGetCourseById(assignment.course_id);
        const date: Date = new Date();
        const dd = (date.getDate() < 10) ? "0" + date.getDate() : date.getDate();
        const mm = (date.getMonth() + 1 < 10) ? "0" + date.getMonth() + 1 : date.getMonth() + 1;
        const hours = (date.getHours() < 10) ? "0" + date.getHours() : date.getHours();
        const min = (date.getMinutes() < 10) ? "0" + date.getMinutes() : date.getMinutes();

        // Check if the course name is a valid file name.

        const courseName = (/^([a-zA-Z_\-\s0-9]+)$/.test(course.name.replace(/ /g, "")))
            ? course.name.replace(/ /g, "") : "";
        const assignmentTitle = (/^([a-zA-Z_\-\s0-9]+)$/.test(assignment.title.replace(/ /g, "")))
            ? assignment.title.replace(/ /g, "") : "";
        const filename: string = `${courseName}--${assignmentTitle}--${dd}-${mm}-${date.getFullYear()}--${hours}-${min}`;

        res.setHeader("Content-disposition", `attachment; filename=${filename}.csv`);
        res.set("Content-Type", "text/csv");
        res.status(200).send(CSVExport.downloadCSV({ exportData: exportData }));
    } catch (e) {
        console.log(e);
        res.sendStatus(400);
    }
});

/**
 * Route to create a group.
 * @param assignment_id - id of the assignment.
 */
router.post("/:assignment_id/groups", index.authorization.enrolledAsTeacherAssignmentCheck, async (req: any, res) => {
    try {
        const group: any = await GroupsPS.executeAddGroup(req.body.group_name);
        await GroupPS.executeAddGrouptoAssignment(group.id, req.params.assignment_id);
        res.sendStatus(200);
    } catch (e) {
        console.log(e);
        res.sendStatus(400);
    }
});

/**
 * Route to get a random review id.
 * @param assignment_id - id of the assignment.
 */
router.get("/:assignment_id/randomReview", index.authorization.enrolledAsTAOrTeacherAssignment, async (req: any, res) => {
    try {
        const availableReviews: any = await ReviewPS.executeGetAllDoneReviewsByAssignmentIdUnreviewed(req.params.assignment_id);

        // Check if there are any reviews left. Send 400 to front-end to display 'There are no reviews left' message.
        if (availableReviews.length == 0) {
            res.sendStatus(400);
            return;
        }

        // Get a random review and respond.
        const randomReview: number = Math.floor(Math.random() * (availableReviews.length));
        res.json({ id: availableReviews[randomReview].id });
    } catch (e) {
        console.log(e);
        res.sendStatus(400);
    }
});

export default router;