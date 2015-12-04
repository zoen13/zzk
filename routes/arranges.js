var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Arrange = mongoose.model('Arrange');
var User = mongoose.model('User');
var Log = mongoose.model('Log');
var Alert = mongoose.model('Alert');

router.get('/:month?', function(req, res, next) {
	var month = req.params.month;
	loadData(month,res,req);
});

function loadData(month,res,req){
	var userQuery = User.find().sort('-name');
	var users;
	userQuery.exec(function (err, userresult){
		if (!err){
			users=userresult;
		}
		else {
			res.send('获取数据失败！');
		} 
	});
	var lastInertQuery = Arrange.find().sort('-inserttime').limit(3);
	var last3;
	lastInertQuery.exec(function (err,lastInsert){
		if (!err){
			last3=lastInsert;
		}
		else{
			res.send('获取数据失败！');
		}
	});
	
	var arrangeQuery = Arrange.find({day: new RegExp(month,'i')}).sort('day').sort('position');
	var arranges;
	var posLists = new Array();
	var iday=req.body.day;
	arrangeQuery.exec(function (err, arrangeresult){
		if (!err){
			arranges=arrangeresult;
			var posList = function(day,week,p1,p2,p3,p4,p5,p6){
				this.day=day;
				this.week=week;
				this.p1=p1;
				this.p2=p2;
				this.p3=p3;
				this.p4=p4;
				this.p5=p5;
				this.p6=p6;
			};
			posLists[0]=new posList();
			for (i=0;i<arranges.length;i++){
				if (arranges[i].day!=posLists[posLists.length-1].day){
					posLists[posLists.length]=new posList();
					posLists[posLists.length-1].day=arranges[i].day;
					posLists[posLists.length-1].week=arranges[i].week;
					
				}
				switch(arranges[i].position){
			  	 	case '93.4频率':
			  	 	 	posLists[posLists.length-1].p1 = arranges[i].user;
			  	 	 	break;		
			  	 	case '90.9频率':
			  	 		posLists[posLists.length-1].p2 = arranges[i].user;
			  	 	 	break;
			  	 	case '新媒体A':
			  	 		posLists[posLists.length-1].p3 = arranges[i].user;
			  	 	 	break;
			  	 	case '新媒体B':
			  	 		posLists[posLists.length-1].p4 = arranges[i].user;
			  	 	 	break;
		  	 	 	case '转录(☆)':
		  	 			posLists[posLists.length-1].p5 = arranges[i].user;
		  	 	 		break;
		  	 	 	case '新闻加强':
		  	 			posLists[posLists.length-1].p6 = arranges[i].user;
		  	 	 		break; 			
				}
			}
			
			if (iday===undefined){
				var myDate = new Date();
				var nowmonth=myDate.getMonth()+1;
				if (nowmonth<10) {nowmonth="0"+nowmonth;}
				iday=myDate.getDate();
				if (iday<10) { iday="0"+iday;}
				iday=myDate.getFullYear()+"-"+nowmonth+"-"+iday;
			}
			res.render('arranges', { allarrange: arranges,alluser:alluser,alllist:posLists,last:last3,month:month,day:iday});
		}
		else {
			res.send('获取数据失败！');
		} 
	});
	//res.render('arranges', { allarrange: arranges,alluser:users,alllist:posLists,last:last3,month:month,day:iday});
}

function getDayOfWeek(dateStr){
	 	var dayOfWeek = "";
	 	 	//dateStr = dateStr.replace(/-/g,'/');
	  	var date = new Date(dateStr);
	  	switch(date.getDay()){
	  	 	case 0:
	  	 	 	dayOfWeek = '日';
	  	 	 	break; 		
	  	 	case 1:
	   			dayOfWeek = '一';
	   			break; 		
	   		case 2:
	   			dayOfWeek = '二';
	   			break; 		
	   		case 3:
	   			dayOfWeek = '三';
	   			break;
	   		case 4: 			
	   			dayOfWeek = '四';
	   			break;
	   		case 5:
	  			dayOfWeek = '五';
	   			break;
	   		case 6:
	   			dayOfWeek = '六';
	 			break; 	
	 		} 	
	 	return dayOfWeek; 
}

