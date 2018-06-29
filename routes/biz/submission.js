var express = require('express');
var router = express.Router();
var path = require('path');
var request = require('request');
var config = require('config');
var routerUtil = require(path.join(process.cwd(), '/utils/router_util'));
var moment = require('moment');
var nodeExcel = require('excel-export');

router.get('/list', function(req, res, next) {
    var menuId = req.query.menuId;
    routerUtil.renderHtml(req, res, menuId, 'biz/submission/list.ejs');
});

//列表数据
router.get('/list_data', function(req, res, next) {
    var start = req.query.start;
    var length = req.query.length;
    var requestData = {
        "offset": start,
        "limit": length
    }
    var url = config.get('integration.report.url.root') + config.get('integration.report.url.report.list');
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
        var dataList = result.reportLog;
        for(var i=0; i<dataList.length; i++){
            var dataObj = dataList[i];
            dataObj.createTime = moment(+dataObj.createTime).format('YYYY-MM-DD HH:mm:ss');
            dataObj.reportList = dataObj.reportList.replace('netsign','网签').replace('contract','合同').replace('issue','发放').replace('repayplan','还款计划').replace('repay','还款');
        }
        //封装分页结果
        var dataJson = new Object();
        dataJson.draw = req.query.draw;
        dataJson.recordsTotal = result.totalAmount;
        dataJson.recordsFiltered = result.totalAmount;
        dataJson.data = dataList;
        res.send(dataJson);
    });
});





