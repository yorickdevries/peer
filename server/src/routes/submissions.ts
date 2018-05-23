// Imports
import path from "path";
import multer from "multer";
import SubmissionsPS from "../prepared_statements/submissions_ps";

// Router
import { Router } from "express";
const router = Router();

// Upload settings
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, "./uploads/"));
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    }
  });

  //10 MB in bytes
const maxSize = 10 *1024 *1024;

const upload = multer({ storage: storage,
  limits: { fileSize: maxSize },
  fileFilter: function (req: any, file, cb: any) {
    if (file.mimetype !== 'application/pdf') {
     req.fileValidationError = 'File should be a .pdf file';
     return cb(null, false, new Error('File should be a .pdf file'));
    }
    cb(null, true);
   }
}).single('submissionfile');

/**
 * Route to get all submissions.
 */
router.get("/", async (req, res) => {
    res.json(await SubmissionsPS.executeGetSubmissions());
});

/**
 * Route to get one submission with a specific id.
 * @param id - submission id.
 */
router.get("/:id", async (req, res) => {
    res.json(await SubmissionsPS.executeGetSubmissionById(req.params.id));
});

/**
 * Route to get one submission with a specific id.
 * @param id - submission id.
 */
router.get("/:id", async (req, res) => {
    res.json(await SubmissionsPS.executeGetSubmissionById(req.params.id));
});

/**
 * Route to delete one submission with a specific id.
 * @param id - submission id.
 */
router.delete("/:id", async (req, res) => {
    res.json(await SubmissionsPS.executeDeleteSubmissionById(req.params.id));
});

/**
 * Route to make a new submission.
 */
router.post("/", async (req: any, res) => {
    console.log(req.file);
    // File up[load handling
    upload(req, res, async function(err) {
        //console.log(req.file);
        console.log(req.body);
        if (req.fileValidationError) {
          res.json({error: req.fileValidationError});
        } else {
            res.json({ok: "ok"});
          // make path here
          //const path = "dummy";
          //  res.json(await SubmissionsPS.executeCreateSubmission(req.userinfo.given_name, req.body.assignmentId, "dummypath"));
        }
    });
});

export default router;