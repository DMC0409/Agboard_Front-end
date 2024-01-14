// 厂商提供的SERVICE_UUID
export const SERVICE_UUID = '0000FFE0-0000-1000-8000-00805F9B34FB'
// 厂商提供的WEITE_CHARACTERISTIC_UUID
export const WEITE_CHARACTERISTIC_UUID = '0000FFE1-0000-1000-8000-00805F9B34FB'
// 厂商提供的READ_CHARACTERISTIC_UUID
export const READ_CHARACTERISTIC_UUID = '0000FFE1-0000-1000-8000-00805F9B34FB'

// 取消 monitor characteristic 的订阅
export const unSubscription = (subscription) => {
    !!subscription && console.log('终止 monitor 订阅数据接收');
    subscription && subscription.remove();
}
