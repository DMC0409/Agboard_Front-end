import React, { useState, useEffect, useCallback, useRef } from "react";
import { View, Text, TouchableOpacity, Image, Pressable, PanResponder, ScrollView } from 'react-native';
import { Button, Overlay, CheckBox } from 'react-native-elements';
import { useWindowDimensions } from 'react-native';
import { connect } from "react-redux";
import { getUserInfo, getBT_Device, getBoardSettingType } from "../../redux/selectors";
import { START, END, FOOT, HAND, UN_SELECTED, BOARD_MAX_ZOOM, BOARD_COORDINATE, SELECT_CIRCLE_BORDER_WIDTH, convertPointToM, convertPoint, returnPointColor, BOARD_TYPE_NAME, LAYOUT_H, POINT_W, POINT_H, IMG_MAP, BOARD_POINT_MAP, SELECT_CIRCLE_SIZE, BOARD_TOP_MAP, POINT_LAYER_LEFT_SETOFF } from "../../config/board";
import { styles } from "./feedback-line-layout-screen.style";
import { http, GET, POST } from "../../common/http";
import OverlayBT_Select from "../../components/overlay-BT-select/overlay-BT-select";
import OverlayVideo from "../../components/overlay-video/overlay-video";
import { SOURCE_SCREEN_NAME } from "../complete-record-screen/complete-record-screen";
import { toastMessage } from "../../common/global";
import { Rating } from 'react-native-ratings';
import ReactNativeZoomableView from '@dudigital/react-native-zoomable-view/src/ReactNativeZoomableView';
import { boardImgHight, boardImgWidth } from "../../config/line"

// 视图主组件
const FeedbackLineLayoutScreen = ({ route, navigation, userID, lineDeletePermission, BTDevice, boardType }) => {
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



    const intervalRef = useRef();

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

    // 获取线路信息
    const getLineInfo = (lineID, baseLineInfo) => {
        http(`line/info/${lineID}/${userID}`, GET)
            .then((res) => {
                // errorCode
                if (res.errCode) {
                    if (res.errCode === 1) {
                        toastMessage(`该线路已被删除`);
                        navigation.goBack();
                        return;
                    }
                    console.error('response error code: ', res.errCode);
                    toastMessage(`请求失败`);
                    return;
                }
                // response处理
                if (res.data) {
                    if (boardType.id === BOARD_TYPE_NAME.L && res.data.boardId === BOARD_TYPE_NAME.M) {
                        // 转换小板的位置到大板
                        setPointJson(convertPoint(JSON.parse(res.data.content)));
                    } else if (boardType.id === BOARD_TYPE_NAME.M && res.data.boardId === BOARD_TYPE_NAME.L) {
                        // 转换大板的位置到小板
                        setPointJson(convertPointToM(JSON.parse(res.data.content)));
                    } else {
                        setPointJson(JSON.parse(res.data.content));
                    }
                    setLineInfo({ ...baseLineInfo, ...res.data });
                }
            })
            .catch((error) => {
                console.error(error);
                toastMessage(`请求失败`);
            })
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
                navigation.goBack();
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
                        <Text style={styles.titleText}>{lineInfo.lineName}</Text>
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
                    </View>
                </View>
                <View style={{ flexDirection: 'row', width: 80, justifyContent: 'flex-end' }}>
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
                <ReactNativeZoomableView
                    maxZoom={BOARD_MAX_ZOOM[boardType.id] || 1.5}
                    minZoom={boardMinZoom}
                    zoomStep={0}
                    doubleTapDelay={0}
                    initialZoom={boardMinZoom}
                    captureEvent={true}
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
)(FeedbackLineLayoutScreen);