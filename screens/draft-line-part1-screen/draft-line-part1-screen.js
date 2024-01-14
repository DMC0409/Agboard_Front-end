import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Image, Pressable, useWindowDimensions, ScrollView } from 'react-native';
import { Button, Overlay } from 'react-native-elements';
import { styles } from "./draft-line-part1-screen.styles";
import { connect } from "react-redux";
import { getBoardSettingType, getBT_Device } from "../../redux/selectors";
import { START, END, FOOT, HAND, UN_SELECTED, BOARD_MAX_ZOOM, BOARD_COORDINATE, SELECT_CIRCLE_BORDER_WIDTH, BOARD_COORDINATE_L, returnPointColor, BOARD_TYPE_NAME,LAYOUT_H, POINT_W, POINT_H, IMG_MAP, BOARD_POINT_MAP, SELECT_CIRCLE_SIZE, BOARD_TOP_MAP, POINT_LAYER_LEFT_SETOFF } from "../../config/board";
import OverlayBT_Select from "../../components/overlay-BT-select/overlay-BT-select";
import { http, GET, POST } from "../../common/http";
import { toastMessage } from "../../common/global";
import ReactNativeZoomableView from '@dudigital/react-native-zoomable-view/src/ReactNativeZoomableView';
import { boardImgHight, boardImgWidth } from "../../config/line"

