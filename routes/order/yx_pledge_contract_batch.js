var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var config = require('config');
var mysql = require('mysql');
var moment = require('moment');
var qrcode = require('qrcode');
var async = require('async');
var zipper = require('zip-local');

var moneyUtil = require(path.join(process.cwd(), '/utils/money_util'));
var fileUtil = require(path.join(process.cwd(), '/utils/file_util'));
var fileCloudUtil = require(path.join(process.cwd(), '/utils/file_cloud_util'));
var wordUtil = require(path.join(process.cwd(), '/utils/word_util'));
var routerUtil = require(path.join(process.cwd(), '/utils/router_util'));


//sql加载
var contractBatch = require(path.join(process.cwd(), '/db/order/contract_batch.js'));
var contractNumber = require(path.join(process.cwd(), '/db/order/contract_number.js'));
var contractPledge = require(path.join(process.cwd(), '/db/order/contract_pledge.js'));
var contractLoan = require(path.join(process.cwd(), '/db/order/contract_loan.js'));

//连接池
var pool = mysql.createPool(config.get('mysql'));

var templateMap ={
    'common': ['contract_loan_1','contract_pledge_1'],
    'tj':['contract_loan_2','contract_pledge_2']
};
var templateDict ={
    'common': '通用模板',
    'tj':'天津模板'
};

//合同列表页面
router.get('/list', function(req, res, next) {
    var menuId = req.query.menuId;
    routerUtil.renderHtml(req, res, menuId, 'order/yx_pledge_contract_batch/list.ejs');
});

