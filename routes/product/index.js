var express = require('express');
var router = express.Router();
var path = require('path');
var request = require('request');
var config = require('config');
var routerUtil = require(path.join(process.cwd(), '/utils/router_util'));

router.get('/list', function (req, res) {
    var menuId = req.query.menuId;
    var url = config.get('integration.data.url.root') + config.get('integration.data.url.product.getProducts');
    request({
        url: url,
        method: 'POST',
        json: true,
        headers: {
            'content-type': 'application/json'
        }
    }, function (error, response, body) {
        var data = body;
        routerUtil.renderHtml(req, res, menuId, 'product/classify/list.ejs', {
            listDataArray: body.data
        });
    });
});

router.post('/createProduct', function (req, res) {
    var data = req.body;
    var url = config.get('integration.data.url.root') + config.get('integration.data.url.product.addProduct');
    var params = {
        productCode: data.productCode,
        productName: data.productName,
        parentProductName: data.parentProductName,
        parentProductCode: data.parentProductCode
    };
    request({
        url: url,
        method: 'POST',
        json: true,
        headers: {
            'content-type': 'application/json'
        },
        body: params
    }, function (error, response, body) {
        res.send(body)
    });
});

router.post('/updateProduct', function (req, res) {
    var data = req.body;
    var url = config.get('integration.data.url.root') + config.get('integration.data.url.product.updateProductName');
    var params = {
        productCode: data.productCode,
        productName: data.productName
    };
    request({
        url: url,
        method: 'POST',
        json: true,
        headers: {
            'content-type': 'application/json'
        },
        body: params
    }, function (error, response, body) {
        res.send(body)
    });
});

module.exports = router;
