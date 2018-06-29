var express = require('express');
var router = express.Router();
var fs = require('fs');
var config = require('config');
var mysql = require('mysql');
var moment = require('moment');
var qrcode = require('qrcode');

var moneyUtil = require('../utils/money_util');
var fileUtil = require('../utils/file_util');
var fileCloudUtil = require('../utils/file_cloud_util');
var wordUtil = require('../utils/word_util');
//sql加载
var contractSql = require('../db/contract_sql');

//连接池
var pool = mysql.createPool(config.get('mysql'));
//菜单
var ptitle = '订单管理';
var title = '羽象保证金业务合同管理';
var menuid = '1';

//合同列表页面
router.get('/contract/list', function(req, res, next) {
    res.render('template', { ptitle:ptitle, title: title, menuid:menuid, view :'approval/contract/list.ejs'});
});

//合同列表数据
router.get('/contract/list_data', function(req, res, next) {
    pool.getConnection(function(err, connection) {
        //查询列表记录数
        connection.query(contractSql.queryCount, function(err, result) {
            //查询分页数据
            connection.query(contractSql.queryPage, [parseInt(req.query.start), parseInt(req.query.length)], function(err2, result2) {
                //格式化时间
                for (var i = 0; i < result2.length; i++) {
                    result2[i].create_time = moment(result2[i].create_time).format('YYYY-MM-DD HH:mm:ss');
                }
                //封装分页结果
                var dataJson = new Object();
                dataJson.draw = req.query.draw;
                dataJson.recordsTotal = result[0].count;
                dataJson.recordsFiltered = result[0].count;
                dataJson.data = result2;
                res.send(dataJson);
                // 释放连接
                connection.release();
            });
        });
    });
});

//废弃
router.post('/contract/abandon', function(req, res, next) {
    pool.getConnection(function(err, connection) {
        connection.query(contractSql.updateStatusById, ['200',req.body.id],function(err, result) {
            connection.release();
        });
    });
    res.send("1");
});

//新增合同表单页
router.get('/contract/form', function(req, res, next) {
    var id = req.query.id;
    res.render('template', { ptitle:ptitle, title: title, menuid:menuid, view :'approval/contract/form.ejs', id: id});
});

//修改合同表单页
router.get('/contract/form_data', function(req, res, next) {
    var id = req.query.id;
    pool.getConnection(function(err, connection) {
        connection.query(contractSql.queryById, [id], function(err, result) {
            res.send(result[0]);
            connection.release();
        });
    });

});

//合同下载
router.get('/contract/download', function (req, res,next) {
    var id = req.query.id;
    pool.getConnection(function(err, connection) {
        connection.query(contractSql.queryById, [id], function(err, result) {
            fileCloudUtil.download(result[0].file_path, function (err, data) {
                //创建临时目录
                var downloadDirectory = config.get('file_tmp_root') + config.get('contract_jk_download_path');
                fileUtil.mkdirsSync(downloadDirectory);
                //文件路径
                var downloadPath = downloadDirectory + result[0].file_name;
                //将云上下载到的文件写到服务器临时目录里
                fs.writeFileSync(downloadPath, data.Body);
                //从服务器临时目录下载
                res.download(downloadPath);
            });
            connection.release();
        });
    });
});

//保存合同
router.post('/contract/save', function(req, res, next) {
    pool.getConnection(function(err, connection) {
        var customer_name = req.body.customer_name;
        var idcard_no = req.body.idcard_no;
        var address = req.body.address;
        var phone = req.body.phone;
        var loan_amount = req.body.loan_amount;
        var periods = req.body.periods;
        var status = '100';
        //1、插入合同信息
        connection.query(contractSql.insert, [customer_name, idcard_no, address, phone, loan_amount, periods, status], function(errInsert, resultInsert) {
            if (errInsert) throw errInsert;
            //生成合同流水号
            var day = moment(new Date()).format("YYYYMMDD");
            var id = resultInsert.insertId;
            var idStr = id.toString();
            var str = idStr;
            for(i=0; i<5-idStr.length; i++){
                str = '0' + str;
            }
            //合同号
            var contractJkNo = config.get('contract_jk_prefix') + day + "-" + str;

            //2、生成二维码
            //创建二维码服务器临时目录
            var qrcodeDirectory = config.get('file_tmp_root') + config.get('contract_jk_qrcode_path');
            fileUtil.mkdirsSync(qrcodeDirectory);
            //二维码图片名
            var qrcodeFileName = config.get('contract_jk_qrcode_prefix') + contractJkNo + config.get('contract_jk_qrcode_file_type');
            //二维码图片路径
            var qrcodePath = qrcodeDirectory + qrcodeFileName;
            //生成二维码图片到服务器临时目录
            qrcode.toFile(qrcodePath, contractJkNo , function (errQrcode) {
                if (errQrcode) throw errQrcode;
                //3、根据模板生成word
                //生成word需要的文本数据
                var stringData = new Object();
                stringData.contract_no = contractJkNo;
                stringData.customer_name = customer_name;
                stringData.idcard_no = idcard_no;
                stringData.address = address;
                stringData.phone = phone;
                stringData.loan_amount_capital = moneyUtil.convertCurrency(parseInt(loan_amount));
                stringData.loan_amount = loan_amount;
                stringData.periods = periods;
                //生成word需要的图片数据
                var imageData = new Object();
                imageData.width = 150;
                imageData.height = 150;
                imageData.path = qrcodePath;
                var templatePath = config.get('contract_jk_template_path');
                //生成word
                var buf = wordUtil.toFileWithImage(templatePath, stringData, imageData);

                //4、将生成的word存入服务器临时目录
                //创建服务器临时目录
                var contractJkUploadDirectory = config.get('file_tmp_root') + config.get('contract_jk_upload_path');
                fileUtil.mkdirsSync(contractJkUploadDirectory);
                //借款合同文件名
                var contractJkFileName = contractJkNo + config.get('contract_jk_file_type');
                //借款合同服务器临时目录路径
                var contractJkUploadPath = contractJkUploadDirectory + contractJkFileName;
                //写入服务器临时目录
                fs.writeFileSync(contractJkUploadPath, buf);

                //5、上传到云存储
                //云存储文件路径
                var contractJkCloudPath = config.get('tencent.cos.contract_jk_root') + contractJkFileName;
                fileCloudUtil.upload(contractJkCloudPath, contractJkUploadPath, function (errUpload, resultUpload) {
                    if (errUpload) throw errUpload;
                    //6、修改合同号、合同文件名和合同云存储文件路径
                    connection.query(contractSql.updateById, [contractJkNo, contractJkFileName, contractJkCloudPath, id], function(errUpdate, resultUpdate) {
                        if (errUpdate) throw errUpdate;
                        connection.release();
                        res.send("1");
                    });
                });
            });
        });
    });
});

//修改合同
router.post('/contract/update', function(req, res, next) {

});

module.exports = router;
