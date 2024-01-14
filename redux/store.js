// redux store本质是一个单例对象，唯一的数据源对象

import { createStore } from "redux";
import rootReducer from "./reducers/index";

// 创建store，注册所有的Reducer
export default createStore(rootReducer);
