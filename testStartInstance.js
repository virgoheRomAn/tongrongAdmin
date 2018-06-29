var request = require('request');
var fs = require('fs');

var applicationNo = '93f319622c2c4e7e93ac632f090c34a4';
//启动流程
var data = {
    "processDefinitionKey":"creditLoanProcess1",
    "businessKey":applicationNo
};


// //启动流程
// var data = {
//     "processDefinitionKey":"test",
//     "businessKey":"123"
// };
// var url = 'http://workflow.dev.api.tongrong/runtime/process-instances';
var url = 'http://workflow.test.api.tongrong/runtime/process-instances';
// var url = 'http://localhost:8080/runtime/process-instances';

request({
    url: url,
    method: "POST",
    json: true,
    headers: {
        "content-type": "application/json",
    },
    body: data
}, function(error, response, body) {
    console.log(body);
});


