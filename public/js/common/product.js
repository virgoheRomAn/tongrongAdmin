function getProductNameByCode(products, productCode){
    if(productCode){
        for (var i = 0; i < products.length; i++) {
            if(productCode==products[i].productCode){
                return products[i].productName;
            }
        }
    }else{
        return "";
    }

}


function initProduct(products, productId, childProductId, productCode, childProductCode){
    //重置下拉选项
    var productArray = [];
    for (var i = 0; i < products.length; i++) {
        if(products[i].parentProductCode=='-1'){
            productArray.push(products[i]);
        }
    }
    for (var i = 0; i < productArray.length; i++) {
        $('#' + productId).append('<option value="' + productArray[i].productCode + '">' + productArray[i].productName + '</option>');
    };

    //绑定事件
    $('#' + productId).change(function(){
        getChildProduct(products, productId, childProductId, childProductCode);
    });

    //初始化值
    if(productCode){
        $('#' + productId).val(productCode);
        $('#' + productId).trigger("change");
    }
}

function getChildProduct(products, productId, childProductId, childProductCode){
    //重置级联数据
    $('#' + childProductId).html('<option value="">&nbsp;</option>');
    var productCode = $('#' + productId).val();
    for (var i = 0; i < products.length; i++) {
        if(products[i].parentProductCode == productCode){
            $('#' + childProductId).append('<option value="' + products[i].productCode + '">' + products[i].productName + '</option>');
        }
    };
    if(childProductCode){
        $('#' + childProductId).val(childProductCode);
    }
}

function initProductFields(productCode, childProductCode, formFieldData){
    var url = "/common/data/getProductFields?productCode=" + productCode + "&childProductCode=" + childProductCode;
    $.get(url, function(data){
        for(var fieldName in data){
            //重置数据
            $('#' + fieldName).html('<option value="">&nbsp;</option>');

            //填充数据
            var fieldDicts = data[fieldName];
            for(var j=0; j<fieldDicts.length; j++) {
                if(formFieldData && fieldDicts[j].code==formFieldData[fieldName]){
                    $('#' + fieldName).append('<option value="' + fieldDicts[j].code + '" selected>' + fieldDicts[j].codeDesc + '</option>');
                }else{
                    $('#' + fieldName).append('<option value="' + fieldDicts[j].code + '">' + fieldDicts[j].codeDesc + '</option>');
                }
            }
        }
    });
}