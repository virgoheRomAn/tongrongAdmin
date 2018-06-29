var express = require('express');
var router = express.Router();
var path = require('path');
var request = require('request');
var config = require('config');
var routerUtil = require(path.join(process.cwd(), '/utils/router_util'));

router.get('/form', function(req, res, next) {
    var menuId = req.query.menuId;
    routerUtil.renderHtml(req, res, menuId, 'system/password/form.ejs');
});
module.exports = router;
