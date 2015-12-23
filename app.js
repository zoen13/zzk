var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

//引入验证用户登录所需要的组件
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var session = require('express-session');

passport.use('local', new LocalStrategy(
    function (username, password, done) {
        var user = {
            id: '1',
            username: 'admin',
            password: '65223'
        }; // 可以配置通过数据库方式读取登陆账号

        if (username !== user.username) {
            return done(null, false, { message: 'Incorrect username.' });
        }
        if (password !== user.password) {
            return done(null, false, { message: 'Incorrect password.' });
        }

        return done(null, user);
    }
));

passport.serializeUser(function (user, done) {//保存user对象
    done(null, user);//可以通过数据库方式操作
});

passport.deserializeUser(function (user, done) {//删除user对象
    done(null, user);//可以通过数据库方式操作
});

var db = require('./model/db');

var routes = require('./routes/index');
var users = require('./routes/users');
var alerts = require('./routes/alerts');
var arranges = require('./routes/arranges');
var logs = require('./routes/logs');
var login =require('./routes/login');
var logout = require('./routes/logout');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//初始化cookie和passport
app.use(session({secret: 'radio.smgtech.net', cookie: { maxAge: 7200000 }}));
app.use(passport.initialize());
app.use(passport.session());

//将对login路由的post请求使用passport的local方式进行验证，成功则跳转主页，验证失败则仍回到登陆页
app.post('/login',
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/login'
    }));
//将网站的所有路由的请求都使用isLoggedIn来验证是否已经成功登录
app.all('/', isLoggedIn);
app.all('/users', isLoggedIn);
app.all('/alerts', isLoggedIn);
app.all('/arranges', isLoggedIn);
app.all('/arranges/:month?', isLoggedIn);
app.all('/logs', isLoggedIn);
//判断用户是否已登录的函数
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/login');
}

app.use('/',routes);
app.use('/users', users);
app.use('/alerts', alerts);
app.use('/arranges',arranges);
app.use('/arranges/:month?',arranges);
app.use('/logs',logs);
app.use('/login',login);
app.use('/logout',logout);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('404', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('404', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
