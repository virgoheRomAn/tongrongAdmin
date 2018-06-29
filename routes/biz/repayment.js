var express = require('express');
var router = express.Router();
var request = require('request');
var moment = require('moment');
var config = require('config');
var path = require('path');
var routerUtil = require(path.join(process.cwd(), '/utils/router_util'));
var orderHelper = require(path.join(process.cwd(), '/helper/order_helper'));
var Decimal = require('decimal');
var nodeExcel = require('excel-export');

//合同列表页面
router.get('/list', function(req, res, next) {
    var menuId = req.query.menuId;
    routerUtil.renderHtml(req, res, menuId, 'biz/repayment/list.ejs');
});

//合同列表数据
router.get('/list_data', function(req, res, next) {
    var start = req.query.start;
    var length = req.query.length;
    var page = parseInt(start/length) + 1;
    var requestData = {
        'page':page,
        'limit':length,
        'orderStatus':'3'
    };
    if(req.query.name){
        requestData.name = req.query.name;
    }
    if(req.query.tenant){
        requestData.tenant = req.query.tenant;
    }
    if(req.query.startTime){
        requestData.startTime = req.query.startTime;
    }
    var url = config.get('integration.order.url.root') + config.get('integration.order.url.order.findOrder');
    request({
        url: url,
        method: 'POST',
        json: true,
        headers: {
            'content-type': 'application/json',
        },
        body: requestData
    }, function(error, response, body) {
        var data = body.data;
        var listData = [];

        var count = 0;
        if(data){
            count = data.count;
            var dict = req.session.dict;
            var dataList = data.list;
            for(var i=0; i<dataList.length; i++){
                var dataObj = dataList[i];
                dataObj.createTime = moment(+dataObj.createTime).format('YYYY-MM-DD HH:mm:ss');
                if(dataObj.finalAccount){
                    dataObj.finalAccount = Decimal(dataObj.finalAccount).div(Decimal('100')).toNumber().toFixed(0);
                }else{
                    dataObj.finalAccount = "";
                }
                if(dataObj.tenant){
                    if(dataObj.tenant=='1'){
                        dataObj.tenant = '摩尔龙';
                    }
                    if(dataObj.tenant=='2'){
                        dataObj.tenant = '惠理';
                    }
                    if(dataObj.tenant=='3'){
                        dataObj.tenant = '爱屋吉屋';
                    }
                }
                listData.push(dataObj);
            }
        }

        //封装分页结果
        var dataJson = new Object();
        dataJson.draw = req.query.draw;
        dataJson.recordsTotal = count;
        dataJson.recordsFiltered = count;
        dataJson.data = listData;
        res.send(dataJson);
    });
});