router.post('/:month?',function(req,res){
	var month=req.params.month;
	Arrange.findOne({'day' : req.body.day,'position':req.body.position},
		function (err,arranges){
			if (!err && arranges){
				arranges.user.push(req.body.user);
				arranges.inserttime=Date.now();
				arranges.save(function(err,user){
				});
			}
			if (arranges===null){
				Arrange.create({
					day:req.body.day,
					week:getDayOfWeek(req.body.day),
					position:req.body.position,
					user:req.body.user
				},function(err,arrange){
					if (!err){
						console.log("Arrange created and saved: " + arrange);
					}
				});
			}

			month=req.body.day.substring(0,7);
			loadData(month,res,req);

			//将发送记录插入logs表
			var alertQuery=Alert.find({'position':req.body.position}).sort('hour').sort('minute');
			var phonenum;
			User.findOne({'name':req.body.user},function (err,u){if (!err){phonenum=u.phone;}});
			alertQuery.exec(function (err, alerts){
				for (var i=0;i<alerts.length;i++){
					Log.create({
						datetime:req.body.day+" "+alerts[i].hour+":"+alerts[i].minute+":00",
						position:req.body.position,
						name:req.body.user,
						phone:phonenum,
						content:alerts[i].content,
						status:false
					},function(err,log){
						if (!err){console.log(log);}
					});
				}
			});
	});
	
});

router.get('/delete/:id?',function(req,res){
	var id =req.params.id;
	Arrange.findOne({ _id : id } ,
    	function (err,arrange){
       		var day=arrange.day;
       		var position=arrange.position;
       		if (!err){

         		arrange.remove( function(err){
         			//根据日期和岗位删除Log中所有该日期和岗位的且未发送的排班通知记录
         			var sday=day + " 00:00:00";
					var eday=day + " 23:59:59";
					Log.remove({datetime: {$gte:new Date(sday),$lte:new Date(eday)},position:position,status:false},function(err){if (!err){}});
    
         		});
         		var month=day.substring(0,7);
         		res.redirect("/arranges/"+month);
	 		}
 		});
});
router.get('/deletebyday/:day?',function(req,res){
	var day =req.params.day;
	Arrange.remove({day:day},function(err){
		if (!err){	
			//根据日期删除Log中所有该日期的且未发送的排班通知记录。
			var sday=day + " 00:00:00";
			var eday=day + " 23:59:59";
			Log.remove({datetime: {$gte:new Date(sday),$lte:new Date(eday)},status:false},function(err){if (!err){}});

			var month=day.substring(0,7);
         	res.redirect("/arranges/"+month);
		}
	});
});

router.get('/show/:month?', function(req, res, next) {
	var month=req.params.month;
	var arrangeQuery = Arrange.find({day: new RegExp(month,'i')}).sort('day').sort('position');
	arrangeQuery.exec(function (err, arranges){
		if (!err){
			var posLists = new Array();
			var posList = function(day,week,p1,p2,p3,p4,p5,p6){
				this.day=day;
				this.week=week;
				this.p1=p1;
				this.p2=p2;
				this.p3=p3;
				this.p4=p4;
				this.p5=p5;
				this.p6=p6;
			};
			posLists[0]=new posList();
			for (i=0;i<arranges.length;i++){
				if (arranges[i].day!=posLists[posLists.length-1].day){
					posLists[posLists.length]=new posList();
					posLists[posLists.length-1].day=arranges[i].day;
					posLists[posLists.length-1].week=arranges[i].week;
					
				}
				switch(arranges[i].position){
			  	 	case '93.4频率':
			  	 	 	posLists[posLists.length-1].p1 = arranges[i].user;
			  	 	 	break;		
			  	 	case '90.9频率':
			  	 		posLists[posLists.length-1].p2 = arranges[i].user;
			  	 	 	break;
			  	 	case '新媒体A':
			  	 		posLists[posLists.length-1].p3 = arranges[i].user;
			  	 	 	break;
			  	 	case '新媒体B':
			  	 		posLists[posLists.length-1].p4 = arranges[i].user;
			  	 	 	break;
		  	 	 	case '转录(☆)':
		  	 			posLists[posLists.length-1].p5 = arranges[i].user;
		  	 	 		break;
		  	 	 	case '新闻加强':
		  	 			posLists[posLists.length-1].p6 = arranges[i].user;
		  	 	 		break; 			
				}
			}
			res.render('lists', { alllist:posLists ,month:month });
		}
		else {
			res.send('获取数据失败！');
		} 
	});
});

module.exports = router;
