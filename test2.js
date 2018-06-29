var request = require('request');

var fs = require('fs');
fs.readFile('sampleProtocol.pdf', function (err, data) {
    // var url = 'http://10.0.1.1:8080/fadada/extSign';
    var url = 'http://dataresource.test.api.tongrong/fadada/extSign';
    var dataObj = new Object();
    dataObj.file = data.toString('base64');
    dataObj.uid = '123';
    dataObj.doc_title = '测试文档';
    dataObj.sign_keyword = '盖章';

    request({
        url: url,
        method: 'POST',
        json: true,
        headers: {
            'content-type': 'application/json',
        },
        body: dataObj
    }, function(error, response, body) {
        console.log(body);
        // var result = JSON.parse(body);
        // console.log(result);
    });
});







