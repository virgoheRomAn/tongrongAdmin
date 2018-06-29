var express = require('express');
var router = express.Router();
var request = require('request');
var config = require('config');

router.get('/region', function(req, res, next) {
    var regionDatas = regionUtil.getRegionDatas();
    res.send(regionDatas);
});

router.get('/getProductFields', function(req, res, next) {
    var paramStr = '?productCode=' + req.query.productCode + "&childProductCode=" + req.query.childProductCode;
    var url = config.get('integration.data.url.root') + config.get('integration.data.url.product.getProductFields') + paramStr;
    request(url, function (error, response, body) {
        res.send(JSON.parse(body).data);
    })
});

module.exports = router;