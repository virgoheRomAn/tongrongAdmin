var fs = require('fs');
var JSZip = require('jszip');
var Docxtemplater = require('docxtemplater');
var ImageModule=require('docxtemplater-image-module');

exports.toFileWithImage = function(templatePath, stringData, imageData) {
    //读取模板内容
    var content = fs.readFileSync(templatePath, 'binary');
    var zip = new JSZip(content);
    var doc = new Docxtemplater();

    //图片参数
    var opts = {};
    opts.centered = false;
    opts.getImage=function(tagValue, tagName) {
        return fs.readFileSync(tagValue);
    };
    opts.getSize=function(img,tagValue, tagName) {
        return [imageData.width, imageData.height];
    };
    var imageModule=new ImageModule(opts);
    //绑定图片组件
    doc.attachModule(imageModule).loadZip(zip);
    //替换模板数据
    var allData = stringData;
    allData.image = imageData.path;
    doc.setData(allData);

    //生成word
    try {
        doc.render()
    }
    catch (error) {
        throw error;
    }
    var buf = doc.getZip().generate({type: 'nodebuffer', compression: "DEFLATE"});
    return buf;
};

