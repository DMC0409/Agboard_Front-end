import { BleManager } from 'react-native-ble-plx';
import { SET_BT_DEVICE } from "../actionTypes";

// State 是一个自定义 JavaScript 对象或数组，用于表示储存状态（以及模样），需要在 reducer 中初始化定义最初的状态
const initialState = {
    BLEmanager: new BleManager(),
    device: null
};

// reducer 纯函数，根据先前状态以及当前调用的action行为来计算出新的状态的函数
export default function (state = initialState, action) {
    // 根据action特有属性type判断是什么行为，返回不同行为下的新的state对象
    switch (action.type) {
        // 设置岩板默认设置
        case SET_BT_DEVICE: {
            const device = action.payload;
            return {
                ...state,
                device: device
            };
        }
        default:
            return state;
    }
}
