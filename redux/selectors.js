// selector是react-redux自有的一个层级，作用是在状态获取方和store方建立一个抽象层；
// 组件可通过selector函数形式获取到想要的数据及数据格式；
// 函数接收一个必有的store属性，返回需要的数据对象格式；

// 获取整个store
export const getStore = store => store;

// 获取蓝牙相关State
export const getBLE_State = store => store.ble;

// 获取 BLEmanager 实例对象
export const getBLE_Manager = store => getBLE_State(store).BLEmanager;

// 获取蓝牙设备对象
export const getBT_Device = store => getBLE_State(store).device;

// 获取用户信息相关State
export const getUserState = store => store.user;

// 获取用户token
export const getUserToken = store => getUserState(store).token;

// 获取用户信息 {userID: '', userRole: 0, coursePermission: 2, linePermission: 2, lineDeletePermission: 2}
export const getUserInfo = store => getUserState(store).info;

// 获取路由相关State
export const getRouterState = store => store.router;

// 获取根路由的 navigation 对象
export const getMainNavigation = store => getRouterState(store).mainNavigation;

// 获取岩板设置相关State
export const getBoardSettingState = store => store.boardSetting;

// 获取岩板设置的岩板类型 model=> {id: '',name: '', upID: ''}
export const getBoardSettingType = store => getBoardSettingState(store).type;

// 获取岩板设置的岩板角度 model=> {id: '',name: '', upID: ''}
export const getBoardSettingAngel = store => getBoardSettingState(store).angle;

// 获取登录相关信息
export const getLoginInfo = store => store.login;

// 获取当前登录地区
export const getLoginArea = store => getLoginInfo(store).loginArea;