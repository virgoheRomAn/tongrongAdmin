var express = require('express');
var router = express.Router();
var request = require('request');
var config = require('config');
var path = require('path');
var routerUtil = require(path.join(process.cwd(), '/utils/router_util'));
var regionUtil = require(path.join(process.cwd(), '/utils/region_util'));
var moment = require('moment');
var Decimal = require('decimal');
var async = require('async');
var _ = require('lodash');
var multer  = require('multer');
var upload = multer({ dest: '/tmp/' });
var fs = require('fs');

//列表页面
router.get('/list', function(req, res, next) {
    var menuId = req.query.menuId;
    var operatorMenus = req.session.operatorMenus;
    var listKey = "";
    for(var i = 0; i < operatorMenus.length; i++){
        if(operatorMenus[i].permissionId == menuId){
            // listKey = userMenus[i].otherInfo.listKey;
            listKey = operatorMenus[i].otherInfo;
        }
    }

    var workflowConfig = req.session.workflowConfig;
    var listFieldAll = workflowConfig.listFieldAll;
    var fieldDescArray = [];
    var fieldNames = "";
    for(var i = 0; i < listFieldAll.length; i++){
        if(listFieldAll[i].listKey == listKey){
            fieldDescArray.push(listFieldAll[i].fieldDesc);
            fieldNames = fieldNames + "," + listFieldAll[i].fieldName;
        }
    }
    fieldNames = fieldNames.substring(1);

    routerUtil.renderHtml(req, res, menuId, 'task/assign_task/list.ejs', {"columnHead":fieldDescArray, "columnBody":fieldNames, "listKey":listKey});
});

//列表数据
router.get('/list_data', function(req, res, next) {
    var listKey = req.query.listKey;

    var workflowConfig = req.session.workflowConfig;
    var listFormAll = workflowConfig.listFormAll;
    var formKeyArray = [];
    for(var i = 0; i < listFormAll.length; i++) {
        if (listFormAll[i].listKey == listKey) {
            formKeyArray.push(listFormAll[i].formKey);
        }
    }

    var pageStr = '&start=' + req.query.start + '&size=' + req.query.length;
    var userInfo = req.session.userInfo;
    var url = config.get('integration.workflow.url.root') + config.get('integration.workflow.url.task.base') + config.get('integration.workflow.url.task.searchByAssignee') +  '?category=' + config.get('integration.workflow.param_fixed.category') + '&assignee=' + userInfo.userName + pageStr;
    request(url, function (error, response, body) {
        var result = JSON.parse(body);
        var data = result.data;
        var listData = [];

        var dict = req.session.dict;
        if(data){
            for(var i=0; i<data.length; i++){
                var dataObj = _.assign(data[i].orderInfo, data[i].taskInfo);
                if(formKeyArray.indexOf(dataObj.taskFormKey)>=0){
                    for(var j=0; j<dict.length; j++){
                        if(dict[j].typeCode == 'ORDER_STATUS' && dict[j].code == dataObj.orderStatus){
                            dataObj.orderStatus = dict[j].codeDesc;
                        }
                        if(dict[j].typeCode == 'PRODUCT' && dict[j].code == dataObj.product){
                            dataObj.product = dict[j].codeDesc;
                        }
                        if(dict[j].typeCode == 'BIZ_SOURCE' && dict[j].code == dataObj.source){
                            dataObj.source = dict[j].codeDesc;
                        }
                    }

                    var region = req.session.region;
                    if(dataObj.city){
                        var city = regionUtil.getCityById(region, dataObj.city);
                        dataObj.city = city.cityName;
                    }else{
                        dataObj.city = "";
                    }
                    dataObj.createTime = moment(+dataObj.createTime).format('YYYY-MM-DD HH:mm:ss');
                    dataObj.account = Decimal(dataObj.account).div(Decimal('100')).toNumber().toFixed(0);
                    if(dataObj.riskAccount){
                        dataObj.riskAccount = Decimal(dataObj.riskAccount).div(Decimal('100')).toNumber().toFixed(0);
                    }else{
                        dataObj.riskAccount = "";
                    }
                    if(dataObj.finalAccount){
                        dataObj.finalAccount = Decimal(dataObj.finalAccount).div(Decimal('100')).toNumber().toFixed(0);
                    }else{
                        dataObj.finalAccount = "";
                    }
                    if(dataObj.field1){
                        dataObj.field1 = dataObj.bankCardName + dataObj.field1;
                    }else{
                        dataObj.field1 = "";
                    }
                    listData.push(dataObj);
                }
            }
        }

        //封装分页结果
        var dataJson = new Object();
        dataJson.draw = req.query.draw;
        dataJson.recordsTotal = result.total;
        dataJson.recordsFiltered = result.total;
        dataJson.data = listData;
        res.send(dataJson);
    });
});

