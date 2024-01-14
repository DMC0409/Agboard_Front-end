import { START, FOOT, HAND, END } from "./board";
import { SERVICE_UUID, WEITE_CHARACTERISTIC_UUID } from "../common/BLE";
import { Buffer } from "buffer"

// 定义led 8 个颜色的 RGB （第一个默认设为关灯）注意顺序
const LED_COLOR_DEFINE = [
    // 0 关灯
    0x00, 0x00, 0x00,
    // 1 START
    parseInt(`0x${START.COLOR.slice(1, 3)}`), parseInt(`0x${START.COLOR.slice(3, 5)}`), parseInt(`0x${START.COLOR.slice(5, 7)}`),
    // 2 FOOT
    parseInt(`0x${FOOT.COLOR.slice(1, 3)}`), parseInt(`0x${FOOT.COLOR.slice(3, 5)}`), parseInt(`0x${FOOT.COLOR.slice(5, 7)}`),
    // 3 HAND
    parseInt(`0x${HAND.COLOR.slice(1, 3)}`), parseInt(`0x${HAND.COLOR.slice(3, 5)}`), parseInt(`0x${HAND.COLOR.slice(5, 7)}`),
    // 4 END
    parseInt(`0x${END.COLOR.slice(1, 3)}`), parseInt(`0x${END.COLOR.slice(3, 5)}`), parseInt(`0x${END.COLOR.slice(5, 7)}`),
    // 5 关灯
    0x00, 0x00, 0x00,
    // 6 关灯
    0x00, 0x00, 0x00,
    // 7 关灯
    0x00, 0x00, 0x00,
];

// 0x82 定义颜色的蓝牙发送数据
export const BT_COLOR_SENT = [0xAA, 0x1f, 0x82, 0x00, 0x18, ...LED_COLOR_DEFINE, 0x00, 0x00];

// 返回 0x81 控制灯珠的 一页的 蓝牙发送数据, 
// 参数 DATA_LIST 为 32 个 16进制 元素,
// 参数 COUNT 为第几页数据，int类型，值为0~7
export const RETURN_BT_CTRL_SENT_PAGE = (DATA_LIST, COUNT) => {
    let count = 0x00;
    switch (COUNT) {
        case 0:
            count = 0x00
            break;
        case 32:
            count = 0x01
            break;
        case 64:
            count = 0x02
            break;
        case 96:
            count = 0x03
            break;
        case 128:
            count = 0x04
            break;
        case 160:
            count = 0x05
            break;
        case 192:
            count = 0x06
            break;
        case 224:
            count = 0x07
            break;
        default:
            count = 0x00
            break;
    }
    return [0xAA, 0x27, 0x81, count, 0x20, ...DATA_LIST, 0x00, 0x00];
};

// 接收两个岩点状态ID
// 返回的数据用于表示两个 灯珠ID 的控制数据
export const returnCtrlByte = (stateID1, stateID2) => {
    // 两个 0~7 之间的数，代表的是颜色代号，返回这两个数的 16进制 表达形式
    const colorCode1 = returnColorCode(stateID1);
    const colorCode2 = returnColorCode(stateID2);
    return parseInt(`0x${colorCode1}${colorCode2}`);
}

// 根据 岩点状态ID 返回 颜色代号
const returnColorCode = (stateID) => {
    switch (stateID) {
        case START.ID:
            return 1;
        case FOOT.ID:
            return 2;
        case HAND.ID:
            return 3;
        case END.ID:
            return 4;
        default:
            return 0;
    }
}

// 0x83 刷新显示数据
export const BT_LED_REFURBISH = [0xAA, 0x08, 0x83, 0x00, 0x00, 0x00, 0x00, 0x00];

// 封装数据帧的方法
const packingData = (count, pointHashMap) => {
    let currentCount = count;
    let dataList = [];
    // 循环32次，填充32byte数据帧
    for (let index = 0; index < 32; index++) {
        let stateID1 = 0;
        let stateID2 = 0;
        if (pointHashMap[currentCount.toString()]) {
            stateID1 = pointHashMap[currentCount.toString()];
        }
        if (pointHashMap[(currentCount + 1).toString()]) {
            stateID2 = pointHashMap[(currentCount + 1).toString()];
        }
        dataList.push(returnCtrlByte(stateID1, stateID2));
        currentCount = currentCount + 2;
    }
    const result = RETURN_BT_CTRL_SENT_PAGE(dataList, count * 0.5);
    return { currentCount, result }
}

