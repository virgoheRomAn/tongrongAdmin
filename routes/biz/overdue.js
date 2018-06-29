var express = require('express');
var router = express.Router();
var path = require('path');
var request = require('request');
var config = require('config');
var routerUtil = require(path.join(process.cwd(), '/utils/router_util'));

router.get('/list', function(req, res, next) {
    var menuId = req.query.menuId;
    routerUtil.renderHtml(req, res, menuId, 'biz/overdue/list.ejs');
});

//列表数据
router.get('/list_data', function(req, res, next) {
    var length = req.query.length;
    var start = req.query.start;
    var page = parseInt(start/length) + 1;
    var requestData = {
        "page": page,
        "limit": length
    }
    var url = config.get('integration.account.url.root') + config.get('integration.account.url.overdue.list');
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
        var dataList = result.list;
        //封装分页结果
        var dataJson = new Object();
        dataJson.draw = req.query.draw;
        dataJson.recordsTotal = result.count;
        dataJson.recordsFiltered = result.count;
        dataJson.data = dataList;
        res.send(dataJson);
    });
});

router.get('/form', function(req, res, next) {
    var menuId = req.query.menuId;
    var orderId = req.query.orderId;
    var loanId = req.query.loanId;
    routerUtil.renderHtml(req, res, menuId, 'biz/overdue/form.ejs',{'orderId':orderId,'loanId':loanId});
});

module.exports = router;