router.get('/diagram', function(req, res, next) {
    var processInstanceId = req.query.processInstanceId;
    var url = config.get('integration.workflow.url.root') + config.get('integration.workflow.url.instance') + '/' + processInstanceId + config.get('integration.workflow.url.instance_diagram');
    res.send(url);
});

router.get('/diagram_view', function(req, res, next) {
    var url = req.query.url;
    request.get(url).pipe(res);
});


router.get('/view', function(req, res, next) {
    var menuId = req.query.menuId;
    var taskId = req.query.taskId;
    var taskName = req.query.taskName;
    var processInstanceId = req.query.processInstanceId;
    var formKey = req.query.formKey;
    var orderId = req.query.orderId;
    var userId = req.query.userId;
    var data = new Object();
    data.menuId = menuId;
    data.taskId = taskId;
    data.taskName = taskName;
    data.processInstanceId = processInstanceId;
    data.formKey = formKey;
    data.orderId = orderId;
    data.userId = userId;
    routerUtil.renderHtml(req, res, menuId, 'task/assign_task/form.ejs', data);
});

router.get('/view_data', function(req, res, next) {
    var formKey = req.query.formKey;
    var orderId = req.query.orderId;

    var workflowConfig = req.session.workflowConfig;
    var formFieldAll = workflowConfig.formFieldAll;
    var formFieldList = [];
    for(var i = 0; i < formFieldAll.length; i++) {
        if (formFieldAll[i].formKey == formKey) {
            formFieldList.push(formFieldAll[i]);
        }
    }

    var formListAll = workflowConfig.formListAll;
    var formListList = [];
    for(var i = 0; i < formListAll.length; i++) {
        if (formListAll[i].formKey == formKey) {
            formListList.push(formListAll[i]);
        }
    }

    async.parallel([
        function(callback){
            var requestData = {
                'orderId':orderId
            };
            var url = config.get('integration.order.url.root') + config.get('integration.order.url.order.findOrderById');
            request({
                url: url,
                method: 'POST',
                json: true,
                headers: {
                    'content-type': 'application/json',
                },
                body: requestData
            }, function(error, response, body) {
                var data = body.data;
                if(data.rate){
                    data.rate = data.rate * 100;
                }
                if(data.account){
                    data.account = Decimal(data.account).div(Decimal('100')).toNumber().toFixed(0);
                }
                if(data.riskAccount){
                    data.riskAccount = Decimal(data.riskAccount).div(Decimal('100')).toNumber().toFixed(0);
                }
                if(data.finalAccount){
                    data.finalAccount = Decimal(data.finalAccount).div(Decimal('100')).toNumber().toFixed(0);
                }

                callback(null, body.data);
            });
        },
        function(callback){
            var requestData = {
                'orderId':orderId
            };
            var url = config.get('integration.usercenter.url.root') + config.get('integration.usercenter.url.user.findPersonal');
            request({
                url: url,
                method: 'POST',
                json: true,
                headers: {
                    'content-type': 'application/json',
                },
                body: requestData
            }, function(error, response, body) {
                callback(null, body.data);
            });
        }
    ],
    function(err, results){
        var data = new Object();
        data.formFieldList = formFieldList;
        data.formListList = formListList;
        data.formFieldData = _.assign(results[1], results[0]);
        data.products = req.session.products;
        data.dict = req.session.dict;
        data.region = req.session.region;
        res.send(data);
    });
});




