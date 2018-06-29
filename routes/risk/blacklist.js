var express = require('express');
var router = express.Router();
var path = require('path');
var request = require('request');
var config = require('config');
var routerUtil = require(path.join(process.cwd(), '/utils/router_util'));

router.get('/list', function(req, res, next) {
    var menuId = req.query.menuId;
    routerUtil.renderHtml(req, res, menuId, 'risk/blacklist/list.ejs');
});

//列表数据
router.get('/list_data', function(req, res, next) {
    var requestData = {
        "offset": req.query.start,
        "limit": req.query.length
    }
    var url = config.get('integration.data.url.root') + config.get('integration.data.url.blacklist.list');
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
        var dataList = result.records;
        //封装分页结果
        var dataJson = new Object();
        dataJson.draw = req.query.draw;
        dataJson.recordsTotal = result.totalAmount;
        dataJson.recordsFiltered = result.totalAmount;
        dataJson.data = dataList;
        res.send(dataJson);
    });
});


module.exports = router;
