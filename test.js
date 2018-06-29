
var path = require('path');
var dictUtil = require(path.join(process.cwd(), '/utils/dict_util'));
var request = require('request');



    // var url = 'http://usercenter.test.api.tongrong/user/findInfo';
    // // var url = 'http://dataresource.test.api.tongrong/faceId/getResult';
    // var data = {
    //     'userId':'120'
    // };
    // request({
    //     url: url,
    //     method: 'POST',
    //     json: true,
    //     headers: {
    //         'content-type': 'application/json',
    //     },
    //     body: data
    // }, function(error, response, body) {
    //     console.log(body);
    // });


// var url = 'http://10.55.110.209:8080/netsign/query';
// var data = {
//     'page':'1',
//     'limit':'1000'
// };
// var url = 'http://10.55.110.209:8080/report/create';
// var data = {
//     "startDate":"20171126",
//     "endDate":"20181130",
//     // "reportList":"netsign,contract,issue,repayplan,repay",
//     "reportList":"repay",
//     "reportType":"1",
//     "operator":"yangjie"
// };
// var url = 'http://10.55.110.209:8080/report/updateUrl';
// var data = {
//     "batchNo":"1528448817399",
//     "fileUrl":"xxxyyy"
// };
// var url = 'http://10.55.110.209:8080/report/list';
// var data = {
//     "offset":"0",
//     "limit":"10"
// };
// var url = 'http://10.55.110.209:8081/scoreCard/list';
// var data = {
//     "offset":"0",
//     "limit":"100"
// };
// var url = 'http://data.test.api.tongrong/black/list';
// var data = {
//     "offset":"0",
//     "limit":"100"
// };
// var url = 'http://10.0.1.1:8080/fadada/register';
// var url = 'http://dataresource.test.api.tongrong/fadada/register';
// var data = {
//     "uid":"123",
//     "customer_name":"蒋浚宇",
//     "id_card":"500113198807222416",
//     "mobile":"15823287816"
// };


// var url = 'http://10.0.1.1:8080/fadada/querySignResult';
// var url = 'http://dataresource.test.api.tongrong/fadada/querySignResult';
// var data = {
//     "transaction_id":"c2a748adf5684688ad47a22f55c21819"
// };

// var url = 'http://localhost:8080/usercenter/test';
// var data = {};


// var url = 'http://account.test.api.tongrong/account/init';
// var data = {
//     "userId":"123",
//     "orderId":"f5a78e63303c455ab25f663d691d99c7",
//     "amount":"2000",
//     "periods":"3",
//     "yearRate":"0.18",
//     "startDate":"2018-06-20",
//     "tenant":"0",
//     "bankCardNo":"6222503100032145000",
//     "idcardNo":"500113198807222416",
//     "name":"蒋浚宇",
//     "bankName":"中国工商银行",
//     "mobilePhone":"15823287816"
// };

// var url = 'http://payment.test.tongrong365.net/payment/pay/findPayTask';
// var data = {
//     "page":"1",
//     "limit":"100"
// };
// request(url, function (error, response, body) {
//         console.log(body) // Show the HTML for the baidu homepage.
// })
// var data = {};



// var url = 'http://10.55.110.210:8080/test/test1';
// // var url = 'http://localhost:8080/usercenter/test';
// var urlData = 'http://test.api.fabigbig.com:8888/api/downLoadContract.api?app_id=401257&timestamp=20180621162950&v=2.0&msg_digest=NzlCQjA4RUFGOUZBOUQ0Mjk1QTJGNzEzMTM5NjQ3Q0RBOUIwQUVDQg==&contract_id=976bf2a8a33f428aad3046e009f482bd';
// var data = {
//     "url":urlData
// };
// request.post({url:url, form:{url:urlData}}, function(error, response, body) {
//     if (!error && response.statusCode == 200) {
//         console.log(body);
//     }
// })




//     var url = 'http://10.55.110.210:12306/mock/test';
// var data = {
//     "uid":"127",
//     "id_card":"500227198503023518",
//     "mobile":"17723558969",
//     "customer_name":"杨捷"
// };
// var url = 'http://localhost:8080/due/findRepaymetList';
// var data = {
//     "loanId":"ed130ef45c0842b38e347e9ec2fd96ea"
// };
// var url = 'http://10.55.110.209:8081/product/addProduct';
// var data = {
//     "productCode":"8",
//     "productName":"信用贷2",
//     "parentProductName":"信用贷",
//     "parentProductCode":"1"
// };

// var url = 'http://10.55.110.209:8081/product/getProducts';
// var data = {
// };

// var url = 'http://10.55.110.209:8081/product/updateProductName';
// var data = {
//     "productCode":"7",
//     "productName":"信用贷4"
// };
// var url = "http://dataresource.test.api.tongrong/faceId/getToken";
// var data = {
//     "idNo":"500227198503023518",
//     "name":"杨捷"
// };
// var url = 'http://10.55.110.209:8081/product/propSave';
// var data = {
//     "productCode":"7",
//     "yearRate":"0.18",
//     "totalLimit":"8000000",
//     "singleDownLimit":"100000",
//     "singleUpLimit":"1000000",
//     "rateCalcMode":"1",
//     "urgeDays":"5",
//     "delayMonthRate":"0.05",
//     "isAllowPriRepay":"1",
//     "priRepayDays":"6",
//     "priViolateAmount":"1000",
//     "processKey":"processKey1",
//     "midlist":[
//         {"otherId":"1","type":"217","value":"5"},
//         {"otherId":"2","type":"217","value":"10"},
//         {"otherId":"1","type":"218","value":"1"},
//         {"otherId":"2","type":"218","value":"2"}
//     ],
//     "productFields":[
//         {"fieldName":"fileType","fieldType":"DICT","dictTypeCode":"FILE_TYPE", "dictFilter":"1,2"},
//         {"fieldName":"repayment","fieldType":"DICT","dictTypeCode":"REPAYMENT_METHOD", "dictFilter":"3"},
//     ]
// };

// var url = "http://account.test.api.tongrong/account/init";
// var url = "http://localhost:8080/account/init";
// var data = {
//     "userId":"123",
//     "orderId":"f5a78e63303c455ab25f663d691d99c7",
//     "amount":"300000",
//     "periods":"3",
//     "yearRate":"0.18",
//     "startDate":"2018-07-01",
//     "tenant":"0",
//     "bankCardNo":"6217002710000684874",
//     "idcardNo":"500227198503023518",
//     "name":"杨捷",
//     "bankName":"中国银行",
//     "mobilePhone":"18523380869"
//
// };
// var url = "http://localhost:8080/account/init";
// var data = {
//     "orderId":"f5a78e63303c455ab25f663d691d99c7"
// };

var url = 'http://localhost:8080/due/cron';
var data = {};
request({
    url: url,
    method: 'POST',
    json: true,
    headers: {
        'content-type': 'application/json',
    },
    body: data
}, function(error, response, body) {
    // console.log(body);
    console.log(body);

});