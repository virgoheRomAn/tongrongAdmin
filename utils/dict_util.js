exports.getDictDescByCode = function(dicts, dictTypeCode, dictCode) {
    if(dictTypeCode && dictCode){
        for (var i = 0; i < dicts.length; i++) {
            if(dictTypeCode==dicts[i].typeCode && dictCode==dicts[i].code){
                return dicts[i].codeDesc;
            }
        }
    }else{
        return "";
    }
};

exports.getDictTypeDescByCode = function(dicts, dictTypeCode) {
    if(dictTypeCode){
        for (var i = 0; i < dicts.length; i++) {
            if(dictTypeCode==dicts[i].typeCode){
                return dicts[i].typeDesc;
            }
        }
    }else{
        return "";
    }
};

exports.getDictItemsByTypeCode = function(dicts, dictTypeCode) {
    var dictItems = [];
    for (var i = 0; i < dicts.length; i++) {
        if(dictTypeCode==dicts[i].typeCode){
            dictItems.push(dicts[i]);
        }
    }
    return dictItems;
};

