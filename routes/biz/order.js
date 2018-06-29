var express = require('express');
var router = express.Router();
var request = require('request');
var moment = require('moment');
var config = require('config');
var path = require('path');
var routerUtil = require(path.join(process.cwd(), '/utils/router_util'));
var regionUtil = require(path.join(process.cwd(), '/utils/region_util'));
var dictUtil = require(path.join(process.cwd(), '/utils/dict_util'));
var Decimal = require('decimal');
var nodeExcel = require('excel-export');

//合同列表页面
router.get('/list', function(req, res, next) {
    var menuId = req.query.menuId;
    routerUtil.renderHtml(req, res, menuId, 'biz/order/list.ejs');
});

router.get('/list_other_data', function(req, res, next) {
    var data = new Object();
    data.dict = req.session.dict;
    res.send(data);
});

//合同列表数据
router.get('/list_data', function(req, res, next) {
    var start = req.query.start;
    var length = req.query.length;
    var page = parseInt(start/length) + 1;
    var requestData = {
        'page':page,
        'limit':length
    };
    if(req.query.orderStatus){
        requestData.orderStatus = req.query.orderStatus;
    }
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
                for(var j=0; j<dict.length; j++){
                    if(dict[j].typeCode == 'ORDER_STATUS' && dict[j].code == dataObj.orderStatus){
                        dataObj.orderStatus = dict[j].codeDesc;
                    }
                    if(dict[j].typeCode == 'CHILD_PRODUCT' && dict[j].code == dataObj.childProduct){
                        dataObj.childProduct = dict[j].codeDesc;
                    }
                    if(dict[j].typeCode == 'BIZ_SOURCE' && dict[j].code == dataObj.source){
                        dataObj.source = dict[j].codeDesc;
                    }
                }

                var region = req.session.region;
                if(dataObj.city){
                    var city = regionUtil.getCityById(region, dataObj.city);
                    dataObj.city = city.cityName;
                }
                dataObj.createTime = moment(+dataObj.createTime).format('YYYY-MM-DD HH:mm:ss');
                dataObj.account = Decimal(dataObj.account).div(Decimal('100')).toNumber().toFixed(0);
                if(dataObj.riskAccount){
                    dataObj.riskAccount = Decimal(dataObj.riskAccount).div(Decimal('100')).toNumber().toFixed(0);
                }else{
                    dataObj.riskAccount = "";
                }
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
        'limit':'1000'
    };
    if(req.query.orderStatus){
        requestData.orderStatus = req.query.orderStatus;
    }
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
            var dict = req.session.dict;
            var dataList = data.list;
            for(var i=0; i<dataList.length; i++){
                var dataObj = dataList[i];
                for(var j=0; j<dict.length; j++){
                    if(dict[j].typeCode == 'ORDER_STATUS' && dict[j].code == dataObj.orderStatus){
                        dataObj.orderStatus = dict[j].codeDesc;
                    }
                    if(dict[j].typeCode == 'CHILD_PRODUCT' && dict[j].code == dataObj.childProduct){
                        dataObj.childProduct = dict[j].codeDesc;
                    }
                    if(dict[j].typeCode == 'BIZ_SOURCE' && dict[j].code == dataObj.source){
                        dataObj.source = dict[j].codeDesc;
                    }
                }

                var region = req.session.region;
                if(dataObj.city){
                    var city = regionUtil.getCityById(region, dataObj.city);
                    dataObj.city = city.cityName;
                }
                dataObj.createTime = moment(+dataObj.createTime).format('YYYY-MM-DD HH:mm:ss');
                dataObj.account = Decimal(dataObj.account).div(Decimal('100')).toNumber().toFixed(0);
                if(dataObj.riskAccount){
                    dataObj.riskAccount = Decimal(dataObj.riskAccount).div(Decimal('100')).toNumber().toFixed(0);
                }else{
                    dataObj.riskAccount = "";
                }
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
                caption:'申请人',
                captionStyleIndex: 1,
                type:'string',
                width:15
            },
            {
                caption:'申请渠道',
                captionStyleIndex: 1,
                type:'string',
                width:15
            },
            {
                caption:'申请产品',
                captionStyleIndex: 1,
                type:'string',
                width:15
            },
            {
                caption:'申请金额（元）',
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
                caption:'申请时间',
                captionStyleIndex: 1,
                type:'string',
                width:30
            },
            {
                caption:'状态',
                captionStyleIndex: 1,
                type:'string',
                width:15
            },

        ];
        var rowsArray = [];
        for(var i=0; i<listData.length; i++){
            var dataObj = listData[i];
            rowsArray.push([dataObj.orderId, dataObj.name, dataObj.tenant, dataObj.childProduct, dataObj.account, dataObj.finalAccount, dataObj.createTime, dataObj.orderStatus])
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
    routerUtil.renderHtml(req, res, menuId, 'biz/order/form.ejs', {"orderId":orderId});
});

router.get('/form_data', function(req, res, next) {
    var orderId = req.query.orderId;
    var data = new Object();
    data.region = req.session.region;
    data.dict = req.session.dict;
    data.products = req.session.products;

    var requestData = {
        "orderId": orderId
    }
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
        var result = body.data;
        data.order = result;
        res.send(data);
    });
});


router.get('/form_data', function(req, res, next) {
    var orderId = req.query.orderId;
    var data = new Object();
    data.region = req.session.region;
    data.dict = req.session.dict;
    data.products = req.session.products;

    var requestData = {
        "orderId": orderId
    }
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
        var result = body.data;
        data.order = result;
        res.send(data);
    });
});

router.get('/repayment_schedule_list_data', function(req, res, next) {
    var orderId = req.query.orderId;
    var url = config.get('integration.account.url.root') + config.get('integration.account.url.repaymentSchedule.search')+ '?orderId=' + orderId;

    request(url, function (error, response, body) {
        var result = JSON.parse(body).data;
        var dict = req.session.dict;
        for(var i=0; i<result.length; i++){
            if(result[i].beginCount){
                result[i].beginCount = Decimal(result[i].beginCount).div(Decimal('100')).toNumber().toFixed(2);
            }
            if(result[i].endCount){
                result[i].endCount = Decimal(result[i].endCount).div(Decimal('100')).toNumber().toFixed(2);
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

            result[i].status = dictUtil.getDictDescByCode(dict, 'REPAYMENT_STATUS', result[i].status);
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

module.exports = router;
