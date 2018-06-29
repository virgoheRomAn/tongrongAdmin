var express = require('express');
var router = express.Router();
var path = require('path');
var request = require('request');
var config = require('config');
var routerUtil = require(path.join(process.cwd(), '/utils/router_util'));
var dictUtil = require(path.join(process.cwd(), '/utils/dict_util'));
var multer  = require('multer');
var upload = multer({ dest: '/tmp/' });
var fs = require('fs');

router.get('/list', function(req, res, next) {
    var menuId = req.query.menuId;
    routerUtil.renderHtml(req, res, menuId, 'user/customer/list.ejs');
});

//列表数据
router.get('/list_data', function(req, res, next) {
    var length = req.query.length;
    var start = req.query.start;
    var page = parseInt(start/length) + 1;
    var requestData = {
        "page": page,
        "limit": length
    }
    var url = config.get('integration.usercenter.url.root') + config.get('integration.usercenter.url.user.findInfoList');
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


router.get('/form', function(req, res, next) {
    var menuId = req.query.menuId;
    var userId = req.query.userId;
    routerUtil.renderHtml(req, res, menuId, 'user/customer/form.ejs', {"userId":userId});
});

router.get('/form_data', function(req, res, next) {
    var userId = req.query.userId;
    var data = new Object();
    var dict = req.session.dict;
    data.region = req.session.region;
    data.marry = dictUtil.getDictItemsByTypeCode(dict, 'MARITAL_STATUS');
    data.houseType = dictUtil.getDictItemsByTypeCode(dict, 'HOUSE_TYPE');
    data.companyType = dictUtil.getDictItemsByTypeCode(dict, 'COMPANY_TYPE');
    data.workType = dictUtil.getDictItemsByTypeCode(dict, 'WORK_TYPE');
    data.friendShip = dictUtil.getDictItemsByTypeCode(dict, 'CONTACT_RELATIONSHIP');
    data.fileType = dictUtil.getDictItemsByTypeCode(dict, 'FILE_TYPE');

    var requestData = {
        "userId": userId
    }
    var url = config.get('integration.usercenter.url.root') + config.get('integration.usercenter.url.user.findInfo');
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
        data.customer = result;
        res.send(data);
    });
});



router.post('/form_save', function(req, res, next) {
    var fieldArray = ['userId','bankCardName','bankCardNo',
        'marry','province','city','region','houseType','companyType','workType',
        'friendName1','friendMobileNo1','friendShip1','friendName2','friendMobileNo2','friendShip2'
    ];
    var requestData = fillData(fieldArray, req);
    requestData.operateName = req.session.userInfo.userName;
    var url = config.get('integration.usercenter.url.root') + config.get('integration.usercenter.url.user.saveInfo');

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

function fillData(fieldArray, req) {
    var data = new Object();
    for(var i=0; i<fieldArray.length; i++){
        if(req.body[fieldArray[i]]){
            data[fieldArray[i]] = req.body[fieldArray[i]];
        }
    }
    return data;
}


router.post('/file_upload', upload.single('file'), function (req, res, next) {
    var file = req.file;
    var userId = req.body.userId;
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
                'uploadName':uploadName
            };
            var url2 = config.get('integration.usercenter.url.root') + config.get('integration.usercenter.url.user.saveFile');
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


router.post('/file_delete', function(req, res, next) {
    var fileUrl = req.body.fileUrl;
    var userId = req.body.userId;
    var userInfo = req.session.userInfo;
    var uploadName = userInfo.userName;
    var requestData = {
        'userId':userId,
        'fileUrl':fileUrl,
        'uploadName':uploadName

    };
    var url = config.get('integration.usercenter.url.root') + config.get('integration.usercenter.url.user.deleteFile');

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
module.exports = router;
