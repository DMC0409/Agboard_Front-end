import { combineReducers } from "redux";
import todos from "./todos";
import ble from "./ble";
import user from "./user";
import router from "./router";
import boardSetting from "./board-setting";
import login from "./login";

// 把所有reducer组合为一个rootReducer，并将其导出
export default combineReducers({ todos, ble, user, router, boardSetting, login });
