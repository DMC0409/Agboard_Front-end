// 我的模块config（该config下，id不可重复）

// 业务功能列表数据
export const MINE_FEATURE_LIST = [
    {
        id: 'temp',
        name: '新"我的"页面设计原型',
        icon: require('../static/img/common-icons/edit-filling.png')
    },
    {
        id: '1',
        name: '草稿箱',
        icon: require('../static/img/common-icons/edit-filling.png')
    },
    {
        id: '2',
        name: '排行榜',
        icon: require('../static/img/common-icons/dynamic-filling.png')
    },
    {
        id: '8',
        name: '申请开通线路设计权限',
        icon: require('../static/img/common-icons/mail_fill.png')
    },
];

// 通用功能列表数据
export const MINE_COMMON_LIST = [
    {
        id: '3',
        name: '设置',
        icon: require('../static/img/common-icons/setting-filling.png')
    },
    {
        id: '11',
        name: '使用说明',
        icon: require('../static/img/common-icons/instructions.png')
    }
];

// 课程管理功能列表数据
export const MINE_COURSE_LIST = [
    {
        id: '10',
        name: '课程管理',
        icon: require('../static/img/common-icons/setting-filling.png')
    }
];

// 管理员功能列表数据
export const MINE_ADMIN_LIST = [
    {
        id: '9',
        name: '用户管理',
        icon: require('../static/img/common-icons/group_fill.png')
    },
    {
        id: '4',
        name: '课程管理',
        icon: require('../static/img/common-icons/contacts-fill.png')
    },
    {
        id: '12',
        name: '发布通知',
        icon: require('../static/img/common-icons/notice.png')
    },
    {
        id: '13',
        name: '线路反馈',
        icon: require('../static/img/common-icons/feed-back.png')
    },
    {
        id: '5',
        name: '岩灯测试',
        icon: require('../static/img/common-icons/LED.png')
    },
    // {
    //     id: '6',
    //     name: '切换岩板（管理员用）',
    //     icon: require('../static/img/common-icons/setting-filling.png')
    // },
    {
        id: '7',
        name: '岩点颜色测试',
        icon: require('../static/img/common-icons/setting-filling.png')
    },
];

// 设置模块cofig（该config下，id不可重复）

// 设置列表数据
export const SETTING_LIST_BUSINESS = [
    { id: '1', name: '默认岩板类型' },
    { id: '4', name: '默认岩板角度' },
    { id: '5', name: '自动换线' },
];

// 设置列表数据
export const SETTING_LIST_COMMON = [
    // { id: '2', name: '用户协议' },
    // { id: '3', name: '隐私协议' },
];

// 用户个人设置config（该config下，id不可重复）

// 用户个人设置列表数据
export const PERSONAL_SETTING_LIST = [
    { id: '5', name: '更换背景' },
    { id: '1', name: '更换头像' },
    { id: '2', name: '修改昵称' },
    { id: '3', name: '编辑简介' },
    { id: '4', name: '编辑外部链接' },
];

// 默认头像
export const DEFAULT_AVATER = require('../static/img/common-icons/default-avatar.png');