var express = require('express');
var path = require('path');
var router = express.Router();
var request = require('request');
var config = require('config');
var moment = require('moment');
var dictUtil = require(path.join(process.cwd(), '/utils/dict_util'));

router.get('/order_file_list', function(req, res, next) {
    var orderId = req.query.orderId;
    var requestData = {
        'orderId':orderId,
        'page':'1',
        'limit':'1000'
    };
    var url = config.get('integration.order.url.root') + config.get('integration.order.url.order.findFile');

    request({
        url: url,
        method: 'POST',
        json: true,
        headers: {
            'content-type': 'application/json',
        },
        body: requestData
    }, function(error, response, body) {
        var result = [];
        if(body.data){
            result = body.data.list;
            var dict = req.session.dict;
            for(var i=0; i<result.length; i++){
                result[i].createTime = moment(+result[i].createTime).format('YYYY-MM-DD HH:mm:ss');
                result[i].fileType = dictUtil.getDictDescByCode(dict, 'FILE_TYPE', result[i].fileType);
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

router.get('/user_file_list', function(req, res, next) {
    var userId = req.query.userId;
    var requestData = {
        'userId':userId,
        'page':'1',
        'limit':'1000'
    };
    var url = config.get('integration.usercenter.url.root') + config.get('integration.usercenter.url.user.findFile');

    request({
        url: url,
        method: 'POST',
        json: true,
        headers: {
            'content-type': 'application/json',
        },
        body: requestData
    }, function(error, response, body) {
        var result = [];
        if(body.data){
            result = body.data.list;
            var dict = req.session.dict;
            for(var i=0; i<result.length; i++){
                result[i].createTime = moment(+result[i].createTime).format('YYYY-MM-DD HH:mm:ss');
                result[i].fileType = dictUtil.getDictDescByCode(dict, 'FILE_TYPE', result[i].fileType);
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


router.get('/file_download', function(req, res, next) {
    var fileUrl = req.query.fileUrl;
    var requestData = {
        'fileToken':fileUrl
    };
    var url = config.get('integration.file.url.root') + config.get('integration.file.url.file.download');

    request({
        url: url,
        method: 'POST',
        json: true,
        headers: {
            'content-type': 'application/json',
        },
        body: requestData
    }, function(error, response, body) {
        res.send(body.data.fileToken);
    });
});

module.exports = router;