// 向设备发送关闭全部岩灯的指令
const closeAllLed = async (device, isInit) => {
    try {
        const pointHashMap = {};
        // 当前轮到的岩灯ID
        let count = 0
        // 第 0 页数据
        const page0 = packingData(count, pointHashMap);
        count = page0.currentCount;
        console.log('关灯数据0', Buffer.from(page0.result).toString('base64'));
        await device.writeCharacteristicWithResponseForService(SERVICE_UUID, WEITE_CHARACTERISTIC_UUID, Buffer.from(page0.result).toString('base64'));
        // 第 1 页数据
        const page1 = packingData(count, pointHashMap);
        count = page1.currentCount;
        console.log('关灯数据1', Buffer.from(page1.result).toString('base64'));
        await device.writeCharacteristicWithResponseForService(SERVICE_UUID, WEITE_CHARACTERISTIC_UUID, Buffer.from(page1.result).toString('base64'));
        // 第 2 页数据
        const page2 = packingData(count, pointHashMap);
        count = page2.currentCount;
        console.log('关灯数据2', Buffer.from(page2.result).toString('base64'));
        await device.writeCharacteristicWithResponseForService(SERVICE_UUID, WEITE_CHARACTERISTIC_UUID, Buffer.from(page2.result).toString('base64'));
        // 第 3 页数据
        const page3 = packingData(count, pointHashMap);
        count = page3.currentCount;
        console.log('关灯数据3', Buffer.from(page3.result).toString('base64'));
        await device.writeCharacteristicWithResponseForService(SERVICE_UUID, WEITE_CHARACTERISTIC_UUID, Buffer.from(page3.result).toString('base64'));
        // 第 4 页数据
        const page4 = packingData(count, pointHashMap);
        count = page4.currentCount;
        console.log('关灯数据4', Buffer.from(page4.result).toString('base64'));
        await device.writeCharacteristicWithResponseForService(SERVICE_UUID, WEITE_CHARACTERISTIC_UUID, Buffer.from(page4.result).toString('base64'));
        // 第 5 页数据
        const page5 = packingData(count, pointHashMap);
        count = page5.currentCount;
        console.log('关灯数据5', Buffer.from(page5.result).toString('base64'));
        await device.writeCharacteristicWithResponseForService(SERVICE_UUID, WEITE_CHARACTERISTIC_UUID, Buffer.from(page5.result).toString('base64'));
        // 第 6 页数据
        const page6 = packingData(count, pointHashMap);
        count = page6.currentCount;
        console.log('关灯数据6', Buffer.from(page6.result).toString('base64'));
        await device.writeCharacteristicWithResponseForService(SERVICE_UUID, WEITE_CHARACTERISTIC_UUID, Buffer.from(page6.result).toString('base64'));
        // 第 7 页数据
        const page7 = packingData(count, pointHashMap);
        count = page7.currentCount;
        console.log('关灯数据7', Buffer.from(page7.result).toString('base64'));
        await device.writeCharacteristicWithResponseForService(SERVICE_UUID, WEITE_CHARACTERISTIC_UUID, Buffer.from(page7.result).toString('base64'));
        // 已满足 468 个岩灯
        if (!isInit) {
            return;
        }
        // 刷新显示
        // console.log('刷新显示', Buffer.from(BT_LED_REFURBISH).toString('base64'));
        // await device.writeCharacteristicWithResponseForService(SERVICE_UUID, WEITE_CHARACTERISTIC_UUID, Buffer.from(BT_LED_REFURBISH).toString('base64'));
    } catch (error) {
        console.error('数据发送时异常', error);
    }
}