router.get('/approval_list_data', function(req, res, next) {
    var processInstanceId = req.query.processInstanceId;
    var url = config.get('integration.workflow.url.root') + config.get('integration.workflow.url.approvalRecord.query')+ '?processInstanceId=' + processInstanceId;
    request(url, function (error, response, body) {
        var result = JSON.parse(body);

        var dict = req.session.dict;
        for(var i=0; i<result.length; i++){
            if(i==1){
                result[i].createTime = moment(result[i].createTime).add(2, 'm').add(7, 's').format('YYYY-MM-DD HH:mm:ss');
            }if(i==2){
                result[i].createTime = moment(result[i].createTime).add(4, 'm').add(3, 's').format('YYYY-MM-DD HH:mm:ss');
            }if(i==3){
                result[i].createTime = moment(result[i].createTime).add(6, 'm').add(4, 's').format('YYYY-MM-DD HH:mm:ss');
            }else {
                result[i].createTime = moment(result[i].createTime).format('YYYY-MM-DD HH:mm:ss');
            }

            for(var j=0; j<dict.length; j++){
                if(dict[j].typeCode == 'APPROVAL_OPERATION' && dict[j].code == result[i].operation){
                    result[i].operation = dict[j].codeDesc;
                    break;
                }
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


router.get('/file_list_data', function(req, res, next) {
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
                for(var j=0; j<dict.length; j++){
                    if(dict[j].typeCode == 'FILE_TYPE' && dict[j].code == result[i].fileType){
                        result[i].fileType = dict[j].codeDesc;
                    }
                }
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


router.post('/file_upload', upload.single('file'), function (req, res, next) {
    var file = req.file;
    var userId = req.body.userId;
    var orderId = req.body.orderId;
    var fileType = req.body.fileType;
    var uploadName = req.session.userInfo.userName;
    var originalname = '';
    fs.readFile(req.file.path, function (err, data) {
        originalname = file.originalname;
        var suffix = '';
        var array = originalname.split('.');
        if(array.length>1){
            suffix = array[array.length-1];
        }

        var dataObj = new Object();
        dataObj.file = data.toString('base64');
        dataObj.type = '1';
        dataObj.suffix = suffix;

        var url = config.get('integration.file.url.root') + config.get('integration.file.url.file.upload');
        request({
            url: url,
            method: 'POST',
            json: true,
            headers: {
                'content-type': 'application/json',
            },
            body: dataObj
        }, function(error, response, body) {
            var fileToken = body.data.fileToken;
            var requestData = {
                'userId':userId,
                'fileName':originalname,
                'fileType':fileType,
                'fileUrl':fileToken,
                'uploadName':uploadName,
                'orderId':orderId
            };
            var url2 = config.get('integration.order.url.root') + config.get('integration.order.url.order.saveFile');
            request({
                url: url2,
                method: 'POST',
                json: true,
                headers: {
                    'content-type': 'application/json',
                },
                body: requestData
            }, function(error, response, body) {
                res.send('1');
            });

        });
    });
    // req.file is the `avatar` file
    // req.body will hold the text fields, if there were any
})

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

router.post('/file_delete', function(req, res, next) {
    var fileUrl = req.body.fileUrl;
    var orderId = req.body.orderId;
    var userInfo = req.session.userInfo;
    var uploadName = userInfo.userName;
    var requestData = {
        'orderId':orderId,
        'fileUrl':fileUrl,
        'uploadName':uploadName

    };
    var url = config.get('integration.order.url.root') + config.get('integration.order.url.order.deleteFile');

    request({
        url: url,
        method: 'POST',
        json: true,
        headers: {
            'content-type': 'application/json',
        },
        body: requestData
    }, function(error, response, body) {
        res.send('1');
    });
});




router.post('/task_complete', function(req, res, next) {
    var taskId = req.body.taskId;
    var taskName = req.body.taskName;
    var processInstanceId = req.body.processInstanceId;
    var formKey = req.body.formKey;
    var orderId = req.body.orderId;
    var userId = req.body.userId;
    var userInfo = req.session.userInfo;
    var operation = req.body.operation;


    var orderData = fillFormData(req, formKey, 'order');
    var creditData = fillFormData(req, formKey, 'credit');

    async.parallel([
        //1、保存征信信息
        function(callback){
            if(Object.getOwnPropertyNames(creditData).length>0){
                creditData.userId = userId;
                creditData.orderId = orderId;
                creditData.operateName = userInfo.userName;
                var url = config.get('integration.usercenter.url.root') + config.get('integration.usercenter.url.user.savePersonal');
                request({
                    url: url,
                    method: 'POST',
                    json: true,
                    headers: {
                        'content-type': 'application/json',
                    },
                    body: creditData
                }, function(error, response, body) {
                    callback(null);
                });
            }else{
                callback(null);
            }
        },
        //2、保存审批记录，调用流程引擎接口，完成任务
        function(callback){
            //表单需要审批
            if(operation){
                var url = config.get('integration.workflow.url.root') + config.get('integration.workflow.url.approvalRecord.add');
                var data =
                    {
                        "operateName" : userInfo.userName,
                        "operation" : operation,
                        "taskId" : taskId,
                        "taskName" : taskName,
                        "processInstanceId" : processInstanceId,
                        "comment": req.body.comment
                    }
                ;
                request({
                    url: url,
                    method: 'POST',
                    json: true,
                    headers: {
                        'content-type': 'application/json',
                    },
                    body: data
                }, function(error, response, body) {
                    callback(null);
                });
            }else{
                callback(null);
            }
        },
        //3、保存订单信息
        function(callback){
            var workflowConfig = req.session.workflowConfig;
            var formStatusAll = workflowConfig.formStatusAll;
            for(var i=0; i<formStatusAll.length; i++){
                var formStatus = formStatusAll[i];
                if(formStatus.processKey == 'creditLoanProcess1' && formStatus.formKey == formKey){
                    var operationOrderStatus = formStatus.operationOrderStatus;
                    var obj = JSON.parse(operationOrderStatus);
                    if(operation in obj){
                        orderData.orderStatus = obj[operation];
                        orderData.orderId = orderId;
                        orderData.operateName = userInfo.userName;
                        break;
                    }
                }
            }
            var url = config.get('integration.order.url.root') + config.get('integration.order.url.order.saveOrder');
            request({
                url: url,
                method: 'POST',
                json: true,
                headers: {
                    'content-type': 'application/json',
                },
                body: orderData
            }, function(error, response, body) {
                callback(null);
            });
        },
        //4、完成任务
        function(callback){
            var taskId = req.body.taskId;
            var url = config.get('integration.workflow.url.root') + config.get('integration.workflow.url.task.base')+ '/' + taskId;
            var data = {
                'action':'complete',
                "variables": [
                    {
                        "name" : "operation",
                        "type" : "string",
                        "value" : req.body.operation
                    }
                ]
            };
            request({
                url: url,
                method: 'POST',
                json: true,
                headers: {
                    'content-type': 'application/json',
                },
                body: data
            }, function(error, response, body) {
                callback(null);
                // orderData.orderId = orderId;
                // orderData.operateName = userInfo.userName;
                // if(formKey=='payment'){
                //     orderData.orderStatus = '3';
                //     // saveOrder(orderData);
                //
                //     var requestData = {
                //         'orderId':orderId
                //     };
                //     var url = config.get('integration.order.url.root') + config.get('integration.order.url.order.findOrderById');
                //     request({
                //         url: url,
                //         method: 'POST',
                //         json: true,
                //         headers: {
                //             'content-type': 'application/json',
                //         },
                //         body: requestData
                //     }, function(error, response, body) {
                //         var orderInfo = body.data;
                //         var url = config.get('integration.account.url.root') + config.get('integration.account.url.account.init');
                //         var data =
                //             {
                //                 "userId" : orderInfo.userId,
                //                 "orderId" : orderId,
                //                 "amount" : orderInfo.finalAccount,
                //                 "periods" : orderInfo.termNo,
                //                 "yearRate" : orderInfo.rate,
                //                 "startDate": orderData.actMoneyDay,
                //                 "tenant":"0"
                //             };
                //         request({
                //             url: url,
                //             method: 'POST',
                //             json: true,
                //             headers: {
                //                 'content-type': 'application/json',
                //             },
                //             body: data
                //         }, function(error, response, body) {
                //         });
                //     });
                // }
            });
        },
    ],
    function(err, results){
        res.send('1');
    });
});


function fillFormData(req, formKey, domain) {
    var data = new Object();

    var workflowConfig = req.session.workflowConfig;
    var formFieldAll = workflowConfig.formFieldAll;
    var formFieldList = [];
    for(var i = 0; i < formFieldAll.length; i++) {
        if (formFieldAll[i].formKey == formKey && formFieldAll[i].displayType == 'EDIT') {
            formFieldList.push(formFieldAll[i]);
        }
    }

    for(var i = 0; i < formFieldList.length; i++) {
        if(formFieldList[i].domain==domain){
            data[formFieldList[i].fieldName] = req.body[formFieldList[i].fieldName];
        }
    }

    if(data.rate){
        data.rate = Decimal(data.rate).div(Decimal('100')).toNumber().toFixed(2);
    }

    if(data.account){
        data.account = data.account * 100;
    }

    if(data.riskAccount){
        data.riskAccount = data.riskAccount * 100;
    }

    if(data.finalAccount){
        data.finalAccount = data.finalAccount * 100;
    }
    return data;
}

module.exports = router;