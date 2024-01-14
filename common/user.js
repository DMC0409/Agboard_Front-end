import { setStoreData, getStoreData, setStoreString, getStoreString, removeStoreItem } from "../common/async-storage";

// 设置userToken
export const saveUserToken = (token) => {
    return setStoreString('USER_TOKEN', token);
}

// 获取userToken
export const takeUserToken = () => {
    return getStoreString('USER_TOKEN');
}

// 移除userToken
export const romoveUserToken = () => {
    return removeStoreItem('USER_TOKEN');
}

// 设置用户信息
export const saveUserInfo = (userID, userRole) => {
    return setStoreData('USER_INFO', { userID, userRole });
}

// 获取用户信息
export const takeUserInfo = () => {
    return getStoreData('USER_INFO');
}

// 移除用户信息
export const romoveUserInfo = () => {
    return removeStoreItem('USER_INFO');
}

