import { PermissionsAndroid, Platform } from "react-native";

// 精确位置权限
export const ACCESS_FINE_LOCATION = 'ACCESS_FINE_LOCATION'
// 读取系统文件
export const READ_EXTERNAL_STORAGE = 'READ_EXTERNAL_STORAGE'
// 写入系统文件
export const WRITE_EXTERNAL_STORAGE = 'WRITE_EXTERNAL_STORAGE'
// android12 蓝牙权限
export const BLT_Permission = 'BLT_Permission'

// android平台的权限检查和请求
export const permissionRequest = async (item) => {
    if (Platform.OS === 'ios') {
        // ios 跳过检查
        return true;
    } else if (Platform.OS === 'android') {
        if (item === BLT_Permission) {
            if (Number(Platform.Version) > 30) {
                const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)
                await PermissionsAndroid.requestMultiple([PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN, PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT])
                return granted === PermissionsAndroid.RESULTS.GRANTED ? true : false;
            } else {
                const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION)
                return granted === PermissionsAndroid.RESULTS.GRANTED ? true : false;
            }
        }
        // 请求权限
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS[item]
        );
        // 检查请求结果
        return granted === PermissionsAndroid.RESULTS.GRANTED ? true : false;
    }
};
