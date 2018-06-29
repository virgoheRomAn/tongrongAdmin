var fs = require('fs');
var config = require('config');
var COS = require('cos-nodejs-sdk-v5');

//腾讯云对象存储
var sensitiveConfigPath = config.get('sensitive_config_path');
var sensitiveConfigData = fs.readFileSync(sensitiveConfigPath);
var sensitiveConfigDataJson = JSON.parse(sensitiveConfigData);
var cos = new COS({
    AppId: sensitiveConfigDataJson.tencent.AppId,
    SecretId: sensitiveConfigDataJson.tencent.cos.SecretId,
    SecretKey: sensitiveConfigDataJson.tencent.cos.SecretKey,
});


exports.download = function(filePath, callback) {
    cos.getObject({
        Bucket: sensitiveConfigDataJson.tencent.cos.Bucket,
        Region: sensitiveConfigDataJson.tencent.cos.Region,
        Key: filePath,
        onProgress: function (progressData) {
            //console.log(JSON.stringify(progressData));
        }
    },callback);
};

exports.upload = function(cloudPath, nativeFilePath, callback) {
    cos.sliceUploadFile({
        Bucket: sensitiveConfigDataJson.tencent.cos.Bucket,
        Region: sensitiveConfigDataJson.tencent.cos.Region,
        Key: cloudPath,
        FilePath: nativeFilePath
    }, callback);
};


