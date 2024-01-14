import React, { useEffect, useState } from 'react';
import { useWindowDimensions, FlatList, View, Text } from 'react-native';
import { Overlay } from 'react-native-elements';
import { CustomOptionList, CustomOptionSeparator } from "../../components/custom-option-list/custom-option-list";
import { getBLE_Manager, getBT_Device } from "../../redux/selectors";
import { permissionRequest, ACCESS_FINE_LOCATION, BLT_Permission } from "../../common/android-permission";
import { connect } from "react-redux";
import { sentCtrlData } from "../../config/led";
import { set_BT_Device } from "../../redux/actions";
import { Button } from 'react-native-elements';

// prop:
// isVisible：控制弹出框显示
// pointJson：需要显示的岩点数据
// close： 调用后会关闭弹出框

const OverlayBT_SelectWarpper = ({ isVisible, pointJson, close, BLEmanager, set_BT_Device, BTDevice }) => {
    // 是否具有android12的蓝牙权限
    const [hasPermission, setHasPermission] = useState(false);

    useEffect(() => {
        if (isVisible === true) {
            permissionRequest(BLT_Permission)
                // 蓝牙扫描和记录
                .then((hasPermission) => {
                    if (!!hasPermission) {
                        setHasPermission(true);
                    } else {
                        setHasPermission(false);
                        close();
                    }
                })
                // 异常处理
                .catch((err) => console.error('android12的蓝牙权限异常', err))
        } else {
            setHasPermission(true);
        }
    }, [isVisible]);

    return (
        <>
            {hasPermission === true &&
                <OverlayBT_Select isVisible={isVisible} pointJson={pointJson} close={close} set_BT_Device={set_BT_Device} BLEmanager={BLEmanager} BTDevice={BTDevice}></OverlayBT_Select>
            }
        </>
    );
}