// 视图主组件
const DraftLinePart1Screen = ({ route, navigation, boardType, BTDevice }) => {
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

    // 岩点列表
    const [pointList, setPointList] = useState({});
    // 当前起始点计数
    const [startCount, setStartCount] = useState(0);
    // 当前终点计数
    const [endCount, setEndCount] = useState(0);
    // 当前岩点选择的数据
    const [selectedPoints, setSelectedPoints] = useState({});
    // 是否显示蓝牙设备选择框
    const [showDeviceOverlay, setShowDeviceOverlay] = useState(false);
    // 线路信息
    const [lineInfo, setLineInfo] = useState({});
    // 确认删除弹出框
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    // 岩板的最小缩放值
    const [boardMinZoom, setBoardMinZoom] = useState(1);

    // 获得参数时，获取线路详细信息
    useEffect(() => {
        if (!route.params) {
            return;
        }
        const lineID = route.params.lineId || '';
        http(`line/draft/detail/${lineID}`, GET)
            .then((res) => {
                // errorCode
                if (res.errCode) {
                    console.error('response error code: ', res.errCode);
                    toastMessage(`请求失败`);
                    return;
                }
                // response处理
                if (res.data) {
                    const points = JSON.parse(res.data.content);
                    setSelectedPoints(points);
                    setLineInfo({ ...route.params, ...res.data });
                    // 加载岩点布局
                    const pointsData = JSON.parse(BOARD_POINT_MAP[boardType.id]);
                    // 刷新岩点列表显示
                    Object.keys(points).forEach((name) => {
                        pointsData[name].stateID = points[name].stateID
                    })
                    setPointList(pointsData);
                }
            })
            .catch((error) => {
                console.error(error);
                toastMessage(`请求失败`);
            })
    }, [route.params]);

    // 计算起点$终点计数
    useEffect(() => {
        let start = 0;
        let end = 0;
        Object.keys(selectedPoints).forEach((name) => {
            if (selectedPoints[name].stateID === START.ID) {
                start++;
            }
            if (selectedPoints[name].stateID === END.ID) {
                end++;
            }
        })
        setStartCount(start);
        setEndCount(end);
    }, [selectedPoints]);

    // 返回参数状态的下一个状态
    const nextPointStatus = (statusID, point) => {
        // 注意：起点和终点最多2个，其他不限
        // 接下来应该轮到
        let next;
        if (BOARD_TOP_MAP[boardType.id].indexOf(point.x) !== -1) {
            // 如果是上面3排，先让终点岩石点先亮
            if (statusID === UN_SELECTED.ID) {
                next = END.ID;
            } else if (statusID === END.ID) {
                next = FOOT.ID;
            } else if (statusID === HAND.ID) {
                next = UN_SELECTED.ID;
            } else {
                next = statusID + 1;
            }
            // 如果接下来应该轮到 终点
            if (next === END.ID && endCount === 2) {
                // 终点已有2个，跳过起始点
                return FOOT.ID;
            }
        } else if ([1, 2].indexOf(point.x) !== -1) {
            // 如果是下面2排，不让终点岩点亮
            if (statusID === HAND.ID) {
                next = UN_SELECTED.ID;
            } else {
                next = statusID + 1;
            }
            // 如果接下来应该轮到 起始点
            if (next === START.ID && startCount === 2) {
                // 起始点已有2个，跳过起始点
                return (next + 1);
            }
        } else {
            // 正常轮流
            if (statusID === END.ID) {
                next = UN_SELECTED.ID;
            } else {
                next = statusID + 1;
            }
            // 如果接下来应该轮到 起始点
            if (next === START.ID && startCount === 2) {
                // 起始点已有2个，跳过起始点
                return (next + 1);
            }
            // 如果接下来应该轮到 终点
            if (next === END.ID && endCount === 2) {
                // 终点已有2个，跳过起始点
                return 0;
            }
        }
        return next;
    };

    // 点击岩点事件处理
    const selectPoint = (pointInfo, pointID) => {
        // 赋值接下来岩点应有的状态
        pointInfo.stateID = nextPointStatus(pointInfo.stateID || UN_SELECTED.ID, pointInfo);
        // 去除状态为未选择的岩点
        const oldPoints = { ...selectedPoints, [pointID]: pointInfo }
        const newPoints = {};
        Object.keys(oldPoints).forEach((name) => {
            if (oldPoints[name].stateID !== UN_SELECTED.ID) {
                newPoints[name] = { ...oldPoints[name] };
            }
        });
        // 记录所选岩点的状态
        setSelectedPoints({ ...newPoints });
        // 刷新岩点列表显示
        setPointList({ ...pointList });
    }

    // 长按岩点事件处理
    const longSelectPoint = (pointInfo, pointID) => {
        // 赋值接下来岩点应有的状态
        pointInfo.stateID = UN_SELECTED.ID;
        // 去除状态为未选择的岩点
        const oldPoints = { ...selectedPoints, [pointID]: pointInfo }
        const newPoints = {};
        Object.keys(oldPoints).forEach((name) => {
            if (oldPoints[name].stateID !== UN_SELECTED.ID) {
                newPoints[name] = { ...oldPoints[name] };
            }
        });
        // 记录所选岩点的状态
        setSelectedPoints({ ...newPoints });
        // 刷新岩点列表显示
        setPointList({ ...pointList });
    }

    // 下一步点击处理
    const handlerNextStep = () => {
        navigation.navigate('DraftLinePart2Screen', {
            pointJsonStr: JSON.stringify(selectedPoints),
            lineInfo: lineInfo
        })
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

    // 删除草稿线路
    const deleteLine = () => {
        http(`line/draft/delete/${route.params.lineId}`, GET)
            .then((res) => {
                // errorCode
                if (res.errCode) {
                    console.error('response error code: ', res.errCode);
                    toastMessage(`请求失败`);
                    return;
                }
                // response处理
                if (res.data) {
                    // 删除成功
                    toastMessage(`删除成功`);
                    navigation.navigate('ScreenContentForDraft', { needRefresh: true });
                } else {
                    toastMessage(`删除失败`);
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

    // 岩板布局组件
    const PointLayout = () => {
        return (
            <>
                {
                    Object.keys(pointList).map((name) => {
                        if (!name) {
                            return;
                        }
                        return (
                            <Pressable
                                key={name}
                                onPress={() => { selectPoint(pointList[name], name) }}
                                onLongPress={() => { longSelectPoint(pointList[name], name) }}
                                hitSlop={0.01 * screenWidth}
                                style={[{
                                    height: pointHeight,
                                    width: pointWidth,
                                    position: 'absolute',
                                    bottom: (pointList[name].x * pointHeight) - (pointHeight / 1.5),
                                    left: (pointList[name].y * pointWidth) - (pointWidth / 1.5),
                                }]}>
                                {/* 选中的圆形边框效果 */}
                                {!!pointList[name].stateID &&
                                    <View
                                        style={{
                                            height: SELECT_CIRCLE_SIZE[boardType.id] * screenWidth,
                                            width: SELECT_CIRCLE_SIZE[boardType.id] * screenWidth,
                                            borderRadius: 0.05 * screenWidth,
                                            borderColor: pointList[name].stateID ? returnPointColor(pointList[name].stateID) : UN_SELECTED.COLOR,
                                            borderWidth: SELECT_CIRCLE_BORDER_WIDTH[boardType.id] || 2.5,
                                            justifyContent: 'center',
                                            alignItems: 'center'
                                        }}
                                    >
                                        {/* 岩点ID显示 */}
                                        {/* <Text
                                            style={[styles.tempItemText, {
                                                fontSize: 0.0212 * screenWidth,
                                                color: pointList[name].stateID ? returnPointColor(pointList[name].stateID) : UN_SELECTED.COLOR
                                            }]}
                                        >
                                            {name}
                                        </Text> */}
                                    </View>
                                }
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
                        {lineInfo.name &&
                            <View style={styles.titleTextBox}>
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
                                </Text>
                                <Text style={styles.titleLevel}>{lineInfo.angelValue}</Text>
                                <Text style={styles.titleText}>{lineInfo.name}</Text>
                            </View>
                        }
                    </View>
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
                        {/* 岩点布局 */}
                        <PointLayout />
                    </View>
                </ReactNativeZoomableView>
            </ScrollView>
            {/* 底部操作栏 */}
            <View style={styles.actionBox}>
                {/* 左侧操作集合 */}
                <View style={styles.actiongBoxLeft}>
                    <TouchableOpacity style={styles.actionButton} onPress={handlerBT_Press}>
                        <Image
                            source={require('../../static/img/common-icons/bluetooth.png')}
                            resizeMode={'stretch'}
                            style={styles.blIcon}
                        ></Image>
                        <Text style={styles.actionText}>{BTDevice ? '已同步' : '未同步'}</Text>
                    </TouchableOpacity>
                    {/* 选择要同步的蓝牙设备 */}
                    <OverlayBT_Select
                        isVisible={showDeviceOverlay}
                        pointJson={selectedPoints}
                        close={() => setShowDeviceOverlay(false)}
                    />
                </View>
                {/* 右侧 "下一步" */}
                <View style={styles.actiongBoxRight}>
                    <Button
                        title="删除"
                        containerStyle={[styles.nextButtonContainer, { marginRight: 10 }]}
                        buttonStyle={[styles.nextButton, { backgroundColor: '#d81e06' }]}
                        titleStyle={styles.nextButtonText}
                        onPress={() => { setDeleteConfirm(true) }}
                    />
                    <Button
                        title="下一步"
                        containerStyle={styles.nextButtonContainer}
                        buttonStyle={styles.nextButton}
                        titleStyle={styles.nextButtonText}
                        onPress={handlerNextStep}
                    />
                </View>
                <Overlay isVisible={deleteConfirm} onBackdropPress={() => { setDeleteConfirm(false) }}>
                    <View style={{ ...styles.overlayBox, width: screenWidth * 0.7 }}>
                        <View>
                            <Text style={styles.overlayTitle}>确认要删除此草稿线路吗？</Text>
                        </View>
                        <View style={styles.buttonGroup}>
                            <Button
                                title="取消"
                                type="clear"
                                titleStyle={styles.cancelButtonBox}
                                buttonStyle={styles.cancelButton}
                                onPress={() => setDeleteConfirm(false)}
                            />
                            <Button
                                title="确认"
                                type="clear"
                                titleStyle={styles.saveButtonBox}
                                buttonStyle={styles.saveButton}
                                onPress={() => deleteLine()}
                            />
                        </View>
                    </View>
                </Overlay>
            </View>
        </View >
    );
}

const mapStateToProps = state => {
    return {
        boardType: getBoardSettingType(state),
        BTDevice: getBT_Device(state)
    };
};

export default connect(
    mapStateToProps,
    {}
)(DraftLinePart1Screen);
