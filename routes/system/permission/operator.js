var express = require('express');
var router = express.Router();
var path = require('path');
var request = require('request');
var config = require('config');
var routerUtil = require(path.join(process.cwd(), '/utils/router_util'));
var dictUtil = require(path.join(process.cwd(), '/utils/dict_util'));
var async = require('async');

router.get('/list', function(req, res, next) {
    var menuId = req.query.menuId;
    routerUtil.renderHtml(req, res, menuId, 'system/permission/operator/list.ejs');
});

//列表数据
router.get('/list_data', function(req, res, next) {
    var dict = req.session.dict;
    var paramStr = '?start=' + req.query.start + '&size=' + req.query.length;
    if(req.query.name){
        paramStr = paramStr + "&name=" + req.query.name;
    }
    if(req.query.userName){
        paramStr = paramStr + "&userName=" + req.query.userName;
    }
    var url = config.get('integration.permission.url.root') + config.get('integration.permission.url.operator.listPage') + paramStr;
    request(encodeURI(url), function (error, response, body) {
        var result = JSON.parse(body).data;
        var dataList = result.list;
        for(var i=0; i<dataList.length; i++){
            dataList[i].isValid = dictUtil.getDictDescByCode(dict, 'IS_VALID', dataList[i].isValid);
        }

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
    var operatorId = req.query.operatorId;
    routerUtil.renderHtml(req, res, menuId, 'system/permission/operator/form.ejs',{'operatorId':operatorId});
});

router.get('/form_data', function(req, res, next) {
    var data = new Object();
    var dict = req.session.dict;
    data.isValidItems = dictUtil.getDictItemsByTypeCode(dict, 'IS_VALID');

    async.parallel([
        function(callback){
            var operatorId = req.query.operatorId;
            if(operatorId){
                var url = config.get('integration.permission.url.root') + config.get('integration.permission.url.operator.findById') + "?operatorId=" + operatorId;
                request(url, function (error, response, body) {
                    data.formData = JSON.parse(body).data;
                    callback(null);
                });
            }else{
                callback(null);
            }

        },
        function(callback){
            var url = config.get('integration.permission.url.root') + config.get('integration.permission.url.role.listAll');
            request(url, function (error, response, body) {
                data.roleData = JSON.parse(body).data;
                callback(null);
            });
        }
    ],
    function(err, results){
        res.send(data);
    });
});

router.post('/form_save', function(req, res, next) {
    var requestData = {
        'name':req.body.name,
        'isValid':req.body.isValid,
        'companyId':'0',
        'roleIds':req.body.roleIds
    };
    if(req.body.operatorId){
        requestData.operatorId = req.body.operatorId;
    }
    if(req.body.userName){
        requestData.userName = req.body.userName;
    }
    var url = config.get('integration.permission.url.root') + config.get('integration.permission.url.operator.save');

    request({
        url: url,
        method: 'POST',
        json: true,
        headers: {
            'content-type': 'application/json',
        },
        body: requestData
    }, function(error, response, body) {
        res.send(body);
    });
});

module.exports = router;
