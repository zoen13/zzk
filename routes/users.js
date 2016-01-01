var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var User = mongoose.model('User');
var Arrange = mongoose.model('Arrange');
var Log = mongoose.model('Log');


/* GET users listing. */
router.get('/', function(req, res, next) {
	var userQuery = User.find().sort('-name');
	userQuery.exec(function (err, users){
		if (!err){
			res.render('users', { alluser: users });
		}
		else {
			res.send('获取数据失败！');
		} 
	});
	
});

router.post('/',function(req,res){
	User.create({
		name:req.body.name,
		email:req.body.email,
		phone:req.body.phone,
		shortnum:req.body.shortnum
	},function(err,user){
		if (!err){
			//console.log("User created and saved: " + user);
			res.redirect('/users');
		}
	});

});
router.get('/delete/:id?',function(req,res){
	var id =req.params.id;
	var today=new Date();
	var iday;
	if (today.getDate()<10) { iday="0"+today.getDate();}
	today=today.getFullYear()+"-"+(today.getMonth()+1)+"-"+iday;
	User.findOne({ _id : id } ,
    	function (err,user){
       		if (!err){
         		user.remove( function(err){
           		//根据用户姓名删除Arrange中大于今天的排班记录
           		Arrange.remove({user:user.name,day:{$gte:today}},function(err){if (!err){}});
           		//根据用户姓名删除Log中尚未发送的通知记录
           		Log.remove({name:user.name,status:false},function(err){if (!err){}});
         		});
         		res.redirect('/users');
	 		}
 		});
});

module.exports = router;
