var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Log = mongoose.model('Log');

router.get('/', function(req, res, next) {
	res.render('logs');
});

module.exports = router;