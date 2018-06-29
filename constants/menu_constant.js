var menuConstant = [
    {menuId:'1', menuName:'羽象抵押业务合同管理', menuPid:'tools',menuPname:'工具菜单', url:'/order/yx_pledge_contract_batch/list'},
    {menuId:'2', menuName:'代扣管理', menuPid:'tools',menuPname:'工具菜单', url:'/tools/deduct/list'},
    // {menuId:'3', menuName:'大表单', menuPid:'tools',menuPname:'工具菜单', url:'/tools/deduct/form2'},
    {menuId:'4', menuName:'贷款申请', menuPid:'task',menuPname:'业务管理', url:'/task/assign_task/list', otherInfo:{'listKey':'loanApplication'}},
    {menuId:'5', menuName:'贷款审批', menuPid:'task',menuPname:'业务管理', url:'/task/assign_task/list', otherInfo:{'listKey':'loanApproval'}},
    {menuId:'6', menuName:'合同确认', menuPid:'task',menuPname:'业务管理', url:'/task/assign_task/list', otherInfo:{'listKey':'contractConfirm'}},
    {menuId:'7', menuName:'放款审查', menuPid:'task',menuPname:'业务管理', url:'/task/assign_task/list', otherInfo:{'listKey':'paymentCheck'}},
    {menuId:'8', menuName:'放款管理', menuPid:'task',menuPname:'业务管理', url:'/task/assign_task/list', otherInfo:{'listKey':'payment'}},
    {menuId:'9', menuName:'还款管理', menuPid:'task',menuPname:'业务管理', url:'/biz/repayment/list', otherInfo:{'listKey':'payment'}},
    {menuId:'10', menuName:'业务查询', menuPid:'biz',menuPname:'订单查询', url:'/biz/order/list'}
    // {menuId:'10', menuName:'密码修改', menuPid:'system',menuPname:'系统设置', url:'/system/system/form'}
];

module.exports = menuConstant;