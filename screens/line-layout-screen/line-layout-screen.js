import React, { useState, useEffect, useCallback, useRef } from "react";
import { View, Text, TouchableOpacity, Image, Pressable, PanResponder, ScrollView } from 'react-native';
import { Button, Overlay, CheckBox } from 'react-native-elements';
import { useWindowDimensions } from 'react-native';
import { connect } from "react-redux";
import { getUserInfo, getBT_Device, getBoardSettingType } from "../../redux/selectors";
import { START, END, FOOT, HAND, UN_SELECTED, BOARD_MAX_ZOOM, BOARD_COORDINATE, SELECT_CIRCLE_BORDER_WIDTH, convertPointToM, convertPoint, returnPointColor, BOARD_TYPE_NAME, LAYOUT_H, POINT_W, POINT_H, IMG_MAP, BOARD_POINT_MAP, SELECT_CIRCLE_SIZE, BOARD_TOP_MAP, POINT_LAYER_LEFT_SETOFF } from "../../config/board";
import { styles } from "./line-layout-screen.styles";
import { http, GET, POST } from "../../common/http";
import OverlayBT_Select from "../../components/overlay-BT-select/overlay-BT-select";
import OverlayVideo from "../../components/overlay-video/overlay-video";
import { SOURCE_SCREEN_NAME } from "../complete-record-screen/complete-record-screen";
import { toastMessage } from "../../common/global";
import { Rating } from 'react-native-ratings';
import ReactNativeZoomableView from '@dudigital/react-native-zoomable-view/src/ReactNativeZoomableView';
import { boardImgHight, boardImgWidth, FRAME_TIME_MAP } from "../../config/line"
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import IdleTimerManager from 'react-native-idle-timer';
import { FRAME_DE_TIME } from '../../config/line'

