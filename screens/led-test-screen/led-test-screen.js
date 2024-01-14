// 用户个人设置视图
import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, FlatList } from 'react-native';
import { styles } from "./led-test-screen.styles";
import { getBLE_Manager } from "../../redux/selectors";
import { unSubscription } from "../../common/BLE";
import { permissionRequest, ACCESS_FINE_LOCATION, BLT_Permission } from "../../common/android-permission";
import { connect } from "react-redux";
import { Button } from 'react-native-elements';
import { SERVICE_UUID, WEITE_CHARACTERISTIC_UUID, READ_CHARACTERISTIC_UUID } from "../../common/BLE";
import { Buffer } from "buffer"

// 视图主组件
const LED_TestScreen = ({ navigation, BLEmanager }) => {
    // BLEmanager的状态订阅对象
    const [BLEmanagerStateSubscription, setBLEmanagerStateSubscription] = useState(null);
    // BLEmanager的状态
    const [BLEmanagerState, setBLEmanagerState] = useState('');
    // 搜寻到的蓝牙设备list
    const [BT_DeviceList, setBT_DeviceList] = useState([]);
    // 当前是否在搜寻状态
    const [isScanning, setIsScanning] = useState(false);
    // 当前连接的蓝牙设备
    const [connectedBT_Device, setconnectedBT_Device] = useState();

    useEffect(() => {
        permissionRequest(BLT_Permission)
            // 蓝牙扫描和记录
            .then((hasPermission) => {
                if (!!hasPermission) {

                } else {

                }
            })
            // 异常处理
            .catch((err) => console.error('android12的蓝牙权限异常', err))
    }, []);

    // 仅初次挂载时调用，当蓝牙API准备好时 scanAndConnect (ios需要)
    useEffect(() => {
        // 观察BLEmanager的状态
        const subscription = BLEmanager.onStateChange((state) => {
            setBLEmanagerState(state);
        }, true);
        setBLEmanagerStateSubscription(subscription);
        // 销毁组件时，清理工作
        return () => {
            subscription.remove();
            BLEmanager.stopDeviceScan();
            console.log('关闭搜寻');
        }
    }, []);

    // 蓝牙搜寻状态为true时调用，用于定时关闭蓝牙搜寻
    useEffect(() => {
        let scanTimeout;
        if (isScanning === true) {
            console.log('触发定时');
            // 计时结束搜寻 (15s)
            scanTimeout = setTimeout(() => {
                // 关闭搜寻状态的标识
                isScanning && console.log('关闭搜寻');
                setIsScanning(false);
                BLEmanager.stopDeviceScan();
            }, 15000);
        }
        // 销毁组件时，清理工作
        return () => {
            scanTimeout && clearTimeout(scanTimeout);
        }
    }, [isScanning]);

    // 当成功连接到设备时，监听蓝牙设备传来的数据
    useEffect(() => {
        let subscription;
        !!connectedBT_Device && console.log('调用了monitor注册');
        connectedBT_Device && connectedBT_Device.discoverAllServicesAndCharacteristics()
            // 发现 characteristics
            .then((device) => {
                subscription = device.monitorCharacteristicForService(SERVICE_UUID, READ_CHARACTERISTIC_UUID, (error, characteristic) => {
                    if (error && error.toString() !== 'BleError: Operation was cancelled') {
                        console.error('monitor回调函数报错', error);
                    } else {
                        // 监听数据接收
                        console.log('接收到的数据', characteristic && characteristic.value);
                    }
                    // 收到过一次消息就取消订阅
                    unSubscription(subscription);
                    // 重置 connectedBT_Device
                    console.log('重置 connectedBT_Device');
                    connectedBT_Device && setconnectedBT_Device(null);
                });
            })
            // 异常捕获
            .catch((error) => {
                console.error('数据接收异常', error);
            })
        // 销毁组件时，清理工作
        return () => {
            // 取消 monitor characteristic 的订阅
            unSubscription(subscription);
            connectedBT_Device && connectedBT_Device.cancelConnection();
            !!connectedBT_Device && console.log('断开当前连接设备');
        }
    }, [connectedBT_Device]);

    // 蓝牙扫描和记录的执行
    const BTscanAndRecoed = (hasPermission) => {
        // 用户拒绝权限时return
        if (!hasPermission) {
            console.log('无蓝牙相关权限');
            return;
        }
        console.log('开始扫描');
        // 开启搜寻状态
        setIsScanning(true);
        BLEmanager.startDeviceScan(null, null, (error, device) => {
            // 错误处理
            if (error) {
                console.error('蓝牙错误', error);
                return
            }
            // 记录搜索到的设备
            if (device.name) {
                console.log('蓝牙设备', device.name);
                setBT_DeviceList((prevState) => {
                    let isRecorded = false;
                    // 去重
                    for (let i = 0; i < prevState.length; i++) {
                        if (prevState[i].id === device.id) {
                            isRecorded = true;
                        }
                    }
                    return isRecorded ? prevState : [...prevState, ...[device]];
                });
            }
        });
    }

    // 如果蓝牙功能未开启，尝试开启蓝牙功能
    const tryEnableBT = () => {
        if (BLEmanagerState !== 'PoweredOn') {
            return BLEmanager.enable()
                .then((BLEmanager) => {
                    return BLEmanager;
                }, (err) => {
                    console.error('用户拒绝开启蓝牙', err);
                    return false;
                })
        } else {
            return new Promise((resolve, reject) => resolve(BLEmanager));
        }
    }

    // 搜寻蓝牙设备并记录
    const BT_Scan = () => {
        // 尝试开启蓝牙功能
        tryEnableBT()
            .then((BLEmanager) => {
                if (!BLEmanager) {
                    return;
                }
                // 蓝牙搜寻的前置检查工作
                // 检查和请求相关权限
                permissionRequest(ACCESS_FINE_LOCATION)
                    // 蓝牙扫描和记录
                    .then(BTscanAndRecoed)
                    // 异常处理
                    .catch((err) => console.error('蓝牙异常', err))
                // 清除订阅
                BLEmanagerStateSubscription.remove();
            })
    }

    // 连接指定蓝牙设备并通信
    const BT_Connect = (BT_device) => {
        let currentDevice = connectedBT_Device;
        if (!currentDevice) {
            // 伪造虚假promise
            currentDevice = {
                cancelConnection: () => new Promise((resolve, reject) => resolve({}))
            }
            console.log('伪造虚假promise', currentDevice);
        }
        // 先断开连接之前的设备
        currentDevice.cancelConnection()
            .then(() => {
                console.log('连接关闭');
                return BT_device;
            }, (error) => {
                console.error('当前未连接设备，关闭无效', error);
                return BT_device;
            })
            // 连接设备
            .then((device) => {
                console.log('开始连接');
                return device.connect()
            })
            // 保存设备对象，注册 notify characteristic 监听
            .then((device) => {
                console.log('连接成功');
                // 保存当前蓝牙设备对象
                setconnectedBT_Device(BT_device);
                return device.discoverAllServicesAndCharacteristics();
            })
            // 向设备发送数据
            .then((characteristic) => {
                const array = [0xAA, 0x08, 0x84, 0x00, 0x00, 0x00, 0x00, 0x00];
                const openValueBase64 = Buffer.from(array).toString('base64');;
                console.log('发送的数据', openValueBase64);
                return characteristic.writeCharacteristicWithResponseForService(SERVICE_UUID, WEITE_CHARACTERISTIC_UUID, openValueBase64)
            })
            // 此 write Characteristic 的后续操作 
            .then((characteristic) => { })
            // 异常捕获
            .catch((error) => {
                console.error('连接失败', error);
            });
    }

    // 返回react组件
    return (
        <View style={{ flex: 1 }}>
            <View style={{ flex: 1 }}>
                {BT_DeviceList.map((item) => {
                    return (
                        <View key={item.id}>
                            <Button
                                titleStyle={{ fontSize: 13 }}
                                containerStyle={{ marginHorizontal: 15, marginTop: 15, }}
                                buttonStyle={{ backgroundColor: '#13227a' }}
                                title={`测试 ${item.name} ---- ${item.id}`}
                                onPress={() => BT_Connect(item)}
                                loading={false}
                            />
                        </View>
                    )
                })}
            </View>
            <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                <Button
                    containerStyle={{ width: '90%', margin: 10 }}
                    title="搜寻蓝牙设备"
                    onPress={() => BT_Scan()}
                    loading={isScanning}
                />
            </View>
        </View>
    );
}

// 把redux状态映射至组件的props的属性中，本质也是一个selector函数，可以组合其他selector使用
const mapStateToProps = state => {
    return { BLEmanager: getBLE_Manager(state) };
};

export default connect(
    mapStateToProps
)(LED_TestScreen);