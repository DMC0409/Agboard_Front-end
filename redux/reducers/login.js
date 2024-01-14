import { SWITCH_LOGIN_AREA } from "../actionTypes";

// State 是一个自定义 JavaScript 对象或数组，用于表示储存状态（以及模样），需要在 reducer 中初始化定义最初的状态
const initialState = {
    loginArea: 0,
};

// reducer 纯函数，根据先前状态以及当前调用的action行为来计算出新的状态的函数
export default function (state = initialState, action) {
    // 根据action特有属性type判断是什么行为，返回不同行为下的新的state对象
    switch (action.type) {
        // 设置根路由对象
        case SWITCH_LOGIN_AREA: {
            const { areaID } = action.payload;
            return {
                ...state,
                loginArea: areaID
            };
        }
        default:
            return state;
    }
}
