import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, Image, Pressable, PanResponder, ScrollView } from 'react-native';
import { Button } from 'react-native-elements';
import { useWindowDimensions } from 'react-native';
import { connect } from "react-redux";
import { getUserInfo, getBT_Device, getBoardSettingType } from "../../redux/selectors";
import { START, END, FOOT, HAND, UN_SELECTED, BOARD_MAX_ZOOM, SELECT_CIRCLE_BORDER_WIDTH, BOARD_COORDINATE, BOARD_COORDINATE_L, returnPointColor, BOARD_TYPE_NAME, LAYOUT_H, POINT_W, POINT_H, IMG_MAP, BOARD_POINT_MAP, SELECT_CIRCLE_SIZE, BOARD_TOP_MAP, POINT_LAYER_LEFT_SETOFF } from "../../config/board";
import { styles } from "./course-line-layout-screen.styles";
import { http, GET, POST } from "../../common/http";
import OverlayBT_Select from "../../components/overlay-BT-select/overlay-BT-select";
import OverlayVideo from "../../components/overlay-video/overlay-video";
import { toastMessage } from "../../common/global";
import ReactNativeZoomableView from '@dudigital/react-native-zoomable-view/src/ReactNativeZoomableView';
import { boardImgHight, boardImgWidth } from "../../config/line"

// 视图主组件
const CourseLineLayoutScreen = ({ route, navigation, userID, BTDevice, boardType }) => {
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

    // 组件初始化
    useEffect(() => {
    }, []);

    // 获得参数时，获取线路详细信息
    useEffect(() => {
        if (!route.params) {
            return;
        }
        // 处理参数-线路信息
        getLineInfo(route.params.lineInfo.lineId || '', route.params.lineInfo);
    }, [route.params]);

    // 获取线路信息
    const getLineInfo = (lineID, baseLineInfo) => {
        http(`course/line/info/${lineID}`, GET)
            .then((res) => {
                // errorCode
                if (res.errCode) {
                    console.error('response error code: ', res.errCode);
                    toastMessage(`请求失败`);
                    return;
                }
                // response处理
                if (res.data) {
                    setPointJson(JSON.parse(res.data.content));
                    setLineInfo({ ...baseLineInfo, ...res.data });
                }
            })
            .catch((error) => {
                console.error(error);
                toastMessage(`请求失败`);
            })
    }

    // 处理左右滑动切换线路
    const onPanResponderRelease = (evt, gestureState, zoomableViewEventObject, baseComponentResult) => {
        // 排除缩放手势的响应
        if (zoomableViewEventObject.zoomLevel !== 1 || zoomableViewEventObject.lastZoomLevel !== 1 || zoomableViewEventObject.lastMovePinch === true) {
            return
        }
        /* 这里仅当用户滑动的距离较长才响应用户操作，考虑实际用户点击是手指的一片区域 */
        if (!(gestureState.dx < -screenWidth * 0.25 || gestureState.dx > screenWidth * 0.25)) {
            return
        }
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
        if (route.params.courseList && route.params.courseList.length) {
            // 课程线路来源
            getNextCourseLineInfo(isNext, route.params.courseList)
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
    //             if (route.params.courseList && route.params.courseList.length) {
    //                 // 课程线路来源
    //                 getNextCourseLineInfo(isNext, route.params.courseList)
    //             }
    //         },
    //     })
    // ).current;

    //  获取上一个或下一个的课程线路信息
    const getNextCourseLineInfo = (isNext, lineList) => {
        if (route.params.index !== undefined || currentIndex !== null) {
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
            if (lineList[targetIndex]) {
                console.log('左滑右滑获取的ID', lineList[targetIndex].lineId);
                setCurrentIndex(targetIndex);
                getLineInfo(lineList[targetIndex].lineId, lineList[targetIndex]);
            } else {
                // 到尾
            }
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

    // 蓝牙同步点击处理
    const handlerBT_Press = () => {
        setShowDeviceOverlay(true);
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

    // 当视频上传成功触发
    const onVideoUpSuccess = () => {
        setLineInfo({ ...lineInfo, video: '1' });
    }

    // 返回react组件
    return (
        <View style={styles.box}>
            {/* 顶部导航栏，标题 */}
            <View style={styles.titleBox}>
                <View style={styles.titleSubBox}>
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
                            <Text style={styles.titleLevel}>{lineInfo.level || '未知难度'}{'/'}{lineInfo.angelValue}</Text>
                        </View>
                    </View>
                    <View style={{ width: 50 }}></View>
                </View>
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
                    initialZoom={boardMinZoom}
                    doubleTapDelay={0}
                    captureEvent={true}
                    onPanResponderEnd={onPanResponderRelease}
                    style={styles.layoutBox}
                >
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
                </ReactNativeZoomableView>
                {/* </View> */}
            </ScrollView>
            {/* 底部操作栏 */}
            <View style={styles.actionBox}>
                {/* 左侧操作集合 */}
                <View style={styles.actiongBoxLeft}>
                    <OverlayVideo
                        isVisible={showVideoOverlay}
                        lineInfo={lineInfo}
                        close={() => setShowVideoOverlay(false)}
                        onVideoUpSuccess={() => { onVideoUpSuccess() }}
                    />
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
                </View>
            </View>
        </View>
    );
}

const mapStateToProps = state => {
    return {
        userID: getUserInfo(state).userID,
        BTDevice: getBT_Device(state),
        boardType: getBoardSettingType(state),
    };
};

export default connect(
    mapStateToProps,
    {}
)(CourseLineLayoutScreen);