var mongoose = require('mongoose');
dbURI = 'mongodb://localhost:30000/zzk';
mongoose.connect(dbURI);

mongoose.connection.on('connected', function () {
     console.log('Mongoose connected to ' + dbURI);
});

mongoose.connection.on('error',function (err) {
     console.log('Mongoose connection error: ' + err);
});

var userSchema = new mongoose.Schema({
	name:String,
	email:String,
	phone:String,
	shortnum:String
});

mongoose.model('User',userSchema);

var alertSchema = new mongoose.Schema({
	position:String,
	hour:String,
	minute:String,
	content:String
});

mongoose.model('Alert',alertSchema);


var arrangeSchema = new mongoose.Schema({
	day:String,
	week:String,
	position:String,
	user:[String],
	inserttime:{ type: Date, default: Date.now }
});

mongoose.model('Arrange',arrangeSchema);

var logSchema = new mongoose.Schema({
	datetime:Date,
	position:String,
	name:String,
	phone:String,
	content:String,
	status:Boolean
});

mongoose.model('Log',logSchema);