var getDescData = function(dict, data, dataMap) {
    for(var i=0; i<dict.length; i++){
        for(var key in dataMap){
            if(dict[i].typeCode == dataMap[key] && dict[i].code == data[key]){
                data[key] = dict[i].codeDesc;
            }
        }
    }
    return data;
};

exports.getDescData = getDescData;




