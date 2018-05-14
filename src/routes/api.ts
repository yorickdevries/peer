import { Router } from "express";
const router = Router();

// import database object
import Database from "../database";
const databaseObject = new Database();
const db = databaseObject.db;

/* GET Userlist page in JSON. */
router.get("/users", function (req, res, next) {
    db.any("SELECT * FROM usercollection")
        .then(function (data: object) {
            res.status(200)
                .json(data);
        })
        .catch(function (err: Error) {
            next(err);
        });
});

/* POST to Add User Service */
router.post("/users", function (req, res) {
    // Get our form values.
    const netID = req.body.netid;
    const email = req.body.email;

    db.none("INSERT INTO usercollection(netid, email) VALUES($1, $2)", [netID, email])
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
