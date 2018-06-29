var _ = require('lodash');

exports.renderHtml = function (req, res, menuId, view, data) {
    var userInfo = req.session.userInfo;
    var topMenus = req.session.topMenus;
    var menuIdLevel1 = req.session.menuIdLevel1;
    var allMenus = req.session.allMenus;
    var menusArray = [];
    getHierarchyMenus(menusArray, allMenus, menuId);

    var menusNamesArray = [];
    for (var i = menusArray.length - 1; i >= 0; i--) {
        menusNamesArray.push(menusArray[i].permissionName);
    }

    var obj = _.assign({
        'view': view,
        'menuId': menuId,
        'userInfo': userInfo,
        'topMenus': topMenus,
        'menuIdLevel1': menuIdLevel1,
        'menusNamesArray': menusNamesArray
    }, data);
    res.render('template', obj);
};

function getHierarchyMenus(menusArray, allMenus, menuId) {
    for (var i = 0; i < allMenus.length; i++) {
        if (allMenus[i].permissionId == menuId) {
            menusArray.push(allMenus[i]);
            getHierarchyMenus(menusArray, allMenus, allMenus[i].parentPermissionId);
        }
    }
}
