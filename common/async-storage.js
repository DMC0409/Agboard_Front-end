// 持久化储存
import AsyncStorage from '@react-native-async-storage/async-storage';

// set对象数据
export const setStoreData = async (key, value) => {
    try {
        const jsonValue = JSON.stringify(value)
        await AsyncStorage.setItem(key, jsonValue)
    } catch (e) {
        console.error(e);
    }
}

// get对象数据，返回promise，没有对应key则返回null
export const getStoreData = async (key) => {
    try {
        const jsonValue = await AsyncStorage.getItem(key)
        return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
        console.error(e);
    }
}

// set字符串数据
export const setStoreString = async (key, value) => {
    try {
        await AsyncStorage.setItem(key, value)
    } catch (e) {
        console.error(e);
    }
}

// get字符串数据
export const getStoreString = async (key) => {
    try {
        const value = await AsyncStorage.getItem(key)
        if (value !== null) {
            return value
        }
    } catch (e) {
        console.error(e);
    }
}

// remove字符串数据
export const removeStoreItem = async (key) => {
    try {
        await AsyncStorage.removeItem(key)
    } catch (e) {
        console.error(e);
    }
}