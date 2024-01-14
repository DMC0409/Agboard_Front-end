// State 是一个自定义 JavaScript 对象或数组，用于表示储存状态（以及模样），需要在 reducer 中初始化定义最初的状态
const initialState = {
    allIds: [],
    byIds: {}
};

// reducer 纯函数，根据先前状态以及当前调用的action行为来计算出新的状态的函数
export default function (state = initialState, action) {
    // 根据action特有属性type判断是什么行为，返回不同行为下的新的state对象
    switch (action.type) {
        case 'ADD_TODO': {
            const { id, content } = action.payload;
            return {
                ...state,
                allIds: [...state.allIds, id],
                byIds: {
                    ...state.byIds,
                    [id]: {
                        content,
                        completed: false
                    }
                }
            };
        }
        case 'TOGGLE_TODO': {
            const { id } = action.payload;
            return {
                ...state,
                byIds: {
                    ...state.byIds,
                    [id]: {
                        ...state.byIds[id],
                        completed: !state.byIds[id].completed
                    }
                }
            };
        }
        default:
            return state;
    }
}
