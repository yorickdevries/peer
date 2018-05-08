var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Homepage' });
});

/* GET Userlist page. */
router.get('/userlist', function(req, res) {
	var pool = req.pool;
    pool.query('SELECT * FROM usercollection', (err, result) => {
		if(err){
            console.log(err);
            //res.status(400).send(err);
			res.render('error', {
			"message" : "Error",
            "error" : err
			});
        } else {
			//res.status(200).send(result.rows);
			res.render('userlist', {
            "userlist" : result.rows
			});
		}
	});
});

/* GET New User page. */
router.get('/newuser', function(req, res) {
    res.render('newuser', { title: 'Add New User' });
});

/* POST to Add User Service */
router.post('/adduser', function(req, res) {

    // Set our internal pool variable
    var pool = req.pool;

    // Get our form values. These rely on the "name" attributes
    var netID = req.body.netid;
    var email = req.body.email;

    // Submit to the DB
    pool.query('INSERT INTO usercollection(netid, email) VALUES($1, $2)', [netID, email], function (error, results, fields) {
        if (error) {
            // If it failed, return error
			console.log(error);
            res.send("There was a problem adding the information to the database.");
        }
        else {
            // If it worked, set the header so the address bar doesn't still say /adduser
            // And forward to success page
            res.redirect("userlist");
        }
    });
});

module.exports = router;