router.get('/create', function(req, res, next) {
    var startDate = req.query.startDate.split('-').join('');
    var endDate = req.query.endDate.split('-').join('');
    var reportList = req.query.reportList;
    var reportType = req.query.reportType;
    var operator = req.session.userInfo.userName;
    var requestData = {
        "startDate":startDate,
        "endDate":endDate,
        "reportList":reportList,
        "reportType":reportType,
        "operator":operator
    };
    var url = config.get('integration.report.url.root') + config.get('integration.report.url.report.create');
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


//合同列表数据
router.get('/export_excel', function(req, res, next) {
    var requestData = {
        'batchNo':req.query.batchNo
    };
    var url = config.get('integration.report.url.root') + config.get('integration.report.url.report.getContent');
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
        var confs = [];
        var netSign = data.netSign;
        var rowsArray = [];
        if(netSign){
            var conf ={};
            conf.cols = [
                {
                    caption:'合同编号',
                    captionStyleIndex: 1,
                    type:'string',
                    width:50
                },
                {
                    caption:'贷款类别',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'借款人类别',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'借款人名称',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'借款人证件类型',
                    captionStyleIndex: 1,
                    type:'string',
                    width:30
                },
                {
                    caption:'借款人证件号码',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'合同金额',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'月利率(‰) ',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'合同签订日期',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'错误报送统计',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'放款日期',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'上报状态',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'返回代码',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                }
            ];
            for(var i=0; i<netSign.length; i++){
                var dataObj = netSign[i];
                dataObj.createTime = moment(+dataObj.createTime).format('YYYY-MM-DD HH:mm:ss');

                rowsArray.push([dataObj.contractNo, dataObj.loanCate, dataObj.customerType, dataObj.customerName, dataObj.certificateType, dataObj.certificateNo, dataObj.contractAmount, dataObj.intRate, dataObj.contractSignDate, dataObj.errorCount.toString(), dataObj.issueDate.toString(), dataObj.uploadStatus.toString(), dataObj.lastReturnCode])
            }
            conf.rows = rowsArray;
            confs.push(conf);
        }


        var issue = data.issue;
        if(issue){
            var conf ={};
            conf.cols = [
                {
                    caption:'合同编号',
                    captionStyleIndex: 1,
                    type:'string',
                    width:50
                },
                {
                    caption:'发放编号',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'借款人类别',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'借款人名称',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'借款人证件类型',
                    captionStyleIndex: 1,
                    type:'string',
                    width:30
                },
                {
                    caption:'借款人证件号码',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'发放金额',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'贷款类别',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'月利率(‰)',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'逾期月利率(‰)',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'利率性质',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'签约日期',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'发放日期',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'到期日期',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'投放区域',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'担保方式',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'贷款期限',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'贷款用途',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'贷款对象',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'贷款对象规模',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'计息方式',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'扣款方式',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'投放行业',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'五级分类',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'发放状态',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'错误报送统计',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'上报状态',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'返回代码',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
            ];
            rowsArray = [];

            for(var i=0; i<issue.length; i++){
                var dataObj = issue[i];
                rowsArray.push([dataObj.contractNo, dataObj.dueBillNo, dataObj.customerType, dataObj.customerName, dataObj.certificateType, dataObj.certificateNo, dataObj.ddAmt, dataObj.loanCate, dataObj.intRate, dataObj.priPltyRate, dataObj.rateType, dataObj.signDate, dataObj.ddDate
                    , dataObj.matureDate, dataObj.zone, dataObj.guarType, dataObj.term, dataObj.purpose, dataObj.loanObject, dataObj.loanObjectSize, dataObj.rateCalcMode
                    , dataObj.repayMode, dataObj.industry, dataObj.riskLevel, dataObj.issueStatus.toString(), dataObj.errorCount.toString(), dataObj.uploadStatus.toString(), dataObj.lastReturnCode])
            }
            conf.rows = rowsArray;
            confs.push(conf);
        }


        //还款计划
        var plan = data.plan;
        if(plan){
            var conf ={};
            conf.cols = [
                {
                    caption:'合同编号',
                    captionStyleIndex: 1,
                    type:'string',
                    width:50
                },
                {
                    caption:'发放编号',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'还款期数',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'应还日期',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'应还本金',
                    captionStyleIndex: 1,
                    type:'string',
                    width:30
                },
                {
                    caption:'应还利息',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'起息日期',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'止息日期',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'错误报送统计',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'放款日期',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'上报状态',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'返回代码',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                }
            ];
            rowsArray = [];

            for(var i=0; i<plan.length; i++){
                var dataObj = plan[i];
                rowsArray.push([dataObj.contractNo, dataObj.dueBillNo, dataObj.counter.toString(), dataObj.repayDate, dataObj.repayPriAmt.toString(), dataObj.repayIntAmt.toString(), dataObj.startDate, dataObj.endDate, dataObj.errorCount.toString(), dataObj.issueDate.toString(), dataObj.uploadStatus.toString(), dataObj.lastReturnCode])
            }
            conf.rows = rowsArray;
            confs.push(conf);
        }

        var contract = data.contract;
        if(contract){
            //贷款合同
            var conf ={};
            conf.cols = [
                {
                    caption:'合同编号',
                    captionStyleIndex: 1,
                    type:'string',
                    width:50
                },
                {
                    caption:'贷款类别',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'合同名称',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'借款人类别',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'借款人名称',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'借款人证件类型',
                    captionStyleIndex: 1,
                    type:'string',
                    width:30
                },
                {
                    caption:'借款人证件号码',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'贷款对象',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'贷款对象规模',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'合同签订日期',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'合同有效起始日期',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'合同有效结束日期',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'合同金额',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'贷款余额',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'担保方式',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'币种',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'是否额度项下贷款',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'月利率(‰)',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'逾期月利率(‰)',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'合同状态',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'客户经理',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'争议解决方式',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'错误报送统计',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'放款日期',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'上报状态',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'返回代码',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                }
            ];
            rowsArray = [];

            for(var i=0; i<contract.length; i++){
                var dataObj = contract[i];

                rowsArray.push([dataObj.contractNo, dataObj.loanCate, dataObj.contractName, dataObj.customerType, dataObj.customerName, dataObj.certificateType, dataObj.certificateNo, dataObj.loanObject, dataObj.loanObjectSize, dataObj.contractSignDate, dataObj.contractBeginDate, dataObj.contractEndDate, dataObj.contractAmount, dataObj.outstanding.toString()
                    , dataObj.guarType, dataObj.ccy, dataObj.isRealQuotaLoan, dataObj.intRate, dataObj.priPltyRate, dataObj.contractStatus, dataObj.relationManager
                    , dataObj.disputeScheme, dataObj.uploadStatus.toString(), dataObj.lastReturnCode, dataObj.errorCount.toString(), dataObj.issueDate
                ])
            }
            conf.rows = rowsArray;
            confs.push(conf);
        }



        //代扣回收
        var repay = data.repay;
        if(repay){
            var conf ={};
            conf.cols = [
                {
                    caption:'合同编号',
                    captionStyleIndex: 1,
                    type:'string',
                    width:50
                },
                {
                    caption:'发放编号',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'回收日期',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'还款期数',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'借款人类别',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'借款人名称',
                    captionStyleIndex: 1,
                    type:'string',
                    width:30
                },
                {
                    caption:'借款人证件类型',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'借款人证件号码',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'扣款方式',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'收回本金(元)',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'收回利息(元)',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'起息日期',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'止息日期',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'回收类型',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'逾期天数',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'逾期本金(元)',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'逾期利息(元)',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'逾期滞纳金(元)',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'逾期月利率(‰)',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'错误报送统计',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'上报状态',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                },
                {
                    caption:'返回代码',
                    captionStyleIndex: 1,
                    type:'string',
                    width:15
                }
            ];
            rowsArray = [];

            for(var i=0; i<repay.length; i++){
                var dataObj = repay[i];
                rowsArray.push([dataObj.contractNo, dataObj.dueBillNo , dataObj.repayDate, dataObj.counter.toString(), dataObj.customerType, dataObj.customerName, dataObj.certificateType, dataObj.certificateNo, dataObj.gatherMode, dataObj.repayPriAmt.toString(), dataObj.repayIntAmt.toString(), dataObj.startDate, dataObj.endDate
                    , dataObj.receiptType, dataObj.delayDays, dataObj.delayAmt, dataObj.delayInterest.toString(), dataObj.delayFee, dataObj.priPltyRate.toString(), dataObj.errorCount.toString(), dataObj.uploadStatus.toString(), dataObj.lastReturnCode
                ])
            }
            conf.rows = rowsArray;
            confs.push(conf);
        }

        var result = nodeExcel.execute(confs);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats');
        res.setHeader("Content-Disposition", "attachment; filename=" + "report.xlsx");
        res.end(result, 'binary');
    });
});

module.exports = router;
