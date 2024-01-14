import { SET_USER_TOKEN, SET_USER_INFO, RESET_USER_DATA, SET_USER_PERMISSION, SET_USER_DELETE_LINE_PERMISSION } from "../actionTypes";

// State 是一个自定义 JavaScript 对象或数组，用于表示储存状态（以及模样），需要在 reducer 中初始化定义最初的状态
const initialState = {
    token: '',
    info: {
        userID: '',
        userRole: 0,
        // 1有，2无
        coursePermission: 2,
        // 1有，2无
        linePermission: 2,
        // 1有，2无
        lineDeletePermission: 2,
    }
};

// reducer 纯函数，根据先前状态以及当前调用的action行为来计算出新的状态的函数
export default function (state = initialState, action) {
    // 根据action特有属性type判断是什么行为，返回不同行为下的新的state对象
    switch (action.type) {
        // 设置用户token
        case SET_USER_TOKEN: {
            const { token } = action.payload;
            return {
                ...state,
                token: token
            };
        }
        // 设置用户信息
        case SET_USER_INFO: {
            const { userID, userRole } = action.payload;
            return {
                ...state,
                info: {
                    ...state.info,
                    userID: userID,
                    userRole: userRole
                }
            };
        }
        // 设置用户的发布线路权限和课程权限
        case SET_USER_PERMISSION: {
            const { linePermission, coursePermission } = action.payload;
            return {
                ...state,
                info: {
                    ...state.info,
                    linePermission: linePermission,
                    coursePermission: coursePermission
                }
            };
        }
        // 设置用户的删除线路权限
        case SET_USER_DELETE_LINE_PERMISSION: {
            const { permission } = action.payload;
            return {
                ...state,
                info: {
                    ...state.info,
                    lineDeletePermission: permission
                }
            };
        }
        // 清除用户相关数据
        case RESET_USER_DATA: {
            return {
                ...initialState
            }
        };
        default:
            return state;
    }
}
