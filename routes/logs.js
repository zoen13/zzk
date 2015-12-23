var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Log = mongoose.model('Log');

router.get('/', function(req, res, next) {
	var logs1,logs2;
	var logQuery1 = Log.find({status:false}).sort('datetime').limit(5);
	var logQuery2 = Log.find({status:true}).sort('-datetime').limit(5);
	logQuery1.exec(function (err1, log1result){
		if (!err1){
			logs1=log1result;
			logQuery2.exec(function (err2, log2result){
				if (!err2){
					logs2=log2result;
					res.render('logs',{ alllog1:logs1,alllog2:logs2 });
				}
				else {
					res.send('获取数据失败！');
				} 
			});
			
		}
		else {
			res.send('获取数据失败！');
		} 
	});
	
});

router.get('/:p?', function(req, res, next) {
	var page=req.params.p;
	var logQuery1 = Log.find({status: false}).sort('-datetime');
	res.render('logs',{page:page});
});

module.exports = router;