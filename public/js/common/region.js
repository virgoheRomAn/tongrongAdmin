function getProvinceById(region, provinceId){
    if(provinceId){
        var provinceArray = region.province;
        for (var i = 0; i < provinceArray.length; i++) {
            if(provinceId==provinceArray[i].provinceId){
                return provinceArray[i].provinceName;
            }
        }
    }else{
        return "";
    }

}

function getCityById(region, cityId){
    if(cityId){
        var cityArray = region.city;
        for (var i = 0; i < cityArray.length; i++) {
            if(cityId==cityArray[i].cityId){
                return cityArray[i].cityName;
            }
        }
    }else{
        return "";
    }
}

function getAreaById(region, areaId){
    if(areaId){
        var areaArray = region.area;
        for (var i = 0; i < areaArray.length; i++) {
            if(areaId==areaArray[i].areaId){
                return areaArray[i].areaName;
            }
        }
    }else{
        return "";
    }
}


function initAreaAll(region, provinceId, cityId, areaId, provinceValue, cityValue, areaValue){
    var provinceArray = region.province;
    for (var i = 0; i < provinceArray.length; i++) {
        $('#' + provinceId).append('<option value="' + provinceArray[i].provinceId + '">' + provinceArray[i].provinceName + '</option>');
    };
    //绑定事件
    $('#' + provinceId).change(function(){
        getCity(region, provinceId, cityId, areaId, cityValue);
    });
    $('#' + cityId).change(function(){
        getArea(region, cityId, areaId, areaValue);
    });
    if(provinceValue){
        $('#' + provinceId).val(provinceValue);
        $('#' + provinceId).trigger("change");
    }
}


function getCity(region, provinceId, cityId, areaId, cityValue){
    //清空级联数据
    $('#' + cityId).html('<option value="">&nbsp;</option>');
    $('#' + areaId).html('<option value="">&nbsp;</option>');
    var cityArray = region.city;
    var provinceId = $('#' + provinceId).val();
    for (var i = 0; i < cityArray.length; i++) {
        if(cityArray[i].provinceId == provinceId){
            $('#' + cityId).append('<option value="' + cityArray[i].cityId + '">' + cityArray[i].cityName + '</option>');
        }
    };
    if(cityValue){
        $('#' + cityId).val(cityValue);
        $('#' + cityId).trigger("change");
    }
}

function getArea(region, cityId, areaId, areaValue){
    //清空级联数据
    $('#' + areaId).html('<option value="">&nbsp;</option>');
    var areaArray = region.area;
    var cityId = $('#' + cityId).val();
    for (var i = 0; i < areaArray.length; i++) {
        if(areaArray[i].cityId == cityId){
            $('#' + areaId).append('<option value="' + areaArray[i].areaId + '">' + areaArray[i].areaName + '</option>');
        }
    };
    if(areaValue){
        $('#' + areaId).val(areaValue);
    }
}