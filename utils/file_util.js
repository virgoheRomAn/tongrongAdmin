var fs = require('fs');
var path = require('path');

//创建目录
var mkdirsSync = function(dirname) {
    if(fs.existsSync(dirname)){
        return true;
    }else{
        if(mkdirsSync(path.dirname(dirname))){
            fs.mkdirSync(dirname);
            return true;
        }
    }
};

exports.mkdirsSync = mkdirsSync;



