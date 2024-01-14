import {
  SET_USER_TOKEN,
  SET_USER_INFO,
  SET_USER_PERMISSION,
  RESET_USER_DATA,
  SET_MAIN_NAVIGATION,
  SET_BOARD_SETTING,
  UPDATE_BOARD_SETTING_TYPE,
  SET_BT_DEVICE,
  UPDATE_BOARD_SETTING_ANGEL,
  SWITCH_LOGIN_AREA,
  SET_USER_DELETE_LINE_PERMISSION
} from "./actionTypes";

// action定义了要变化状态数据的行为的动作，本质是一个对象，但这里定义了函数来返回这个action对象；
// 其动作类型属性type是必有的；
// payload属性是其自带数据，会传给reducer函数；
// action上接用户调用（组件），下应reducer函数

// 设置用户token
export const setUserToken = token => ({
  type: SET_USER_TOKEN,
  payload: { token }
});

// 设置用户信息
export const setUserInfo = (userID, userRole) => ({
  type: SET_USER_INFO,
  payload: { userID, userRole }
});

// 设置用户的发布线路权限和课程权限
export const setUserPermission = (linePermission, coursePermission) => ({
  type: SET_USER_PERMISSION,
  payload: { linePermission, coursePermission }
});

// 设置用户的删除线路权限
export const setUserDeleteLinePermission = (permission) => ({
  type: SET_USER_DELETE_LINE_PERMISSION,
  payload: { permission }
});

// 清除用户相关数据
export const resetUserData = () => ({
  type: RESET_USER_DATA,
  payload: 0
});

// 设置根路由对象
export const setMainNavigation = (navigation) => ({
  type: SET_MAIN_NAVIGATION,
  payload: { navigation }
});

// 初次设置岩板默认设置
export const setBoardSetting = (type, angle) => ({
  type: SET_BOARD_SETTING,
  payload: { type, angle }
});

// 更新岩板默认设置的岩板类型
export const updateBoardSettingType = ({ id, name }) => ({
  type: UPDATE_BOARD_SETTING_TYPE,
  payload: { id, name }
});

// 更新岩板默认设置的岩板角度
export const updateBoardSettingAngel = ({ id, name }) => ({
  type: UPDATE_BOARD_SETTING_ANGEL,
  payload: { id, name }
});

// 保存当前的蓝牙设备对象
export const set_BT_Device = (device) => ({
  type: SET_BT_DEVICE,
  payload: device
});

// 更新当前登录的地区
export const switchLoginArea = (areaID) => ({
  type: SWITCH_LOGIN_AREA,
  payload: { areaID }
});