//合同列表数据
router.get('/list_export_excel', function(req, res, next) {
    var requestData = {
        'page':'1',
        'limit':'1000',
        'orderStatus':'3'
    };

    if(req.query.name){
        requestData.name = req.query.name;
    }
    if(req.query.tenant){
        requestData.tenant = req.query.tenant;
    }
    if(req.query.startTime){
        requestData.startTime = req.query.startTime;
    }

    var url = config.get('integration.order.url.root') + config.get('integration.order.url.order.findOrder');
    request({
        url: url,
        method: 'POST',
        json: true,
        headers: {
            'content-type': 'application/json',
        },
        body: requestData
    }, function(error, response, body) {
        var data = body.data;
        var listData = [];
        if(data){
            var dataList = data.list;
            for(var i=0; i<dataList.length; i++){
                var dataObj = dataList[i];
                dataObj.createTime = moment(+dataObj.createTime).format('YYYY-MM-DD HH:mm:ss');
                if(dataObj.finalAccount){
                    dataObj.finalAccount = Decimal(dataObj.finalAccount).div(Decimal('100')).toNumber().toFixed(0);
                }else{
                    dataObj.finalAccount = "";
                }
                if(dataObj.tenant){
                    if(dataObj.tenant=='1'){
                        dataObj.tenant = '摩尔龙';
                    }
                    if(dataObj.tenant=='2'){
                        dataObj.tenant = '惠理';
                    }
                    if(dataObj.tenant=='3'){
                        dataObj.tenant = '爱屋吉屋';
                    }
                }
                listData.push(dataObj);
            }
        }

        var conf ={};
        conf.cols = [
            {
                caption:'申请编号',
                captionStyleIndex: 1,
                type:'string',
                width:50
            },
            {
                caption:'客户姓名',
                captionStyleIndex: 1,
                type:'string',
                width:15
            },
            {
                caption:'身份证号',
                captionStyleIndex: 1,
                type:'string',
                width:15
            },
            {
                caption:'放款金额（元）',
                captionStyleIndex: 1,
                type:'string',
                width:15
            },
            {
                caption:'银行卡号',
                captionStyleIndex: 1,
                type:'string',
                width:30
            },
            {
                caption:'申请渠道',
                captionStyleIndex: 1,
                type:'string',
                width:15
            },
            {
                caption:'申请时间',
                captionStyleIndex: 1,
                type:'string',
                width:15
            }
        ];
        var rowsArray = [];
        for(var i=0; i<listData.length; i++){
            var dataObj = listData[i];
            rowsArray.push([dataObj.orderId, dataObj.name, dataObj.idNo, dataObj.finalAccount, dataObj.bankCardNo, dataObj.tenant, dataObj.createTime])
        }
        conf.rows = rowsArray;
        var result = nodeExcel.execute(conf);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats');
        res.setHeader("Content-Disposition", "attachment; filename=" + "report.xlsx");
        res.end(result, 'binary');
    });
});


router.get('/form', function(req, res, next) {
    var menuId = req.query.menuId;
    var orderId = req.query.orderId;
    routerUtil.renderHtml(req, res, menuId, 'biz/repayment/form.ejs',{'orderId':orderId});
});

router.get('/form_data', function(req, res, next) {
    var orderId = req.query.orderId;
    var requestData = {
        'orderId':orderId
    };
    var url = config.get('integration.order.url.root') + config.get('integration.order.url.order.findOrderById');
    request({
        url: url,
        method: 'POST',
        json: true,
        headers: {
            'content-type': 'application/json',
        },
        body: requestData
    }, function(error, response, body) {
        var data = body.data;
        data = orderHelper.dataFormat(req, data);
        res.send(data);
    });
});

router.get('/repayment_schedule_list_data', function(req, res, next) {
    var orderId = req.query.orderId;
    var url = config.get('integration.account.url.root') + config.get('integration.account.url.repaymentSchedule.search') + "?orderId=" + orderId;
    request(url, function (error, response, body) {
        var result = JSON.parse(body).data;
        for(var i=0; i<result.length; i++){
            if(result[i].beginCount){
                result[i].beginCount = Decimal(result[i].beginCount).div(Decimal('100')).toNumber().toFixed(2);
            }
            if(result[i].repaymentAmount){
                result[i].repaymentAmount = Decimal(result[i].repaymentAmount).div(Decimal('100')).toNumber().toFixed(2);
            }
            if(result[i].principalAmount){
                result[i].principalAmount = Decimal(result[i].principalAmount).div(Decimal('100')).toNumber().toFixed(2);
            }
            if(result[i].interestAmount){
                result[i].interestAmount = Decimal(result[i].interestAmount).div(Decimal('100')).toNumber().toFixed(2);
            }
            if(result[i].endCount){
                result[i].endCount = Decimal(result[i].endCount).div(Decimal('100')).toNumber().toFixed(2);
            }
        }
        //封装分页结果
        var dataJson = new Object();
        dataJson.draw = req.query.draw;
        dataJson.recordsTotal = result.length;
        dataJson.recordsFiltered = result.length;
        dataJson.data = result;
        res.send(dataJson);
    });
});