const OverlayBT_Select = ({ isVisible, pointJson, close, BLEmanager, set_BT_Device, BTDevice }) => {
    // 屏幕尺寸
    let screenWidth = useWindowDimensions().width;
    let screenHeight = useWindowDimensions().height;

    // BLEmanager的状态订阅对象
    const [BLEmanagerStateSubscription, setBLEmanagerStateSubscription] = useState(null);
    // BLEmanager的状态
    const [BLEmanagerState, setBLEmanagerState] = useState('');
    // 搜寻到的蓝牙设备list
    const [BT_DeviceList, setBT_DeviceList] = useState(BTDevice ? [BTDevice] : []);
    // 当前是否在搜寻状态
    const [isScanning, setIsScanning] = useState(false);
    // 当前连接的蓝牙设备（视图显示 & 记录默认连接设备）
    const [connectedBT_Device, setconnectedBT_Device] = useState(BTDevice);

    // 当 Overlay 被显示的时候，且当前无蓝牙设备连接，触发蓝牙的搜索操作
    useEffect(() => {
        if (isVisible === true && !connectedBT_Device) {
            BT_Scan();
        }
    }, [isVisible]);

    // 当需要亮灯的岩石点数据改变时，触发传输
    useEffect(() => {
        // 连接蓝牙，同步数据
        if (connectedBT_Device && pointJson) {
            console.log('触发自动同步');
            BT_Connect(connectedBT_Device);
        }
    }, [pointJson]);

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
        return;
        // // 监听蓝牙设备传来的数据
        // let subscription;
        // !!connectedBT_Device && console.log('调用了monitor注册');
        // connectedBT_Device && connectedBT_Device.discoverAllServicesAndCharacteristics()
        //     // 发现 characteristics
        //     .then((device) => {
        //         subscription = device.monitorCharacteristicForService(SERVICE_UUID, READ_CHARACTERISTIC_UUID, (error, characteristic) => {
        //             if (error && error.toString() !== 'BleError: Operation was cancelled') {
        //                 console.error('monitor回调函数报错', error);
        //             } else {
        //                 // 监听数据接收
        //                 console.log(`接收到${device.name}的数据`, characteristic && characteristic.value);
        //             }
        //             // 收到过一次消息就取消订阅
        //             // unSubscription(subscription);
        //             // 重置 connectedBT_Device
        //             // console.log('重置 connectedBT_Device');
        //             // connectedBT_Device && setconnectedBT_Device(null);
        //         });
        //     })
        //     // 异常捕获
        //     .catch((error) => {
        //         console.error('数据接收异常', error);
        //     })
        // // 销毁组件时，清理工作
        // return () => {
        //     // 取消 monitor characteristic 的订阅
        //     unSubscription(subscription);
        //     connectedBT_Device && connectedBT_Device.cancelConnection();
        //     !!connectedBT_Device && console.log('断开当前连接设备');
        // }
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
        if (isScanning) {
            return;
        }
        setBT_DeviceList([]);
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
        // 判断需要通讯的设备是否已连接状态
        BT_device.isConnected()
            .then((isConnected) => {
                if (!isConnected) {
                    // 未连接
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
                        // 保存设备对象
                        .then((device) => {
                            console.log('连接成功');
                            // 保存当前蓝牙设备对象
                            setconnectedBT_Device(BT_device);
                            // 保存当前蓝牙设备对象到 redux
                            set_BT_Device(BT_device)
                            return device;
                        })
                        // 注册 notify characteristic
                        .then((device) => {
                            console.log('通讯桥梁成功');
                            return device.discoverAllServicesAndCharacteristics();
                        })
                        // 向设备发送灯控制的数据
                        .then((device) => {
                            sentCtrlData(device, pointJson, true, breakConnect);
                        })
                        // 异常捕获
                        .catch((error) => {
                            console.error('连接失败', error);
                            breakConnect(BT_device);
                        });
                } else {
                    // 已连接
                    BT_device.discoverAllServicesAndCharacteristics()
                        // 向设备发送灯控制的数据
                        .then((device) => {
                            sentCtrlData(device, pointJson, false, breakConnect);
                        })
                        // 异常捕获
                        .catch((error) => {
                            console.error('通信失败', error);
                            breakConnect(BT_device);
                        });
                }
            })
            // 异常捕获
            .catch((error) => {
                console.error('判断连接状态失败', error);
            });
    }

    // 蓝牙通信错误时断开当前设备连接
    const breakConnect = (device) => {
        if (device) {
            device.cancelConnection()
                .then(() => {
                    console.log('蓝牙通信错误导致的连接断开');
                })
                .catch((error) => {
                    console.error('连接断开失败', error);
                })
                .finally(() => {
                    // 清理当前蓝牙设备对象
                    setconnectedBT_Device(null);
                    // 清理当前蓝牙设备对象到 redux
                    console.log('清除到redux', null);
                    set_BT_Device(null)
                })
        }
    }

    // 蓝牙设备列表视图
    const ListRenderItem = ({ item }) => {
        // 当前选择的图标
        const selectedIcon = require('../../static/img/common-icons/select-blue.png');
        // 列表项点击处理
        const handleListPress = (item) => {
            BT_Connect(item);
        }

        return <CustomOptionList
            listItem={{
                id: item.id,
                name: item.name,
                icon: (connectedBT_Device && connectedBT_Device.id === item.id) ? selectedIcon : null
            }}
            hideArrow={true}
            onPress={() => handleListPress(item)}
        />;
    };

    return (
        <Overlay
            isVisible={isVisible}
            overlayStyle={[{ width: 0.8 * screenWidth, height: 0.7 * screenHeight }]}
            onBackdropPress={close}
        >
            <>
                <View style={{ flex: 1 }}>
                    <FlatList
                        data={BT_DeviceList}
                        renderItem={ListRenderItem}
                        keyExtractor={item => item.id}
                        ItemSeparatorComponent={CustomOptionSeparator}
                    />
                    {BT_DeviceList.length !== 0 ||
                        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                            <Text>未搜寻到设备</Text>
                        </View>
                    }
                </View>
                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <Button
                        containerStyle={{ width: '90%', margin: 10 }}
                        buttonStyle={{ backgroundColor: '#3366ff' }}
                        title="重新搜寻设备"
                        onPress={() => { breakConnect(connectedBT_Device); setBT_DeviceList([]); BT_Scan() }}
                        loading={isScanning}
                    />
                </View>
            </>
        </Overlay>
    );
};

const mapStateToProps = state => {
    return {
        BLEmanager: getBLE_Manager(state),
        BTDevice: getBT_Device(state)
    };
};

export default connect(
    mapStateToProps,
    { set_BT_Device }
)(OverlayBT_SelectWarpper);