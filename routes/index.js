var express = require('express');
var router = express.Router();

/* GET home page. */

router.get('/', function(req, res, next) {
	var myDate = new Date();
    var nowmonth=myDate.getMonth()+1;
    if (nowmonth<10) {nowmonth="0"+nowmonth;}
    var imonth=myDate.getFullYear()+"-"+nowmonth;
    res.redirect("/arranges/show/"+imonth);
});

module.exports = router;
