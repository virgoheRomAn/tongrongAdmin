var express = require('express');
var router = express.Router();


router.get('/getMenus', function(req, res, next) {
    var menuIdLevel1 = req.query.menuIdLevel1;
    req.session.menuIdLevel1 = menuIdLevel1;

    //获取所有一级目录下所有菜单id
    var allMenus = req.session.allMenus;
    var level1MenuIds = [];
    getLevel1MenuIds(level1MenuIds, allMenus, menuIdLevel1);


    //过滤用户有权限的一级目录下的菜单
    var operatorMenus =  req.session.operatorMenus;
    var operatorlevel1Menus = [];
    for(var i=0; i<operatorMenus.length; i++){
        if(level1MenuIds.indexOf(operatorMenus[i].permissionId)!=-1){
            operatorlevel1Menus.push(operatorMenus[i]);
        }
    }

    //获取一级目录id
    var topMenus =  req.session.topMenus;
    var topMenuIds = [];
    for(var i=0; i<topMenus.length; i++){
        topMenuIds.push(topMenus[i].permissionId);
    }


    //菜单分为两类显示，一类是父菜单是一级目录的，一类是还有父菜单不是一级目录的
    var operatorMenus1 = [];
    var operatorMenus2 = [];
    for(var i=0; i<operatorlevel1Menus.length; i++){
        if(topMenuIds.indexOf(operatorlevel1Menus[i].parentPermissionId)!=-1 && operatorlevel1Menus[i].url){
            operatorMenus1.push(operatorlevel1Menus[i]);
        }else{
            operatorMenus2.push(operatorlevel1Menus[i]);
        }
    }

    //父菜单不是一级目录的数据封装
    //获取二级目录id
    var topMenuIds = req.session.topMenuIds;
    var menuFolderIds = [];
    for(var i=0; i<operatorMenus2.length; i++){
        //过滤重复项
        if(menuFolderIds.indexOf(operatorMenus2[i].parentPermissionId)==-1){
            menuFolderIds.push(operatorMenus2[i].parentPermissionId);
        }
    }
    //封装数据
    var operatorMenuItems = [];
    for(var i=0; i<menuFolderIds.length; i++){
        var menuItem = new Object();
        var menus = [];
        for(var j=0; j<allMenus.length; j++){
            if(allMenus[j].permissionId == menuFolderIds[i]){
                menuItem.menuFolderName = allMenus[j].permissionName;
            }

        }
        for(var j=0; j<operatorlevel1Menus.length; j++){
            if(operatorlevel1Menus[j].parentPermissionId == menuFolderIds[i]){
                menus.push(operatorlevel1Menus[j]);
            }
        }
        menuItem.menuId = menuFolderIds[i];
        menuItem.menus = menus;
        operatorMenuItems.push(menuItem);
    }

    var data = new Object();
    data.menus1 = operatorMenus1;
    data.menus2 = operatorMenuItems;
    res.send(data);
});


function getLevel1MenuIds(level1MenuIds, allMenus, menuId){
    for(var i=0; i<allMenus.length; i++){
        if(allMenus[i].parentPermissionId == menuId){
            level1MenuIds.push(allMenus[i].permissionId);
            getLevel1MenuIds(level1MenuIds, allMenus, allMenus[i].permissionId);
        }
    }
}

module.exports = router;