// 视图主组件
const LineLayoutScreen = ({ route, navigation, userID, lineDeletePermission, BTDevice, boardType }) => {
    // 屏幕宽度
    const screenWidth = useWindowDimensions().width;
    // 屏幕高度
    const screenHeight = useWindowDimensions().height;
    // 布局宽度
    const layoutWidth = screenWidth * 1;
    // 布局高度
    const layoutHeight = LAYOUT_H[boardType.id] * screenWidth;
    // 岩点圈宽度
    const pointWidth = POINT_W[boardType.id] * layoutWidth;
    // 岩点圈高度
    const pointHeight = POINT_H[boardType.id] * layoutHeight;
    // 默认初始每帧的占据时长
    const defaultFrameTime = FRAME_DE_TIME;
    // 速度调节的步长
    const speedChangeStep = 1;
    // 当前线路在列表中的index，用于左滑右滑
    const [currentIndex, setCurrentIndex] = useState(null);

    // 当前岩点选择的数据
    const [pointJson, setPointJson] = useState(null);
    // 线路信息
    const [lineInfo, setLineInfo] = useState({});
    // 是否显示蓝牙设备选择框
    const [showDeviceOverlay, setShowDeviceOverlay] = useState(false);
    // 是否显示攻略框
    const [showVideoOverlay, setShowVideoOverlay] = useState(false);
    // 岩板的最小缩放值
    const [boardMinZoom, setBoardMinZoom] = useState(1);
    // 删除确认框显示
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    // 当前的线路ID
    const [currentLineID, setCurrentLineID] = useState(null);
    // 是否显示举报窗口
    const [showFeedbackOverlay, setShowFeedbackOverlay] = useState(false);
    // 是否显示已举报窗口
    const [showIsFeedbackedOverlay, setShowIsFeedbackedOverlay] = useState(false);
    // 当前举报项勾选状态
    const [feedbackOptions, setFeedbackOptions] = useState([false, false, false, false]);
    // 当前已被举报过
    const [isFeedbacked, setIsFeedbacked] = useState(false);
    // 是否开启自动环线
    const [hasLineAotuChange, setHasLineAotuChange] = useState(false);
    // 自动换线间隔时长
    const [lineAotuChangeTime, setLineAotuChangeTime] = useState(0);
    // 需要中断自动换线
    const [needBreakChange, setNeedBreakChange] = useState(false);
    // 难度线路数据数组
    const [levelLineArrar, setLevelLineArrar] = useState([]);
    // 总时长
    const [totalTime, setTotalTime] = useState(0);
    // 每帧的时长
    const [frameTime, setFrameTime] = useState(defaultFrameTime);
    // 当前进行的时间点
    const [curTime, setCurTime] = useState(0);
    // 当前播放状态-暂停false 播放true
    const [curPlayState, setCurPlayState] = useState(false);
    // 操作框是否不透明化状态
    const [isNotOpacity, setIsNotOpacity] = useState(false);

    // 组件初始化
    useEffect(() => {
        http(`user/timer/get/${userID}`, GET)
            .then((res) => {
                // errorCode
                if (res.errCode) {
                    console.error('response error code: ', res.errCode);
                    toastMessage(`请求失败`);
                    return;
                }
                // response处理
                if (res.data) {
                    setHasLineAotuChange(res.data.isOpen === 1 ? true : false);
                    setLineAotuChangeTime(res.data.sec);
                }
            })
            .catch((error) => {
                console.error(error);
                toastMessage(`请求失败`);
            })
    }, []);

    // 保持屏幕常亮
    useEffect(() => {
        IdleTimerManager.setIdleTimerDisabled(true);
        return () => {
            IdleTimerManager.setIdleTimerDisabled(false);
        }
    }, []);

    const intervalRef = useRef();
    const intervalRef2 = useRef();
    const intervalRef3 = useRef();

    // 当页面聚焦时，重新获取数据
    useEffect(() => {
        // 当页面参数都填充好时绑定 focus 监听函数
        const unsubscribe = navigation.addListener('focus', () => {
            console.log('当前激活');
            setNeedBreakChange(false)
        });
        const unsubscribe2 = navigation.addListener('blur', () => {
            console.log('当前失焦');
            setNeedBreakChange(true)
            clearInterval(intervalRef.current);
        });
        return () => {
            unsubscribe();
            unsubscribe2();
        };
    }, [navigation]);

    // 控制是否中断自动换线
    useEffect(() => {
        if (
            showFeedbackOverlay === true ||
            showIsFeedbackedOverlay === true ||
            showDeviceOverlay === true ||
            showVideoOverlay === true ||
            deleteConfirm === true
        ) {
            setNeedBreakChange(true)
            clearInterval(intervalRef.current);
        } else {
            setNeedBreakChange(false)
        }
    }, [showFeedbackOverlay, showIsFeedbackedOverlay, showDeviceOverlay, showVideoOverlay, deleteConfirm]);

    useEffect(() => {
        if (hasLineAotuChange === true && lineAotuChangeTime && needBreakChange === false && route.params.sourceScreenName === 'ScreenContent') {
            intervalRef.current = setInterval(() => {
                setCurPlayState(false);
                setCurTime(0);
                // 判断来源，以适配不同获取线路ID方式
                if (route.params.recordSouce === true) {
                    // 历史线路来源
                    getNextRecordLineInfo(true);
                } else {
                    // 普通线路来源
                    getNextLineInfo(true);
                }
            }, lineAotuChangeTime * 1000);
            return () => {
                clearInterval(intervalRef.current);
            }
        }
    }, [hasLineAotuChange, lineAotuChangeTime, currentLineID, needBreakChange]);

    // 获得参数时，获取线路详细信息
    useEffect(() => {
        if (!route.params) {
            return;
        }
        // 处理参数-线路信息
        getLineInfo(route.params.lineInfo.lineId || '', route.params.lineInfo)
        setCurrentLineID(route.params.lineInfo.lineId || null);
        // 处理参数-线路列表来源页面的route name
        // route.params.sourceScreenName
    }, [route.params]);

    // 拿到难度线路数据后的操作
    useEffect(() => {
        if (!levelLineArrar.length) {
            return;
        }
        // 把第一帧的布局显示出来
        if (boardType.id === BOARD_TYPE_NAME.L && res.data.boardId === BOARD_TYPE_NAME.M) {
            // 转换小板的位置到大板
            setPointJson(convertPoint(levelLineArrar[1]));
        } else if (boardType.id === BOARD_TYPE_NAME.M && res.data.boardId === BOARD_TYPE_NAME.L) {
            // 转换大板的位置到小板
            setPointJson(convertPointToM(levelLineArrar[1]));
        } else {
            setPointJson(levelLineArrar[1]);
        }
        // 根据总帧数计算总时间
        setTotalTime(frameTime * (levelLineArrar.length - 1));
    }, [levelLineArrar]);

    // 获取线路信息
    const getLineInfo = (lineID, baseLineInfo) => {
        http(`line/info/${lineID}/${userID}`, GET)
            .then((res) => {
                // errorCode
                if (res.errCode) {
                    console.error('response error code: ', res.errCode);
                    toastMessage(`请求失败`);
                    return;
                }
                // response处理
                if (res.data) {
                    if (res.data.type === 1) {
                        if (boardType.id === BOARD_TYPE_NAME.L && res.data.boardId === BOARD_TYPE_NAME.M) {
                            // 转换小板的位置到大板
                            setPointJson(convertPoint(JSON.parse(res.data.content)));
                        } else if (boardType.id === BOARD_TYPE_NAME.M && res.data.boardId === BOARD_TYPE_NAME.L) {
                            // 转换大板的位置到小板
                            setPointJson(convertPointToM(JSON.parse(res.data.content)));
                        } else {
                            setPointJson(JSON.parse(res.data.content));
                        }
                    } else if (res.data.type === 2) {
                        setLevelLineArrar(JSON.parse(res.data.content));
                        setFrameTime(res.data.defaultTime);
                    }
                    setLineInfo({ ...baseLineInfo, ...res.data });
                }
            })
            .catch((error) => {
                console.error(error);
                toastMessage(`请求失败`);
            })
    }

    // 处理所有的事件终结
    const onPanResponderRelease = (evt, gestureState, zoomableViewEventObject, baseComponentResult) => {
        // 排除缩放手势的响应
        if (zoomableViewEventObject.zoomLevel !== 1 || zoomableViewEventObject.lastZoomLevel !== 1 || zoomableViewEventObject.lastMovePinch === true) {
            return
        }
        /* 这里仅当用户滑动的距离较长才响应用户操作，考虑实际用户点击是手指的一片区域 */
        if (!(gestureState.dx < -screenWidth * 0.25 || gestureState.dx > screenWidth * 0.25)) {
            return
        }
        setFeedbackOptions([false, false, false, false]);
        let isNext;
        if (gestureState.dx < 0) {
            /* 左滑加载下一个线路 */
            console.log('左滑')
            isNext = true;
        }
        else {
            /* 右滑加载上一个线路 */
            console.log('右滑')
            isNext = false;
        }
        clearInterval(intervalRef.current);
        // 判断来源，以适配不同获取线路ID方式
        if (route.params.recordSouce === true) {
            // 历史线路来源
            getNextRecordLineInfo(isNext);
        } else {
            // 普通线路来源
            getNextLineInfo(isNext);
        }
    }

    // 处理左右滑动切换线路
    // const panResponder = useRef(
    //     PanResponder.create({
    //         onMoveShouldSetPanResponder: (evt, gestureState) => {
    //             /* 这里仅当用户滑动的距离较长才响应用户操作，考虑实际用户点击是手指的一片区域 */
    //             if (gestureState.dx < -screenWidth * 0.25 || gestureState.dx > screenWidth * 0.25) {
    //                 return true;
    //             }
    //             else {
    //                 return false;
    //             }
    //         },
    //         onPanResponderRelease: (evt, gestureState) => {
    //             let isNext;
    //             if (gestureState.dx < 0) {
    //                 /* 左滑加载下一个线路 */
    //                 console.log('左滑')
    //                 isNext = true;
    //             }
    //             else {
    //                 /* 右滑加载上一个线路 */
    //                 console.log('右滑')
    //                 isNext = false;
    //             }
    //             // 判断来源，以适配不同获取线路ID方式
    //             if (route.params.recordSouce === true) {
    //                 // 历史线路来源
    //                 getNextRecordLineInfo(isNext);
    //             } else {
    //                 // 普通线路来源
    //                 getNextLineInfo(isNext);
    //             }
    //         },
    //     })
    // ).current;

    // 获取上一个或下一个的线路信息
    const getNextLineInfo = (isNext) => {
        if ((route.params.index !== undefined || currentIndex !== null) && route.params.listParam) {
            const currentListParam = route.params.listParam;
            let targetIndex
            if (isNext) {
                // 获取下一个
                targetIndex = (currentIndex === null ? route.params.index : currentIndex) + 1
            } else {
                // 获取上一个
                targetIndex = (currentIndex === null ? route.params.index : currentIndex) - 1
            }
            if (targetIndex < 0) {
                // 到顶
                return;
            }
            http(`line/lines`, POST, {
                body: { ...currentListParam, pageSize: 1, index: targetIndex }
            })
                .then((res) => {
                    // errorCode
                    if (res.errCode) {
                        console.error('response error code: ', res.errCode);
                        toastMessage(`请求失败`);
                        return;
                    }
                    // response处理
                    if (res.data) {
                        console.log('左滑右滑获取的ID', res.data[0].lineId);
                        setCurrentIndex(targetIndex);
                        setCurrentLineID(res.data[0].lineId || null);
                        getLineInfo(res.data[0].lineId, res.data[0]);
                        setCurPlayState(false);
                        setCurTime(0);
                    } else {
                        // 到尾
                    }
                })
                .catch((error) => {
                    console.error(error);
                    toastMessage(`请求失败`);
                })
        }
    }

    // 获取上一个或下一个的历史线路信息
    const getNextRecordLineInfo = (isNext) => {
        if ((route.params.index !== undefined || currentIndex !== null) && route.params.listParam) {
            const currentListParam = route.params.listParam;
            let targetIndex
            if (isNext) {
                // 获取下一个
                targetIndex = (currentIndex === null ? route.params.index : currentIndex) + 1
            } else {
                // 获取上一个
                targetIndex = (currentIndex === null ? route.params.index : currentIndex) - 1
            }
            if (targetIndex < 0) {
                // 到顶
                return;
            }
            http(`line/completes`, POST, {
                body: { ...currentListParam, pageSize: 1, index: targetIndex }
            })
                .then((res) => {
                    // errorCode
                    if (res.errCode) {
                        console.error('response error code: ', res.errCode);
                        toastMessage(`请求失败`);
                        return;
                    }
                    // response处理
                    if (res.data) {
                        console.log('左滑右滑获取的ID', res.data[0].lineId);
                        setCurrentIndex(targetIndex);
                        setCurrentLineID(res.data[0].lineId || null);
                        getLineInfo(res.data[0].lineId, res.data[0]);
                        setCurPlayState(false);
                        setCurTime(0);
                    } else {
                        // 到尾
                    }
                })
                .catch((error) => {
                    console.error(error);
                    toastMessage(`请求失败`);
                })
        }
    }

    // 收藏&取消收藏
    const handlerCollection = (currentID) => {
        if (currentID) {
            // 有收藏ID说明已收藏，做取消收藏操作
            http(`collection/delete/${userID}/${lineInfo.lineId || ''}`, GET)
                .then((res) => {
                    // errorCode
                    if (res.errCode) {
                        console.error('response error code: ', res.errCode);
                        toastMessage(`请求失败`);
                        return;
                    }
                    // response处理
                    if (res.data) {
                        // 取消成功
                        setLineInfo({ ...lineInfo, collect: '' });
                    } else {
                        // 取消失败
                    }
                })
                .catch((error) => {
                    console.error(error);
                    toastMessage(`请求失败`);
                })
        } else {
            // 无收藏ID说明未收藏，做收藏操作
            http(`collection/insert`, POST, {
                body: {
                    lineId: lineInfo.lineId || '',
                    userId: userID,
                }
            })
                .then((res) => {
                    // errorCode
                    if (res.errCode) {
                        console.error('response error code: ', res.errCode);
                        toastMessage(`请求失败`);
                        return;
                    }
                    // response处理
                    if (res.data) {
                        // 收藏成功
                        setLineInfo({ ...lineInfo, collect: '1' });
                    } else {
                        // 收藏失败
                    }
                })
                .catch((error) => {
                    console.error(error);
                    toastMessage(`请求失败`);
                })
        }
    }

    // 完成线路点击处理
    const handlerCompletePress = () => {
        navigation.navigate('LineCompleteScreen', { lineInfo: lineInfo, sourceScreenName: route.params.sourceScreenName })
    }

    // 删除线路点击处理
    const handlerDeleteLine = () => {
        setDeleteConfirm(true);
    }

    // 删除线路
    const deleteLine = () => {
        http(`line/delete/${currentLineID || ''}`, 'DELETE')
            .then((res) => {
                // errorCode
                if (res.errCode) {
                    console.error('response error code: ', res.errCode);
                    toastMessage(`请求失败`);
                    return;
                }
                // response处理
                toastMessage(`删除成功`);
                // 判断来源，以适配不同获取线路ID方式
                if (route.params.recordSouce === true) {
                    // 历史线路来源
                    getNextRecordLineInfo(true);
                } else {
                    // 普通线路来源
                    getNextLineInfo(true);
                }
            })
            .catch((error) => {
                console.error(error);
                toastMessage(`请求失败`);
            })
    }

    // 蓝牙同步点击处理
    const handlerBT_Press = () => {
        setShowDeviceOverlay(true);
    }

    // 当视频上传成功触发
    const onVideoUpSuccess = () => {
        setLineInfo({ ...lineInfo, video: '1' });
    }

    // 获取岩板展示容器区域的长宽
    const getBoardViewLayout = (info) => {
        const viewWidth = info.nativeEvent.layout.width;
        const viewHight = info.nativeEvent.layout.height;
        const viewLayout = viewHight / viewWidth;
        const boardImgLayout = boardImgHight / boardImgWidth;
        if (viewLayout < boardImgLayout) {
            // 会盖住岩板图片
            console.log('屏幕比例太小，缩放到0.85');
            setBoardMinZoom(0.85);
        }
    }

    // 当前已选岩点布局组件
    const SelectPoint = () => {
        return (
            <>
                {
                    Object.keys(pointJson).map((name) => {
                        if (!name) {
                            return;
                        }
                        return (
                            <Pressable
                                key={name}
                                hitSlop={0.01 * screenWidth}
                                style={[{
                                    height: pointHeight,
                                    width: pointWidth,
                                    position: 'absolute',
                                    bottom: (pointJson[name].x * pointHeight) - (pointHeight / 1.5),
                                    left: (pointJson[name].y * pointWidth) - (pointWidth / 1.5),
                                }]}>
                                {/* 选中的圆形边框效果 */}
                                <View
                                    style={{
                                        height: SELECT_CIRCLE_SIZE[boardType.id] * screenWidth,
                                        width: SELECT_CIRCLE_SIZE[boardType.id] * screenWidth,
                                        borderRadius: 0.05 * screenWidth,
                                        borderColor: pointJson[name].stateID ? returnPointColor(pointJson[name].stateID) : UN_SELECTED.COLOR,
                                        borderWidth: SELECT_CIRCLE_BORDER_WIDTH[boardType.id] || 2.5,
                                        justifyContent: 'center',
                                        alignItems: 'center'
                                    }}
                                >
                                    {/* 岩点ID显示 */}
                                    {/* <Text
                                        style={[styles.tempItemText, {
                                            fontSize: 0.0212 * screenWidth,
                                            color: pointJson[name].stateID ? returnPointColor(pointJson[name].stateID) : UN_SELECTED.COLOR,
                                        }]}
                                    >
                                        {name}
                                    </Text> */}
                                </View>
                            </Pressable>
                        )
                    })
                }
            </>
        )
    }

    // 获取我是否对当前线路有提交反馈
    useEffect(() => {
        if (!currentLineID) {
            return;
        }
        http(`line/is-report/${currentLineID}/${userID}`, GET)
            .then((res) => {
                // errorCode
                if (res.errCode) {
                    console.error('response error code: ', res.errCode);
                    toastMessage(`请求失败`);
                    return;
                }
                // response处理
                if (res.data === true) {
                    setIsFeedbacked(true);
                } else {
                    setIsFeedbacked(false);
                }
            })
            .catch((error) => {
                console.error(error);
                toastMessage(`请求失败`);
            })
    }, [currentLineID]);

    // 点击举报选项
    const handleFeaadbackOptionCheck = useCallback((index) => {
        feedbackOptions[index] = !feedbackOptions[index];
        setFeedbackOptions([...feedbackOptions]);
    }, [feedbackOptions]);

    // 提交举报
    const handleFeedbackSubmit = useCallback(() => {
        const reasonStr = ['没标明起步手点', '没有标明起步脚点', '有安全隐患', '线路质量差'];
        let reason = '';
        for (let i = 0; i < feedbackOptions.length; i++) {
            if (feedbackOptions[i] === true) {
                reason += reasonStr[i] + ' ';
            }
        }
        if (reason === '') {
            toastMessage(`请选择反馈项`);
            return;
        }
        http(`line/report`, 'POST', {
            body: { reportUserID: userID, line_id: currentLineID, reason: reason, status: 1 }
        })
            .then((res) => {
                // errorCode
                if (res.errCode) {
                    console.error('response error code: ', res.errCode);
                    toastMessage(`请求失败`);
                    return;
                }
                // response处理
                toastMessage(`提交成功`);
                setShowFeedbackOverlay(false);
                setFeedbackOptions([false, false, false, false]);
                setIsFeedbacked(true);
            })
            .catch((error) => {
                console.error(error);
                toastMessage(`请求失败`);
            })
    }, [feedbackOptions]);

    // 点击了操作面板
    const clickPlayPad = () => {
        setIsNotOpacity(true);
    }

    // 当播放状态改变时
    useEffect(() => {
        if (curPlayState === true) {
            // 当开始播放
            // 走时间条
            intervalRef2.current = setInterval(() => {
                if (curTime >= totalTime) {
                    setCurTime(0);
                    setCurPlayState(false);
                    return;
                }
                setCurTime(value => value + 1);
                setPointJson(levelLineArrar[(Math.floor(curTime / frameTime)) + 1]);
            }, 1000);
        } else {
            // 当暂停播放
            // 时间条停止
            if (intervalRef2.current) {
                clearInterval(intervalRef2.current);
            }
        }
        return () => {
            if (intervalRef2.current) {
                clearInterval(intervalRef2.current);
            }
        }
    }, [curPlayState, curTime, totalTime, levelLineArrar]);

    // 上一帧、下一帧切换
    const changeCurFrime = (flag) => {
        if (flag === 1) {
            if (Math.floor(curTime / frameTime) === 0) {
                setCurTime(0);
                setPointJson(levelLineArrar[1]);
            } else {
                setCurTime(frameTime * (Math.floor(curTime / frameTime) - 1));
                setPointJson(levelLineArrar[Math.floor(curTime / frameTime)]);
            }
        } else if (flag === 2) {
            console.log(Math.floor(curTime / frameTime));
            if (Math.floor(curTime / frameTime) === levelLineArrar.length - 1) {
                setCurTime(totalTime);
                setPointJson(levelLineArrar[levelLineArrar.length - 1]);
            } else {
                setCurTime(frameTime * (Math.floor(curTime / frameTime) + 1));
                if (Math.floor(curTime / frameTime) + 2 <= levelLineArrar.length - 1) {
                    setPointJson(levelLineArrar[Math.floor(curTime / frameTime) + 2]);
                } else {
                    setPointJson(levelLineArrar[levelLineArrar.length - 1]);
                }
            }
        }
    }

    // 当播放速度改变
    const speedChange = (value) => {
        setFrameTime(-value);
    }

    const curF = levelLineArrar.indexOf(pointJson);

    // 当每一帧的时长状态改变时
    useEffect(() => {
        const totalFrame = levelLineArrar.length - 1;
        const newTotalTime = frameTime * totalFrame;
        // 当前第几帧
        if (curF !== -1 && curF !== 0) {

            setCurTime((curF - 1) * frameTime);
        }
        // 总时长跟着变化
        setTotalTime(newTotalTime);
    }, [frameTime, levelLineArrar]);

    // 返回react组件
    return (
        <View style={styles.box}>
            {/* 顶部导航栏，标题 */}
            <View style={styles.titleBox}>
                {/* 返回按钮 */}
                <TouchableOpacity style={styles.backButtonBox} onPress={navigation.goBack}>
                    <Image
                        source={require('../../static/img/common-icons/arrow-left-bold.png')}
                        style={styles.backButtonIcon}
                    ></Image>
                </TouchableOpacity>
                {/* 标题 */}
                <View>
                    <View style={styles.titleTextBox}>
                        <Text style={styles.titleText}>{lineInfo.name}</Text>
                    </View>
                    <View style={{ ...styles.titleTextBox, marginVertical: -3 }}>
                        <Text style={styles.titleLevel}>
                            {
                                lineInfo.level ?
                                    (
                                        lineInfo.level.indexOf('@') !== -1 ?
                                            (
                                                lineInfo.type === 2 ?
                                                    lineInfo.level.slice(lineInfo.level.indexOf('@') + 1)
                                                    : lineInfo.level.slice(0, `${lineInfo.level}`.indexOf('@'))
                                            )
                                            : lineInfo.level
                                    )
                                    : '未知难度'
                            }
                            {'/'}{lineInfo.angelValue}</Text>
                    </View>
                    {/* 线路信息 */}
                    <View style={styles.titleInfoBox}>
                        <View style={styles.titleInfoItem}>
                            <Rating
                                ratingCount={5}
                                startingValue={lineInfo.avgScore}
                                imageSize={11}
                                readonly={true}
                                showRating={false}
                            />
                        </View>
                        <View style={styles.titleInfoItem}>
                            <Image source={require('../../static/img/common-icons/complete.png')}
                                style={styles.titleInfoItemIcon}
                            ></Image>
                            <Text style={styles.titleInfoText}>{lineInfo.completeCount}</Text>
                        </View>
                        <View style={styles.titleInfoItem}>
                            {lineInfo.collect ?
                                // 已收藏
                                <Image source={require('../../static/img/common-icons/collect-fill.png')}
                                    style={styles.titleInfoItemIcon}
                                ></Image>
                                :
                                // 未收藏
                                <Image source={require('../../static/img/common-icons/collect.png')}
                                    style={styles.titleInfoItemIcon}
                                ></Image>
                            }
                            <Text style={styles.titleInfoText}>{lineInfo.collectCount}</Text>
                        </View>
                    </View>
                </View>
                <View style={{ flexDirection: 'row', width: 80, justifyContent: 'flex-end' }}>
                    {/* 点击显示线路举报 */}
                    <TouchableOpacity
                        style={{ paddingVertical: 1 }}
                        onPress={() => { !isFeedbacked ? setShowFeedbackOverlay(true) : setShowIsFeedbackedOverlay(true) }}
                    >
                        <Image source={require('../../static/img/common-icons/feed-back.png')}
                            style={{ height: 28, width: 28, paddingHorizontal: 2 }}
                        ></Image>
                    </TouchableOpacity>
                    {/* 点击显示线路各角度信息 */}
                    <TouchableOpacity
                        style={{ paddingLeft: 5, paddingRight: 8 }}
                        onPress={() => { navigation.navigate('LineDetailScreen', { lineInfo: lineInfo }) }}
                    >
                        <Image source={require('../../static/img/common-icons/prompt.png')}
                            style={{ height: 30, width: 30 }}
                        ></Image>
                    </TouchableOpacity>
                </View>
                {/* 线路举报已举报过窗口 */}
                <Overlay isVisible={showIsFeedbackedOverlay} onBackdropPress={() => setShowIsFeedbackedOverlay(false)}>
                    <View style={{ ...styles.feedOverlayBox, width: screenWidth * 0.8, height: 100, justifyContent: 'space-between' }}>
                        <View>
                            <Text>您已成功提交过该线路的反馈信息，感谢您的反馈</Text>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                            <Button
                                onPress={() => setShowIsFeedbackedOverlay(false)}
                                title={'返回'}
                                containerStyle={styles.nextButtonContainer}
                                buttonStyle={{ ...styles.nextButton, backgroundColor: '#3366ff' }}
                                titleStyle={styles.nextButtonText}
                            ></Button>
                        </View>
                    </View>
                </Overlay>
                {/* 线路举报窗口 */}
                <Overlay isVisible={showFeedbackOverlay} onBackdropPress={() => setShowFeedbackOverlay(false)}>
                    <View style={{ ...styles.feedOverlayBox, width: screenWidth * 0.8, justifyContent: 'space-between' }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                            <Text style={{ fontSize: 18 }}>问题线路反馈</Text>
                        </View>
                        <View>
                            <View style={[styles.sortItemBox, styles.fleterHasVideoBox]}>
                                <CheckBox
                                    containerStyle={styles.selectBox}
                                    checkedIcon={<Image style={styles.selectIcon} source={require('../../static/img/common-icons/check-box.png')} />}
                                    uncheckedIcon={<Image style={styles.selectIcon} source={require('../../static/img/common-icons/check-box-outline.png')} />}
                                    checked={feedbackOptions[0]}
                                    onPress={() => { handleFeaadbackOptionCheck(0) }}
                                />
                                <Text style={styles.sortTitle} onPress={() => { handleFeaadbackOptionCheck(0) }}>没标明起步手点</Text>
                            </View>
                            <View style={[styles.sortItemBox, styles.fleterHasVideoBox]}>
                                <CheckBox
                                    containerStyle={styles.selectBox}
                                    checkedIcon={<Image style={styles.selectIcon} source={require('../../static/img/common-icons/check-box.png')} />}
                                    uncheckedIcon={<Image style={styles.selectIcon} source={require('../../static/img/common-icons/check-box-outline.png')} />}
                                    checked={feedbackOptions[1]}
                                    onPress={() => { handleFeaadbackOptionCheck(1) }}
                                />
                                <Text style={styles.sortTitle} onPress={() => { handleFeaadbackOptionCheck(1) }}>没有标明起步脚点</Text>
                            </View>
                            <View style={[styles.sortItemBox, styles.fleterHasVideoBox]}>
                                <CheckBox
                                    containerStyle={styles.selectBox}
                                    checkedIcon={<Image style={styles.selectIcon} source={require('../../static/img/common-icons/check-box.png')} />}
                                    uncheckedIcon={<Image style={styles.selectIcon} source={require('../../static/img/common-icons/check-box-outline.png')} />}
                                    checked={feedbackOptions[2]}
                                    onPress={() => { handleFeaadbackOptionCheck(2) }}
                                />
                                <Text style={styles.sortTitle} onPress={() => { handleFeaadbackOptionCheck(2) }}>有安全隐患</Text>
                            </View>
                            <View style={[styles.sortItemBox, styles.fleterHasVideoBox]}>
                                <CheckBox
                                    containerStyle={styles.selectBox}
                                    checkedIcon={<Image style={styles.selectIcon} source={require('../../static/img/common-icons/check-box.png')} />}
                                    uncheckedIcon={<Image style={styles.selectIcon} source={require('../../static/img/common-icons/check-box-outline.png')} />}
                                    checked={feedbackOptions[3]}
                                    onPress={() => { handleFeaadbackOptionCheck(3) }}
                                />
                                <Text style={styles.sortTitle} onPress={() => { handleFeaadbackOptionCheck(3) }}>线路质量差</Text>
                            </View>
                        </View>
                        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                            <Button
                                onPress={handleFeedbackSubmit}
                                title={'提交'}
                                containerStyle={styles.nextButtonContainer}
                                buttonStyle={{ ...styles.nextButton, backgroundColor: '#3366ff' }}
                                titleStyle={styles.nextButtonText}
                            ></Button>
                        </View>
                    </View>
                </Overlay>
            </View>
            {/* 岩板布局 */}
            <ScrollView
                style={{ flex: 1, backgroundColor: '#fff' }}
                contentContainerStyle={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}
                alwaysBounceHorizontal={false}
                alwaysBounceVertical={false}
                onLayout={(info) => { getBoardViewLayout(info) }}
            >
                {/* {...panResponder.panHandlers} 用于左右滑动切换线路 */}
                {/* <View style={styles.layoutBox} {...panResponder.panHandlers}> */}
                <ReactNativeZoomableView
                    maxZoom={BOARD_MAX_ZOOM[boardType.id] || 1.5}
                    minZoom={boardMinZoom}
                    zoomStep={0}
                    doubleTapDelay={0}
                    initialZoom={boardMinZoom}
                    captureEvent={true}
                    onPanResponderEnd={onPanResponderRelease}
                    style={styles.layoutBox}
                >
                    <Pressable onPress={() => { setIsNotOpacity(false) }}>
                        <Image
                            source={IMG_MAP[boardType.id]}
                            resizeMode='contain'
                            // marginBottom 为实际调节
                            style={{ width: layoutWidth, height: layoutHeight, marginBottom: -0.3 }}
                        ></Image>
                        {/* 岩点选择覆盖层 */}
                        <View style={[styles.pointCoverBox, { width: layoutWidth, height: layoutHeight, left: POINT_LAYER_LEFT_SETOFF[boardType.id] }]}>
                            {/* 选中的岩点 */}
                            {!!pointJson && <SelectPoint />}
                        </View>
                    </Pressable>
                </ReactNativeZoomableView>
                {/* </View> */}
                {lineInfo.type === 2 &&
                    <Pressable
                        style={{ position: 'absolute', bottom: 10, width: screenWidth, paddingHorizontal: 10, opacity: isNotOpacity ? 1 : 0.5 }}
                        onStartShouldSetResponderCapture={clickPlayPad}
                    >
                        <View style={{ width: '100%', backgroundColor: '#f6f8fa', borderRadius: 8 }}>
                            <View
                                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}
                                onStartShouldSetResponderCapture={(ev) => true}
                            >
                                <Text style={{ width: 32 }}>{Math.floor(curTime / 60)}:{curTime % 60 < 10 ? `0${curTime % 60}` : curTime % 60}</Text>
                                <MultiSlider
                                    values={[curTime]}
                                    min={0}
                                    max={totalTime}
                                    step={1}
                                    snapped={false}
                                    sliderLength={screenWidth - 135}
                                    containerStyle={styles.sliderContainer}
                                    markerStyle={{ ...styles.sliderMarker, height: 14, width: 14, backgroundColor: '#000000' }}
                                    selectedStyle={{ backgroundColor: '#000000' }}
                                    enabledOne={false}
                                    enabledTwo={false}
                                    customMarker={() => <View style={{ height: 14, width: 14, backgroundColor: '#000000', borderRadius: 14 }}></View>}
                                />
                                <Text style={{ width: 32 }}>{Math.floor(totalTime / 60)}:{totalTime % 60 < 10 ? `0${totalTime % 60}` : totalTime % 60}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
                                <TouchableOpacity style={styles.playButton} onPress={() => { changeCurFrime(1) }}>
                                    <Image source={require('../../static/img/common-icons/last-one.png')}
                                        style={{ height: 28, width: 28 }}
                                    ></Image>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.playButton} onPress={() => { setCurPlayState(!curPlayState) }}>
                                    {curPlayState === true &&
                                        < Image source={require('../../static/img/common-icons/stop.png')}
                                            style={{ height: 32, width: 32 }}
                                        ></Image>
                                    }
                                    {curPlayState === false &&
                                        < Image source={require('../../static/img/common-icons/play.png')}
                                            style={{ height: 32, width: 32 }}
                                        ></Image>
                                    }
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.playButton} onPress={() => { changeCurFrime(2) }}>
                                    <Image source={require('../../static/img/common-icons/next-one.png')}
                                        style={{ height: 28, width: 28 }}
                                    ></Image>
                                </TouchableOpacity>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={{ width: 35, marginRight: 10 }}>{FRAME_TIME_MAP(frameTime)}</Text>
                                <Image source={require('../../static/img/common-icons/slow.png')}
                                    style={{ height: 20, width: 20 }}
                                ></Image>
                                <MultiSlider
                                    values={[-frameTime]}
                                    min={-57}
                                    max={-3}
                                    step={3}
                                    snapped={false}
                                    sliderLength={screenWidth - 180}
                                    pressedMarkerStyle={{ height: 24, width: 24 }}
                                    containerStyle={{ marginHorizontal: 20 }}
                                    markerStyle={styles.sliderMarker}
                                    selectedStyle={styles.sliderSelected}
                                    onValuesChange={(value) => { speedChange(value) }}
                                />
                                <Image source={require('../../static/img/common-icons/fast.png')}
                                    style={{ height: 20, width: 20 }}
                                ></Image>
                            </View>
                        </View>
                    </Pressable >
                }
            </ScrollView>
            {/* 底部操作栏 */}
            <View style={styles.actionBox}>
                {/* 左侧操作集合 */}
                <View style={styles.actiongBoxLeft}>
                    <TouchableOpacity style={styles.actionButton} onPress={() => { setShowVideoOverlay(true) }}>
                        <Image source={require('../../static/img/common-icons/video.png')}
                            style={[styles.oprateIcon, { height: 25, marginVertical: -2.5 }]}
                        ></Image>
                        <Text style={styles.actionText}>{lineInfo.video === '' ? '无攻略' : '有攻略'}</Text>
                    </TouchableOpacity>
                    <OverlayVideo
                        isVisible={showVideoOverlay}
                        lineInfo={lineInfo}
                        close={() => setShowVideoOverlay(false)}
                        onVideoUpSuccess={() => { onVideoUpSuccess() }}
                    />
                    <TouchableOpacity style={styles.actionButton} onPress={() => { handlerCollection(lineInfo.collect) }}>
                        {lineInfo.collect ?
                            <Image source={require('../../static/img/common-icons/collect-fill.png')} style={styles.oprateIcon}></Image>
                            :
                            <Image source={require('../../static/img/common-icons/collect.png')} style={styles.oprateIcon}></Image>
                        }
                        <Text style={styles.actionText}>{lineInfo.collect ? '已收藏' : '未收藏'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton} onPress={handlerBT_Press}>
                        <Image source={require('../../static/img/common-icons/bluetooth.png')}
                            style={styles.blIcon}
                        ></Image>
                        <Text style={styles.actionText}>{BTDevice ? '已同步' : '未同步'}</Text>
                    </TouchableOpacity>
                    {/* 选择要同步的蓝牙设备 */}
                    <OverlayBT_Select
                        isVisible={showDeviceOverlay}
                        pointJson={pointJson}
                        close={() => setShowDeviceOverlay(false)}
                    />
                </View>
                {/* 右侧 "完成" */}
                <View style={styles.actiongBoxRight}>
                    {lineDeletePermission === 1 &&
                        <Button
                            onPress={handlerDeleteLine}
                            title='删除'
                            containerStyle={styles.deletteButtonContainer}
                            buttonStyle={styles.deletteButton}
                            titleStyle={styles.nextButtonText}
                        ></Button>
                    }
                    {route.params.sourceScreenName !== SOURCE_SCREEN_NAME &&
                        <Button
                            onPress={handlerCompletePress}
                            title={lineInfo.complete === '1' ? '完成' : '完成'}
                            icon={<Image source={require('../../static/img/common-icons/complete-white.png')} style={styles.companyIcon}></Image>}
                            containerStyle={styles.nextButtonContainer}
                            buttonStyle={{ ...styles.nextButton, backgroundColor: lineInfo.complete === '1' ? '#00b050' : '#3366ff' }}
                            titleStyle={styles.nextButtonText}
                        // disabled={lineInfo.complete === '1' ? true : false}
                        ></Button>
                    }
                </View>
            </View>
            {/* 删除弹出框 */}
            <Overlay isVisible={deleteConfirm} onBackdropPress={() => { setDeleteConfirm(false) }}>
                <View style={{ ...styles.overlayBox, width: screenWidth * 0.7 }}>
                    <View>
                        <Text style={styles.overlayTitle}>确认要删除此线路吗？</Text>
                    </View>
                    <View style={styles.buttonGroup}>
                        <Button
                            title="取消"
                            type="clear"
                            titleStyle={styles.cancelButtonBox}
                            buttonStyle={styles.cancelButton}
                            onPress={() => { setDeleteConfirm(false) }}
                        />
                        <Button
                            title="确认"
                            type="clear"
                            titleStyle={styles.saveButtonBox}
                            buttonStyle={styles.saveButton}
                            onPress={() => { setDeleteConfirm(false), deleteLine() }}
                        />
                    </View>
                </View>
            </Overlay>
        </View>
    );
}

const mapStateToProps = state => {
    return {
        userID: getUserInfo(state).userID,
        lineDeletePermission: getUserInfo(state).lineDeletePermission,
        BTDevice: getBT_Device(state),
        boardType: getBoardSettingType(state),
    };
};

export default connect(
    mapStateToProps,
    {}
)(LineLayoutScreen);