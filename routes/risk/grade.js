var express = require('express');
var router = express.Router();
var path = require('path');
var request = require('request');
var config = require('config');
var routerUtil = require(path.join(process.cwd(), '/utils/router_util'));
var dictUtil = require(path.join(process.cwd(), '/utils/dict_util'));

router.get('/list', function(req, res, next) {
    var menuId = req.query.menuId;
    routerUtil.renderHtml(req, res, menuId, 'risk/grade/list.ejs');
});

//列表数据
router.get('/list_data', function(req, res, next) {
    var dict = req.session.dict;
    var requestData = {
        "offset": req.query.start,
        "limit": req.query.length
    }
    var url = config.get('integration.data.url.root') + config.get('integration.data.url.grade.list');
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
        for(var i=0; i<dataList.length; i++){
            dataList[i].codeDesc = dictUtil.getDictDescByCode(dict, dataList[i].typeCode, dataList[i].code);
            dataList[i].typeDesc = dictUtil.getDictTypeDescByCode(dict, dataList[i].typeCode);

        }
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
