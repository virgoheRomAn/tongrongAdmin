var request = require('request');
var fs = require('fs');

var formData = {
    my_file: fs.createReadStream('D:\\deployment\\deployment.zip'),
};
request.post({url:'http://localhost:8080/repository/deployments', formData: formData}, function (error, response, body) {
    console.log(error);
    console.log(response);
    console.log(body);
    if (!error && response.statusCode == 200) {
    }
})



