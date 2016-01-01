var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Alert = mongoose.model('Alert');


router.get('/', function(req, res, next) {
	var alertQuery = Alert.find().sort('position').sort('hour').sort('minute');
	alertQuery.exec(function (err, alerts){
		if (!err){
			res.render('alerts', { allalert: alerts });
		}
		else {
			res.send('获取数据失败！');
		} 
	});
});

router.post('/',function(req,res){
	Alert.create({
		position:req.body.position,
		hour:req.body.hour,
		minute:req.body.minute,
		content:req.body.content
	},function(err,alert){
		if (!err){
			//console.log("Alert created and saved: " + alert);
			res.redirect('/alerts');
		}
	});
});

router.get('/delete/:id?',function(req,res){
	var id =req.params.id;
	Alert.findOne({ _id : id } ,
    	function (err,alert){
       		if (!err){
         		alert.remove( function(err){
    
         		});
         		res.redirect('/alerts');
	 		}
 		});
});

module.exports = router;
