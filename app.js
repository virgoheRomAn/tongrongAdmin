var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');


var index = require('./routes/index');
var menu = require('./routes/menu');
var data = require('./routes/common/data');
var file = require('./routes/common/file');
var approval = require('./routes/approval');
var yxPledgeContractBatch = require('./routes/order/yx_pledge_contract_batch');
var deduct = require('./routes/tools/deduct');
var assignTask = require('./routes/task/assign_task');
var order = require('./routes/biz/order');
var pay = require('./routes/biz/pay');
var repayment = require('./routes/biz/repayment');
var password = require('./routes/system/password');
var operator = require('./routes/system/permission/operator');
var role = require('./routes/system/permission/role');

var customer = require('./routes/user/customer');
var submission = require('./routes/biz/submission');


var grade = require('./routes/risk/grade');
var blacklist = require('./routes/risk/blacklist');

var product = require("./routes/product/index");
var productForm = require("./routes/product/settings/form");

var overdue = require('./routes/biz/overdue');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser('session'));
app.use(session({
    secret: 'session',//与cookieParser中的一致
    resave: true,
    saveUninitialized: true
}));

app.use('/', index);
app.use('/menu', menu);
app.use('/common/data', data);
app.use('/common/file', file);
app.use('/approval', approval);
app.use('/order/yx_pledge_contract_batch', yxPledgeContractBatch);
app.use('/tools/deduct', deduct);
app.use('/task/assign_task', assignTask);
app.use('/biz/order', order);
app.use('/biz/pay', pay);
app.use('/biz/repayment', repayment);
app.use('/system/system', password);
app.use('/system/permission/operator', operator);
app.use('/system/permission/role', role);

app.use('/user/customer', customer);
app.use('/biz/submission', submission);

app.use('/product/classify', product);
app.use('/product/settings', productForm);


app.use('/risk/grade', grade);
app.use('/risk/blacklist', blacklist);
app.use('/biz/overdue', overdue);
// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   var err = new Error('Not Found');
//   err.status = 404;
//   next(err);
// });

// error handler
app.use(function (err, req, res, next) {
    // // set locals, only providing error in development
    // res.locals.message = err.message;
    // res.locals.error = req.app.get('env') === 'development' ? err : {};
    //
    // // render the error page
    // res.status(err.status || 500);
    // res.render('error');
    console.error("Error:", err);
    next(err);
});

var server = app.listen(3000, function () {

    var host = server.address().address;
    var port = server.address().port;
    var env = process.env.NODE_ENV;

    console.log("环境:", env);
    console.log("应用实例，访问地址为 http://%s:%s", host, port)

});
//module.exports = app;