// 向设备发送灯控制的指令
export const sentCtrlData = async (device, selectedPoint, isInit, breakConnect) => {
    try {
        if (!selectedPoint || selectedPoint === {}) {
            return
        }
        // 初始化时才需要做
        if (isInit) {
            // 向设备发送定义灯色的数据
            const array = BT_COLOR_SENT;
            const openValueBase64 = Buffer.from(array).toString('base64');;
            console.log('发送的灯色定义数据', openValueBase64);
            await device.writeCharacteristicWithResponseForService(SERVICE_UUID, WEITE_CHARACTERISTIC_UUID, openValueBase64)
            // 先全部关灯
            // await closeAllLed(device, isInit);
        }
        const pointHashMap = {};
        Object.keys(selectedPoint).forEach(name => {
            pointHashMap[(name - 1).toString()] = selectedPoint[name].stateID;
        });
        console.log('需要被点亮的数据', pointHashMap);
        // 当前轮到的岩灯ID
        let count = 0
        // 第 0 页数据
        const page0 = packingData(count, pointHashMap);
        count = page0.currentCount;
        console.log('发送的灯控制数据0', Buffer.from(page0.result).toString('base64'));
        await device.writeCharacteristicWithResponseForService(SERVICE_UUID, WEITE_CHARACTERISTIC_UUID, Buffer.from(page0.result).toString('base64'));
        // 第 1 页数据
        const page1 = packingData(count, pointHashMap);
        count = page1.currentCount;
        console.log('发送的灯控制数据1', Buffer.from(page1.result).toString('base64'));
        await device.writeCharacteristicWithResponseForService(SERVICE_UUID, WEITE_CHARACTERISTIC_UUID, Buffer.from(page1.result).toString('base64'));
        // 第 2 页数据
        const page2 = packingData(count, pointHashMap);
        count = page2.currentCount;
        console.log('发送的灯控制数据2', Buffer.from(page2.result).toString('base64'));
        await device.writeCharacteristicWithResponseForService(SERVICE_UUID, WEITE_CHARACTERISTIC_UUID, Buffer.from(page2.result).toString('base64'));
        // 第 3 页数据
        const page3 = packingData(count, pointHashMap);
        count = page3.currentCount;
        console.log('发送的灯控制数据3', Buffer.from(page3.result).toString('base64'));
        await device.writeCharacteristicWithResponseForService(SERVICE_UUID, WEITE_CHARACTERISTIC_UUID, Buffer.from(page3.result).toString('base64'));
        // 第 4 页数据
        const page4 = packingData(count, pointHashMap);
        count = page4.currentCount;
        console.log('发送的灯控制数据4', Buffer.from(page4.result).toString('base64'));
        await device.writeCharacteristicWithResponseForService(SERVICE_UUID, WEITE_CHARACTERISTIC_UUID, Buffer.from(page4.result).toString('base64'));
        // 第 5 页数据
        const page5 = packingData(count, pointHashMap);
        count = page5.currentCount;
        console.log('发送的灯控制数据5', Buffer.from(page5.result).toString('base64'));
        await device.writeCharacteristicWithResponseForService(SERVICE_UUID, WEITE_CHARACTERISTIC_UUID, Buffer.from(page5.result).toString('base64'));
        // 第 6 页数据
        const page6 = packingData(count, pointHashMap);
        count = page6.currentCount;
        console.log('发送的灯控制数据6', Buffer.from(page6.result).toString('base64'));
        await device.writeCharacteristicWithResponseForService(SERVICE_UUID, WEITE_CHARACTERISTIC_UUID, Buffer.from(page6.result).toString('base64'));
        // 第 7 页数据
        const page7 = packingData(count, pointHashMap);
        count = page7.currentCount;
        console.log('发送的灯控制数据7', Buffer.from(page7.result).toString('base64'));
        await device.writeCharacteristicWithResponseForService(SERVICE_UUID, WEITE_CHARACTERISTIC_UUID, Buffer.from(page7.result).toString('base64'));
        // 已满足 468 个岩点
        // 刷新显示
        console.log('刷新显示', Buffer.from(BT_LED_REFURBISH).toString('base64'));
        await device.writeCharacteristicWithResponseForService(SERVICE_UUID, WEITE_CHARACTERISTIC_UUID, Buffer.from(BT_LED_REFURBISH).toString('base64'));
    } catch (error) {
        console.error('数据发送时异常', error);
        breakConnect(device);
    }
}

// 延时函数
const sleep = (time) => {
    return new Promise(resolve => setTimeout(resolve, time))
}