//合同列表数据
router.get('/list_data', function(req, res, next) {
    pool.getConnection(function(err, connection) {
        //查询列表记录数
        connection.query(contractBatch.queryCount, function(err, result) {
            //查询分页数据
            connection.query(contractBatch.queryPage, [parseInt(req.query.start), parseInt(req.query.length)], function(err2, result2) {
                //页面赋值
                for (var i = 0; i < result2.length; i++) {
                    result2[i].contract_type = '借款合同+抵押合同';
                    result2[i].template_desc = templateDict[result2[i].template_type];
                    var contractPledgeStartNo = result2[i].contract_pledge_start_no;
                    var contractPledgeEndNo = result2[i].contract_pledge_end_no;
                    var contractLoanStartNo = result2[i].contract_loan_start_no;
                    var contractLoanEndNo = result2[i].contract_loan_end_no;
                    result2[i].contract_no_desc = contractPledgeStartNo + ' 至 ' + contractPledgeEndNo + ' ; ' + contractLoanStartNo + ' 至 ' + contractLoanEndNo;
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

//新增合同表单页
router.get('/form', function(req, res, next) {
    var menuId = req.query.menuId;
    routerUtil.renderHtml(req, res, menuId, 'order/yx_pledge_contract_batch/form.ejs');
});


//合同下载
router.get('/download', function (req, res,next) {
    var id = req.query.id;
    pool.getConnection(function(err, connection) {
        connection.query(contractBatch.queryById, [id], function(err, result) {
            fileCloudUtil.download(result[0].file_path, function (err, data) {
                var todayStr = moment(new Date()).format("YYYYMMDD");
                //创建临时目录
                var downloadDirectory = config.get('file_tmp_path.root') + todayStr + '/' + config.get('file_tmp_path.relative.yx_pledge_contract_batch.download');
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
router.post('/save', function(req, res, next) {
    var templateType = req.body.template_type;
    var contractCount = req.body.contract_count;
    var status = '100';
    var todayStr = moment(new Date()).format("YYMMDD");
    var contractBatchId;
    var contractPledgeNos;
    var contractLoanNos;
    pool.getConnection(function(err, connection) {
        async.waterfall([
            function(callback){
                //1、插入批次表
                connection.query(contractBatch.insert, [contractCount, status], function(err, results) {
                    contractBatchId = results.insertId;
                    callback(err);
                });
            },
            function(callback){
                //2、插入合同号表
                var contractBatchIdArray = [];
                for(var i=0; i<contractCount; i++){
                    contractBatchIdArray.push(contractBatchId);
                }
                async.waterfall([
                    function(callback){
                        callback(null, 'one', 'two');
                    },
                    function(arg1, arg2, callback){
                        callback(null, 'three');
                    },
                    function(arg1, callback){
                        // arg1 now equals 'three'
                        callback(null, 'done');
                    }
                ], function (err, result) {
                    // result now equals 'done'
                });


                async.mapSeries(contractBatchIdArray, function(item, callback) {
                    var todayStr = moment(new Date()).format("YYYYMMDD");
                    connection.query(contractNumber.queryByDate, [todayStr], function(err, results) {
                        var numberNewStr;
                        if(results.length==0){
                            numberNewStr = '00001';
                        }else{
                            var numberStr = results[0].number;
                            var numberInt = parseInt(numberStr.replace(/\b(0+)/gi,""));
                            var numberNewInt = numberInt + 1;
                            numberNewStr = numberNewInt.toString();
                            var numberNewStrLen = numberNewStr.length;
                            for(i=0; i<5-numberNewStrLen; i++){
                                numberNewStr = '0' + numberNewStr;
                            }
                        }
                        connection.query(contractNumber.insertByBatch, [item, todayStr, numberNewStr, status], function(err, results) {
                            callback(err, numberNewStr);
                        });
                    });
                }, function(err, results) {
                    callback(err, results);
                });
            },function(numberArray, callback){
                //3、插入抵押合同表，并生成文件
                async.map(numberArray, function(item, callback) {
                    //合同号
                    var contractNo = config.get('file_name_prefix.contract_pledge') + todayStr + "-" + item;
                    //生成合同
                    var qrcodePath = config.get('file_tmp_path.relative.yx_pledge_contract_batch.qrcode') + contractBatchId + '/';
                    var templatePath = config.get('template_path.root') + config.get('template_path.relative.' + templateMap[templateType][1]);
                    var uploadPath = config.get('file_tmp_path.relative.yx_pledge_contract_batch.upload') + contractBatchId + '/';
                    var fileType = config.get('file_type.contract');
                    //入库
                    connection.query(contractPledge.insertByBatch, [contractBatchId, contractNo, status], function(err, results) {
                        createContractFile(contractNo, qrcodePath, templatePath, uploadPath, fileType, callback);
                    });
                }, function(err, results) {
                    contractPledgeNos = results.sort();
                    callback(err, numberArray);
                });
            },function(numberArray, callback){
                //4、插入借款合同表，并生成文件
                async.map(numberArray, function(item, callback) {
                    //合同号
                    var contractNo = config.get('file_name_prefix.contract_loan') + todayStr + "-" + item;
                    //生成合同
                    var qrcodePath = config.get('file_tmp_path.relative.yx_pledge_contract_batch.qrcode') + contractBatchId + '/';
                    var templatePath = config.get('template_path.root') + config.get('template_path.relative.' + templateMap[templateType][0]);
                    var uploadPath = config.get('file_tmp_path.relative.yx_pledge_contract_batch.upload') + contractBatchId + '/';
                    var fileType = config.get('file_type.contract');
                    //入库
                    connection.query(contractLoan.insertByBatch, [contractBatchId, contractNo, status], function(err, results) {
                        createContractFile(contractNo, qrcodePath, templatePath, uploadPath, fileType, callback);
                    });
                }, function(err, results) {
                    contractLoanNos = results.sort();
                    callback(err);
                });
            },function(callback){
                var todayStr = moment(new Date()).format("YYYYMMDD");
                var zipPath = config.get('file_tmp_path.relative.yx_pledge_contract_batch.upload') + contractBatchId + '/';
                var zipDirectory = config.get('file_tmp_path.root') + todayStr + '/' + zipPath;
                var zipFileName = contractBatchId + ".zip";
                var zipFullPath = zipDirectory + zipFileName;
                fileUtil.mkdirsSync(zipDirectory);
                zipper.sync.zip(zipDirectory).compress().save(zipFullPath);
                //上传到云存储
                //云存储文件路径
                var fileName = zipFileName;
                var cloudPath = config.get('tencent.cos.yx_pledge_contract_batch') + fileName;
                fileCloudUtil.upload(cloudPath, zipFullPath, function (err, result) {
                    if (err) throw err;
                    //6、修改合同号、合同文件名和合同云存储文件路径
                    var contractPledgeStartNo = contractPledgeNos[0];
                    var contractPledgeEndNo = contractPledgeNos[contractPledgeNos.length-1];
                    var contractLoanStartNo = contractLoanNos[0];
                    var contractLoanEndNo = contractLoanNos[contractLoanNos.length-1];
                    connection.query(contractBatch.updateById, [templateType, contractPledgeStartNo, contractPledgeEndNo, contractLoanStartNo, contractLoanEndNo, fileName, cloudPath, contractBatchId], function(err, result) {
                        if (err) throw err;
                        callback(err);
                    });
                });
            }
        ], function (err, result) {
            if(err)throw err;
            connection.release();
            res.send("1");
        });
    });
});

function createContractFile(contractNo, qrcodePath, templatePath, uploadPath, fileType, callback){
    //1、生成二维码
    //创建二维码服务器临时目录
    var todayStr = moment(new Date()).format("YYYYMMDD");
    var qrcodeDirectory = config.get('file_tmp_path.root') + todayStr + '/' + qrcodePath;
    fileUtil.mkdirsSync(qrcodeDirectory);
    //二维码图片名
    var qrcodeFileName = config.get('file_name_prefix.qrcode') + contractNo + config.get('file_type.qrcode');
    //二维码图片路径
    var qrcodeFullPath = qrcodeDirectory + qrcodeFileName;
    //生成二维码图片到服务器临时目录
    qrcode.toFile(qrcodeFullPath, contractNo , function (err) {
        if (err) throw err;
        //3、根据模板生成word
        //生成word需要的文本数据
        var stringData = new Object();
        stringData.contract_no = contractNo;
        //生成word需要的图片数据
        var imageData = new Object();
        imageData.width = 150;
        imageData.height = 150;
        imageData.path = qrcodeFullPath;
        //生成word
        var buf = wordUtil.toFileWithImage(templatePath, stringData, imageData);

        //2、将生成的word存入服务器临时目录
        //创建服务器临时目录
        var uploadDirectory = config.get('file_tmp_path.root') + todayStr + '/' + uploadPath;
        fileUtil.mkdirsSync(uploadDirectory);
        //合同文件名
        var fileName = contractNo + fileType;
        //合同服务器临时目录路径
        var uploadFullPath = uploadDirectory + fileName;
        //写入服务器临时目录
        fs.writeFileSync(uploadFullPath, buf);

        callback(err, contractNo);
    });
};

module.exports = router;
