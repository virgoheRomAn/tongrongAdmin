var Decimal = require('decimal');
var path = require('path');
var dictHelper = require(path.join(process.cwd(), '/helper/dict_helper'));

//创建目录
var dataFormat = function(req, data) {
    var dict = req.session.dict;
    var dataMap = {'repayment':'REPAYMENT_METHOD'};
    //TODO 根据产品配置
    if(true){
        dataMap.riskTerm = 'TERM_NO';
    }
    var data =  dictHelper.getDescData(dict, data, dataMap);

    if(data.rate){
        data.rate = data.rate * 100;
    }
    if(data.finalAccount){
        data.finalAccount = Decimal(data.finalAccount).div(Decimal('100')).toNumber().toFixed(0);
    }
    return data;
};

exports.dataFormat = dataFormat;



