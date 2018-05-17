import { Router } from "express";
const router = Router();
// import database object
import Database from "../database";
// okta-login
import { oidc } from "../express-oidc";

// Only logged in users can access the API
router.use(function (req: any, res, next) {
    if (req.isAuthenticated()) {
        console.log(req.userinfo.given_name + " accesses the API");
        next();
    } else {
        next(new Error("Not Authenticated"));
    }
});

router.get("/user", function (req: any, res, next) {
    res.json({
        user: req.userinfo
    });
});

/* GET Userlist page in JSON. */
router.get("/users", function (req, res, next) {
    Database.db.any("SELECT * FROM userlist")
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

    Database.db.none("INSERT INTO userlist(netid, email) VALUES($1, $2)", [netID, email])
        .then(function () {
            // If it worked, set the header so the address bar doesn't still say /adduser
            // And forward to success page
            res.json({});
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