router.get('/repayment_schedule_overdue_list_data', function(req, res, next) {
    var loanId = req.query.loanId;
    var orderId = req.query.orderId;
    var requestData = {
        'loanId':loanId
    };
    var url = config.get('integration.account.url.root') + config.get('integration.account.url.overdue.findRepaymetList');
    request({
        url: url,
        method: 'POST',
        json: true,
        headers: {
            'content-type': 'application/json',
        },
        body: requestData
    }, function(error, response, body) {
        var data = body.data;

        var url2 = config.get('integration.account.url.root') + config.get('integration.account.url.repaymentSchedule.search') + "?orderId=" + orderId;
        request(url2, function (error, response, body) {
            var result = JSON.parse(body).data;
            for(var i=0; i<result.length; i++){
                if(result[i].beginCount){
                    result[i].beginCount = Decimal(result[i].beginCount).div(Decimal('100')).toNumber().toFixed(2);
                }
                if(result[i].repaymentAmount){
                    result[i].repaymentAmount = Decimal(result[i].repaymentAmount).div(Decimal('100')).toNumber().toFixed(2);
                }
                if(result[i].principalAmount){
                    result[i].principalAmount = Decimal(result[i].principalAmount).div(Decimal('100')).toNumber().toFixed(2);
                }
                if(result[i].interestAmount){
                    result[i].interestAmount = Decimal(result[i].interestAmount).div(Decimal('100')).toNumber().toFixed(2);
                }
                if(result[i].endCount){
                    result[i].endCount = Decimal(result[i].endCount).div(Decimal('100')).toNumber().toFixed(2);
                }

                result[i].overStatue = '0';
                for(var j=0; j<data.length; j++){
                    if(data[j].repaymentId==result[i].id){
                        result[i].overStatue = '1';
                    }
                }
            }
            //封装分页结果
            var dataJson = new Object();
            dataJson.draw = req.query.draw;
            dataJson.recordsTotal = result.length;
            dataJson.recordsFiltered = result.length;
            dataJson.data = result;
            res.send(dataJson);
        });
    });


});





router.get('/repay_list_data', function(req, res, next) {
    var requestData = {
        'orderId':req.query.orderId
    };
    var url = config.get('integration.account.url.root') + config.get('integration.account.url.pay.find');
    request({
        url: url,
        method: 'POST',
        json: true,
        headers: {
            'content-type': 'application/json',
        },
        body: requestData
    }, function(error, response, body) {
        var result = body.data;
        for(var i=0; i<result.length; i++){
            if(result[i].repaymentTotalAmount){
                result[i].repaymentTotalAmount = Decimal(result[i].repaymentTotalAmount).div(Decimal('100')).toNumber().toFixed(2);
            }
            if(result[i].principalTotalAmount){
                result[i].principalTotalAmount = Decimal(result[i].principalTotalAmount).div(Decimal('100')).toNumber().toFixed(2);
            }
            if(result[i].interestTotalAmount){
                result[i].interestTotalAmount = Decimal(result[i].interestTotalAmount).div(Decimal('100')).toNumber().toFixed(2);
            }
        }
        //封装分页结果
        var dataJson = new Object();
        dataJson.draw = req.query.draw;
        dataJson.recordsTotal = result.length;
        dataJson.recordsFiltered = result.length;
        dataJson.data = result;
        res.send(dataJson);
    });
});

router.post('/form_save', function(req, res, next) {
    var userInfo = req.session.userInfo;
    var orderId = req.body.orderId;
    var principal = req.body.principal*100;
    var interest = req.body.interest*100;
    var endDate = req.body.endDate;
    var tenant = req.body.tenant;
    var requestData = {
        'orderId':orderId,
        'principal':principal,
        'interest':interest,
        'endDate':endDate,
        'operateName':userInfo.userName,
        'tenant':tenant
    };
    var url = config.get('integration.account.url.root') + config.get('integration.account.url.repaymentSchedule.repay');
    request({
        url: url,
        method: 'POST',
        json: true,
        headers: {
            'content-type': 'application/json',
        },
        body: requestData
    }, function(error, response, body) {
        var code = body.code;
        var data = new Object();
        if(code=='0'){
            data.code = '0';
        }else{
            data.code = '-1';
            data.message = body.message;
        }
        res.send(data);
    });
});
module.exports = router;
