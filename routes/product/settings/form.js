var express = require('express');
var router = express.Router();
var path = require('path');
var request = require('request');
var config = require('config');
var routerUtil = require(path.join(process.cwd(), '/utils/router_util'));
var _ = require('lodash');

router.get('/form', function (req, res) {
    var menuId = req.query.menuId;
    var url = config.get('integration.data.url.root') + config.get('integration.data.url.product.productProp');
    request({
        url: url,
        method: 'POST',
        json: true,
        headers: {
            'content-type': 'application/json'
        },
        body: {
            productCode: req.query.pid
        }
    }, function (error, response, body) {
        var data = body;
        var dict = req.session.dict;
        var paramsData = _.cloneDeep(data.data);

        paramsData.productPO[0].totalLimit /= 100;
        paramsData.productPO[0].singleDownLimit /= 100;
        paramsData.productPO[0].singleUpLimit /= 100;

        if (data.code === "0") {
            routerUtil.renderHtml(req, res, menuId, 'product/settings/form.ejs', {
                formDataList: paramsData
            });
        } else {
            res.send(data.message);
        }
    });
});

router.post('/formList', function (req, res) {
    var url = config.get('integration.data.url.root') + config.get('integration.data.url.product.productProp');
    request({
        url: url,
        method: 'POST',
        json: true,
        headers: {
            'content-type': 'application/json'
        },
        body: {
            productCode: req.body.productCode
        }
    }, function (error, response, body) {
        res.send(body);
    });
});

module.exports = router;