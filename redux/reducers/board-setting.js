import { SET_BOARD_SETTING, UPDATE_BOARD_SETTING_TYPE, UPDATE_BOARD_SETTING_ANGEL } from "../actionTypes";

// State 是一个自定义 JavaScript 对象或数组，用于表示储存状态（以及模样），需要在 reducer 中初始化定义最初的状态
const initialState = {
    type: {
        id: '',
        name: '',
        upID: ''
    },
    angle: {
        id: '',
        name: '',
        upID: ''
    }
};

// reducer 纯函数，根据先前状态以及当前调用的action行为来计算出新的状态的函数
export default function (state = initialState, action) {
    // 根据action特有属性type判断是什么行为，返回不同行为下的新的state对象
    switch (action.type) {
        // 设置岩板默认设置
        case SET_BOARD_SETTING: {
            const { type, angle } = action.payload;
            return {
                ...state,
                type: type,
                angle: angle
            };
        }
        // 更新岩板类型默认设置
        case UPDATE_BOARD_SETTING_TYPE: {
            const { id, name } = action.payload;
            return {
                ...state,
                type: {
                    ...state.type,
                    id: id,
                    name: name
                },
            };
        }
        // 更新岩板类型默认设置
        case UPDATE_BOARD_SETTING_ANGEL: {
            const { id, name } = action.payload;
            return {
                ...state,
                angle: {
                    ...state.type,
                    id: id,
                    name: name
                },
            };
        }
        default:
            return state;
    }
}
