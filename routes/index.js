var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Homepage' });
});

/* GET Userlist page. */
router.get('/userlist', function(req, res) {
	var pool = req.pool;
    pool.query('SELECT * FROM usercsollection', (err, result) => {
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

module.exports = router;
