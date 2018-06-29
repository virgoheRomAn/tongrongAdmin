var express = require('express');
var router = express.Router();
var request = require('request');
var config = require('config');
var path = require('path');
var menuConstant = require(path.join(process.cwd(), '/constants/menu_constant'));
var async = require('async');


//登录页
router.get('/', function(req, res, next) {
    res.render('login');
});

//登录
router.post('/login', function(req, res, next) {
    var data = new Object();
    async.waterfall([
        function(callback){
            var paramStr = "?userName=" + req.body.userName + "&password=" + req.body.userPassword + "&companyId=0";
            var url = config.get('integration.permission.url.root') + config.get('integration.permission.url.permission.auth') + paramStr;
            //认证
            request(url, function (error, response, body) {
                var result = JSON.parse(body);
                var code = result.code;
                if(code=='0'){
                    data.code = '0';
                    data.operatorId = result.data.operatorId;

                    var userInfo = new Object();
                    userInfo.userName = req.body.userName;
                    req.session.userInfo = userInfo;
                }else{
                    data.code = '-1';
                    data.message = result.message;
                }
                callback(null);
            })

            // var url = config.get('integration.usercenter.url.root') + config.get('integration.usercenter.url.auth');
            // var requestData = {
            //     "userName": req.body.userName,
            //     "userPassword": req.body.userPassword,
            //     "companyId":req.body.companyId
            // };
            // request({
            //     url: url,
            //     method: 'POST',
            //     json: true,
            //     headers: {
            //         'content-type': 'application/json',
            //     },
            //     body: requestData
            // }, function(error, response, body) {
            //     var code = body.code;
            //     if(code=='0'){
            //         data.code = '0';
            //     }else{
            //         data.code = '-1';
            //         data.message = body.message;
            //     }
            //     callback(null);
            // });
        },
        function(callback){
            if(data.code=='0'){
                async.parallel([
                    //获取所有菜单
                    function(callback){
                        var url = config.get('integration.permission.url.root') + config.get('integration.permission.url.permission.getAllMenus');
                        request(url, function (error, response, body) {
                            var allMenusResult = JSON.parse(body);
                            var allMenus = allMenusResult.data;
                            req.session.allMenus = allMenus;
                            var topMenus = [];
                            var topMenuIds = [];
                            for(var i=0; i<allMenus.length; i++){
                                if(allMenus[i].parentPermissionId=='-1'){
                                    topMenus.push(allMenus[i]);
                                    topMenuIds.push(allMenus[i].permissionId);
                                }
                            }
                            req.session.topMenus = topMenus;
                            req.session.topMenuIds = topMenuIds;

                            //鉴权
                            var paramStr = "?operatorId=" + data.operatorId;
                            var url = config.get('integration.permission.url.root') + config.get('integration.permission.url.permission.getOperatorMenus') + paramStr;
                            request(url, function (error, response, body) {
                                var operatorMenusResult = JSON.parse(body);
                                var operatorMenus = operatorMenusResult.data;
                                req.session.operatorMenus = operatorMenus;
                                callback(null);
                            })
                        })
                    },
                    //获取字段数据放入session
                    function(callback){
                        var url = config.get('integration.data.url.root') + config.get('integration.data.url.dict.getDictDatas');
                        request(url, function (error, response, body) {
                            var dict = JSON.parse(body);
                            req.session.dict = dict.data;
                            callback(null);
                        })
                    },
                    //获取省市区数据放入session
                    function(callback){
                        var url = config.get('integration.data.url.root') + config.get('integration.data.url.region.getRegionDatas');
                        request(url, function (error, response, body) {
                            if (!error && response.statusCode == 200) {
                                var region = JSON.parse(body);
                                req.session.region = region.data;
                                callback(null);
                            }
                        })
                    },
                    //获取产品数据放入session
                    function(callback){
                        var url = config.get('integration.data.url.root') + config.get('integration.data.url.product.getProducts');
                        request(url, function (error, response, body) {
                            if (!error && response.statusCode == 200) {
                                var products = JSON.parse(body);
                                req.session.products = products.data;
                                callback(null);
                            }
                        })
                    },
                    //获取表单对应流程状态数据
                    function(callback){
                        var url = config.get('integration.workflow.url.root') + config.get('integration.workflow.url.config.all');
                        request(url, function (error, response, body) {
                            if (!error && response.statusCode == 200) {
                                var workflowConfig = JSON.parse(body);
                                req.session.workflowConfig = workflowConfig;
                                callback(null);
                            }
                        })
                    }
                ],
                function(err, results){
                    callback(null);
                });
            }else{
                callback(null);
            }
        }
    ], function (err, result) {
        res.send(data);
    });
});





//首页
router.get('/index', function(req, res, next) {
    //routerUtil.renderHtml(res, menuid, 'workbench/workbench.ejs');
    var userInfo = req.session.userInfo;
    var topMenus = req.session.topMenus;
    var menusNamesArray = ['我的工作台'];
    res.render('template', { 'menusNamesArray':menusNamesArray, menuId:'0', view :'workbench/workbench.ejs', userInfo:userInfo, topMenus:topMenus, menuIdLevel1:'1'});
});

module.exports = router;
