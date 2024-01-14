// 线路排序项配置
export const LINE_SORT_CONFIG = [
    { type: 'time', name: '最近创建', value: 'DESC' },
    { type: 'cert', name: '认证优先', value: 'ASC' },
    { type: 'complete', name: '完成数排序', value: 'DESC' },
    { type: 'collect', name: '收藏数排序', value: 'DESC' },
    { type: 'level', name: '难度升序', value: 'ASC' },
    { type: 'level', name: '难度降序', value: 'DESC' },
    { type: 'score', name: '评分升序', value: 'ASC' },
    { type: 'score', name: '评分降序', value: 'DESC' },
]

// 难度配置列表
export const LINE_LEVEL_LIST = [
    'V0',
    'V1',
    'V2',
    'V3',
    'V4',
    'V5',
    'V6',
    'V7',
    'V8',
    'V9',
    'V10',
    'V11',
    'V12',
    'V13',
    'V14',
    'V15',
    'V16'
];

// YDS难度体系配置列表
export const LINE_LEVEL_YDS_LIST = [
    '5.10ab',
    '5.10bc',
    '5.10cd',
    '5.11ab',
    '5.11bc',
    '5.11cd',
    '5.12ab',
    '5.12bc',
    '5.12cd',
    '5.13ab',
    '5.13bc',
    '5.13cd',
    '5.14a',
    '5.14b',
    '5.14c',
    '5.14d',
    '5.15a',
];

// YDS难度体系和V体系的对应关系-map
export const LINE_LEVEL_YDS_MAP = {
    '5.10ab': 'V0',
    '5.10bc': 'V1',
    '5.10cd': 'V2',
    '5.11ab': 'V3',
    '5.11bc': 'V4',
    '5.11cd': 'V5',
    '5.12ab': 'V6',
    '5.12bc': 'V7',
    '5.12cd': 'V8',
    '5.13ab': 'V9',
    '5.13bc': 'V10',
    '5.13cd': 'V11',
    '5.14a': 'V12',
    '5.14b': 'V13',
    '5.14c': 'V14',
    '5.14d': 'V15',
    '5.15a': 'V16',
    'V0': '5.10ab',
    'V1': '5.10bc',
    'V2': '5.10cd',
    'V3': '5.11ab',
    'V4': '5.11bc',
    'V5': '5.11cd',
    'V6': '5.12ab',
    'V7': '5.12bc',
    'V8': '5.12cd',
    'V9': '5.13ab',
    'V10': '5.13bc',
    'V11': '5.13cd',
    'V12': '5.14a',
    'V13': '5.14b',
    'V14': '5.14c',
    'V15': '5.14d',
    'V16': '5.15a',
};

// 线路列表的每页展示数
export const PAGE_SIZE = 10

// 标签“儿童”的ID值
export const CHILD_LABEL_ID = '7';

// 标签颜色MAP
export const labelColorMap = new Map();
// 青少年 id4
labelColorMap.set('青少年', '#92d050');
// 成人 id5
labelColorMap.set('成人', '#ffc000');
// 女性友好 id6
labelColorMap.set('女性友好', '#ff66cc');
// 儿童 id7
labelColorMap.set('儿童', '#00b0f0');

// 岩板图片的长宽像素值
export const boardImgHight = 1641;
export const boardImgWidth = 1080;

// 每帧的默认时长
export const FRAME_DE_TIME = 30;

export const FRAME_LONG_MAP = {
    '57': 'x0.1',
    '54': 'x0.2',
    '51': 'x0.3',
    '48': 'x0.4',
    '45': 'x0.5',
    '42': 'x0.6',
    '39': 'x0.7',
    '36': 'x0.8',
    '33': 'x0.9',
    '30': 'x1.0',
    '27': 'x1.1',
    '24': 'x1.2',
    '21': 'x1.3',
    '18': 'x1.4',
    '15': 'x1.5',
    '12': 'x1.75',
    '9': 'x2.0',
    '6': 'x2.25',
    '3': 'x2.5',
};

// 难度路线倍速和秒的关系map（以10秒作为基准）
export const FRAME_TIME_MAP = (value) => {
    const map = FRAME_LONG_MAP;
    return map[String(value)];
}