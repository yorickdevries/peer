import { Router } from "express";
const router = Router();

// import database object
import database from "../database";
const db = database.db;

/* GET home page. */
router.get("/", function (req, res, next) {
    res.render("index", { title: "Homepage" });
});

/* GET Userlist page. */
router.get("/userlist", function (req, res) {
    db.any("SELECT * FROM usercollection")
        .then(function (data) {
            // res.status(200).send(result.rows);
            res.render("userlist", {
                "userlist": data
            });
        })
        .catch(function (err) {
            console.log(err);
            // res.status(400).send(err);
            res.render("error", {
                "message": "Error",
                "error": err
            });
        });
});

/* GET Userlist page in JSON. */
router.get("/userlistjson", function (req, res, next) {
    db.any("SELECT * FROM usercollection")
        .then(function (data) {
            res.status(200)
                .json(data);
        })
        .catch(function (err) {
            next(err);
        });
});

/* GET New User page. */
router.get("/newuser", function (req, res) {
    res.render("newuser", { title: "Add New User" });
});

/* POST to Add User Service */
router.post("/adduser", function (req, res) {
    // Get our form values.
    const netID = req.body.netid;
    const email = req.body.email;

    db.none("INSERT INTO usercollection(netid, email) VALUES($1, $2)", [netID, email])
        .then(function () {
            // If it worked, set the header so the address bar doesn't still say /adduser
            // And forward to success page
            res.redirect("userlist");
        })
        .catch(function (err) {
            // If it failed, return error
            console.log(err);
            res.send("There was a problem adding the information to the database.");
        });
});

export default router;
