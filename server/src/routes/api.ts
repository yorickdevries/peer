import { Router } from "express";
import CoursesPS from "../prepared_statements/courses_ps";
import UserPS from "../prepared_statements/user_ps";
const router = Router();

// import database object
import Database from "../database";
import * as pgPromise from "pg-promise";

/* GET Userlist page in JSON. */
router.get("/users", function (req, res, next) {
    Database.db.any("SELECT * FROM courselist")
        .then(function (data: object) {
            res.status(200)
                .json(data);
        })
        .catch(function (err: Error) {
            next(err);
        });
});

/**
 * function for test purposes
 */

router.post("/testquery", async function(req, res) {
    const netId = req.body.netid;
    const email = req.body.email;

    res.json(await CoursesPS.executeCreateCourse("update", "p.j.vanderlaan-1@student.tudelft.nl"));
});


/* POST to Add User Service */
router.post("/users", function (req, res) {
    // Get our form values.
    const netID = req.body.netid;
    const email = req.body.email;

    Database.db.none("INSERT INTO userlist(netid, email) VALUES($1, $2)", [netID, email])
        .then(function () {
            // If it worked, set the header so the address bar doesn't still say /adduser
            // And forward to success page
            res.json( { });
        })
        .catch(function (err: Error) {
            // If it failed, return error
            console.log(err);
            res.json(
                {
                    error: "There was a problem adding the information to the database."
                });
        });
});

export default router;
