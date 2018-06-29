var express = require('express');
var router = express.Router();
var path = require('path');
var request = require('request');
var config = require('config');
var routerUtil = require(path.join(process.cwd(), '/utils/router_util'));

router.get('/list', function(req, res, next) {
    var menuId = req.query.menuId;
    routerUtil.renderHtml(req, res, menuId, 'system/permission/role/list.ejs');
});

//列表数据
router.get('/list_data', function(req, res, next) {
    var paramStr = '?start=' + req.query.start + '&size=' + req.query.length;
    if(req.query.name){
        paramStr = paramStr + "&name=" + req.query.name;
    }
    var url = config.get('integration.permission.url.root') + config.get('integration.permission.url.role.listPage') + paramStr;
    request(encodeURI(url), function (error, response, body) {
        var result = JSON.parse(body).data;
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
module.exports = router;
