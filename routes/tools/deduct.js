var express = require('express');
var router = express.Router();
var path = require('path');
var routerUtil = require(path.join(process.cwd(), '/utils/router_util'));
var request = require('request');
var config = require('config');
var uuid = require('node-uuid');
var moment = require('moment');
var Decimal = require('decimal');
var dictUtil = require(path.join(process.cwd(), '/utils/dict_util'));

//列表页面
router.get('/list', function(req, res, next) {
    var menuId = req.query.menuId;
    routerUtil.renderHtml(req, res, menuId, 'tools/deduct/list.ejs');
});

//合同列表数据
router.get('/list_data', function(req, res, next) {
    var length = req.query.length;
    var start = req.query.start;
    var page = parseInt(start/length) + 1;
    var requestData = {
        "page": page,
        "limit": length
    }

    // var url = 'http://payment.test.api.tongrong/payment/deduct/findDeduct';
    var url = config.get('integration.payment.root') + config.get('integration.payment.url.deduct.findDeduct');
    request({
        url: url,
        method: 'POST',
        json: true,
        headers: {
            'content-type': 'application/json',
        },
        body: requestData
    }, function(error, response, body) {
        var records = body.data.list;
        var dict = req.session.dict;
        records.forEach(function(item,index){
            var createTime = item.createTime;
            item.createTimeStr = moment(createTime).format('YYYY-MM-DD HH:mm:ss');
            item.amount = Decimal(item.amount).div(Decimal('100')).toNumber().toFixed(2);
            item.status = dictUtil.getDictDescByCode(dict, 'TASK_STATUS', item.status);
        });

        //封装分页结果
        var dataJson = new Object();
        dataJson.draw = req.query.draw;
        dataJson.recordsTotal = body.data.count;
        dataJson.recordsFiltered = body.data.count;
        dataJson.data = records;
        res.send(dataJson);
    });
});

//新增合同表单页
router.get('/form', function(req, res, next) {
    var menuId = req.query.menuId;
    routerUtil.renderHtml(req, res, menuId, 'tools/deduct/form.ejs');
});

//合同列表数据
router.post('/save', function(req, res, next) {
    var data = new Object();
    var validateCode = config.get('validateCode');
    var validateCode2 = req.body.validateCode;
    if(validateCode != validateCode2){
        data.code = '-1';
        data.message = '校验码有误';
        res.send(data);
        return;
    }

    var url = config.get('integration.payment.root') + config.get('integration.payment.url.deduct.send');
    var paramObject = new Object();
    paramObject.requestNo = uuid.v1().replace(/-/g,'');
    paramObject.invokeSystem = '1001';
    paramObject.name = req.body.name;
    paramObject.idCardNo = req.body.idCardNo;
    paramObject.bankCardNo = req.body.bankCardNo;
    paramObject.idType = '0';
    //金额单位转换成分
    paramObject.amount = Decimal(req.body.amount).mul(Decimal('100')).toNumber();
    paramObject.mobilePhone = req.body.mobilePhone;
    paramObject.bankName = req.body.bankName;



    request({
        url: url,
        method: 'POST',
        json: true,
        headers: {
            'content-type': 'application/json',
        },
        body: paramObject
    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            var code = body.code;

            if(code=='0'){
                data.code = '0';
            }else{
                data.code = '-1';
                data.message = body.message;
            }
            res.send(data);
        }
    });

});


//新增合同表单页
router.get('/form2', function(req, res, next) {
    var menuId = req.query.menuId;
    routerUtil.renderHtml(req, res, menuId, 'tools/deduct/form2.ejs');
});


module.exports = router;
