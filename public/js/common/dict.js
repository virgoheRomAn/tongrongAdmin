function getDictDescByCode(dicts, dictTypeCode, dictCode){
    if(dictTypeCode && dictCode){
        for (var i = 0; i < dicts.length; i++) {
            if(dictTypeCode==dicts[i].typeCode && dictCode==dicts[i].code){
                return dicts[i].codeDesc;
            }
        }
    }else{
        return "";
    }
}


function fillSelectDict(selectId, dicts){
    for(var i = 0; i < dicts.length; i++) {
        $('#' + selectId).append('<option value="' + dicts[i].code + '">' + dicts[i].codeDesc + '</option>');
    }
}