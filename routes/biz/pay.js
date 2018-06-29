var express = require('express');
var router = express.Router();
var request = require('request');
var moment = require('moment');
var config = require('config');
var path = require('path');
var routerUtil = require(path.join(process.cwd(), '/utils/router_util'));
var dictUtil = require(path.join(process.cwd(), '/utils/dict_util'));
var Decimal = require('decimal');

router.get('/list', function(req, res, next) {
    var menuId = req.query.menuId;
    routerUtil.renderHtml(req, res, menuId, 'biz/pay/list.ejs');
});

router.get('/list_data', function(req, res, next) {
    var start = req.query.start;
    var length = req.query.length;
    var page = parseInt(start/length) + 1;
    var requestData = {
        'page':page,
        'limit':length
    };
    var url = config.get('integration.payment.root') + config.get('integration.payment.url.pay.findPayTask');
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
        var dataList = data.list;
        var dict = req.session.dict;
        for(var i=0; i<dataList.length; i++){
            dataList[i].status = dictUtil.getDictDescByCode(dict, 'TASK_STATUS', dataList[i].status);
            dataList[i].createTime = moment(+dataList[i].createTime).format('YYYY-MM-DD HH:mm:ss');
            dataList[i].amount = Decimal(dataList[i].amount).div(Decimal('100')).toNumber().toFixed(2);
        }

        //封装分页结果
        var dataJson = new Object();
        dataJson.draw = req.query.draw;
        dataJson.recordsTotal = data.count;
        dataJson.recordsFiltered = data.count;
        dataJson.data = dataList;
        res.send(dataJson);
    });
});






module.exports = router;
