import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Image, Pressable, useWindowDimensions, ScrollView } from 'react-native';
import { styles } from "./line-create-part1-for-level-screen.style";
import { connect } from "react-redux";
import { getBoardSettingType, getBT_Device } from "../../redux/selectors";
import { START, END, FOOT, HAND, UN_SELECTED, BOARD_MAX_ZOOM, returnPointColor, SELECT_CIRCLE_BORDER_WIDTH, LAYOUT_H, POINT_W, POINT_H, IMG_MAP, BOARD_POINT_MAP, SELECT_CIRCLE_SIZE, BOARD_TOP_MAP,POINT_LAYER_LEFT_SETOFF } from "../../config/board";
import OverlayBT_Select from "../../components/overlay-BT-select/overlay-BT-select";
import ReactNativeZoomableView from '@dudigital/react-native-zoomable-view/src/ReactNativeZoomableView';
import { boardImgHight, boardImgWidth } from "../../config/line"
import { toastMessage } from "../../common/global";
import { Button, Overlay, LinearProgress } from 'react-native-elements';
import { http, GET, POST } from "../../common/http";

// 视图主组件
const LineCreatePart1ForLevelScreen = ({ navigation, route, boardType, BTDevice }) => {
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
    const [pointList, setPointList] = useState(JSON.parse(BOARD_POINT_MAP[boardType.id]));
    // 当前起始点计数
    const [startCount, setStartCount] = useState(0);
    // 当前终点计数
    const [endCount, setEndCount] = useState(0);
    // 当前岩点选择的数据
    const [selectedPoints, setSelectedPoints] = useState({});
    // 当前岩点选择的数据的数组
    const [selectedPointsArray, setSelectedPointsArray] = useState([]);
    // 是否显示蓝牙设备选择框
    const [showDeviceOverlay, setShowDeviceOverlay] = useState(false);
    // 岩板的最小缩放值
    const [boardMinZoom, setBoardMinZoom] = useState(1);
    // 当前帧
    const [curFrame, setCurFrame] = useState(1);
    // 总帧数
    const [frameCount, setFrameCount] = useState(1);
    // 删除帧的确认框
    const [frimeDeleteConfirm, setFrimeDeleteConfirm] = useState(false);
    // 当为编辑草稿箱线路时，线路的信息
    const [draftLineInfo, setDraftLineInfo] = useState(null);
    // 页面显示loading 
    const [showLoding, setShowLoding] = useState(false);

    // 获得参数时，获取线路详细信息，说明是要编辑草稿箱里的线路
    useEffect(() => {
        if (!route.params) {
            return;
        }
        const lineID = route.params.lineId || '';
        setShowLoding(true);
        http(`line/draft/detail/${lineID}`, GET)
            .then((res) => {
                // errorCode
                if (res.errCode) {
                    setShowLoding(false);
                    console.error('response error code: ', res.errCode);
                    toastMessage(`请求失败`);
                    return;
                }
                // response处理
                if (res.data) {
                    const pointsArray = JSON.parse(res.data.content);
                    setSelectedPointsArray(pointsArray);
                    setDraftLineInfo({ ...route.params, ...res.data });
                    setSelectedPoints({ ...pointsArray[1] });
                    resetPointList({ ...pointsArray[1] });
                    setFrameCount(pointsArray.length - 1);
                    setShowLoding(false);
                }
            })
            .catch((error) => {
                setShowLoding(false);
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
            if ((next === END.ID && endCount === 2) || (next === END.ID && curFrame !== frameCount)) {
                // 终点已有2个,或者当前不是最后一帧，则跳过起始点
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
            if ((next === START.ID && startCount === 2) || (next === START.ID && curFrame !== 1)) {
                // 起始点已有2个,或者当前不是第一帧，则跳过起始点
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
            if ((next === START.ID && startCount === 2) || (next === START.ID && curFrame !== 1)) {
                // 起始点已有2个,或者当前不是第一帧，跳过起始点
                return (next + 1);
            }
            // 如果接下来应该轮到 终点
            if ((next === END.ID && endCount === 2) || (next === END.ID && curFrame !== frameCount)) {
                // 终点已有2个,或者当前不是最后一帧，则跳过起始点
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
        // 保存最后一帧的数据
        selectedPointsArray[curFrame] = { ...selectedPoints };
        setSelectedPointsArray([...selectedPointsArray]);
        // 跳转
        navigation.navigate('LineCreatePart2ForLevelScreen', {
            pointJsonStr: JSON.stringify(selectedPointsArray),
            draftLineInfo: { ...draftLineInfo },
        })
    }

    // 蓝牙同步点击处理
    const handlerBT_Press = () => {
        setShowDeviceOverlay(true);
    }

    // 根据 selectedPoints 重置 pointList
    const resetPointList = (selectedPoints) => {
        for (const key in pointList) {
            pointList[key].stateID = undefined;
        }
        Object.keys(selectedPoints).forEach((name) => {
            pointList[name].stateID = selectedPoints[name].stateID;
        });
        setPointList({ ...pointList });
    }

    // 切换当前帧
    const changeFrime = (type) => {
        // 先保存当前帧的数据
        selectedPointsArray[curFrame] = { ...selectedPoints };
        setSelectedPointsArray([...selectedPointsArray]);
        // 再切换帧
        let tempCurFrame = curFrame;
        if (type === 1) {
            tempCurFrame = (curFrame - 1);
        } else if (type === 2) {
            if (curFrame === frameCount) {
                setFrameCount(frameCount + 1);
                // 创建新帧的时候要附带上一页的数据
                selectedPointsArray[curFrame + 1] = { ...selectedPointsArray[curFrame] };
                setSelectedPointsArray([...selectedPointsArray]);
            }
            tempCurFrame = (curFrame + 1);
        }
        setCurFrame(tempCurFrame);
        // 再恢复新帧的数据
        setSelectedPoints({ ...selectedPointsArray[tempCurFrame] });
        // 刷新岩点列表显示
        resetPointList({ ...selectedPointsArray[tempCurFrame] });
    }

    // 删除某一帧
    const deleteFrime = (frimeNumber) => {
        const temp = [];
        selectedPointsArray.forEach((item, index) => {
            if (frimeNumber === index) {
                return;
            }
            temp.push(item);
        });
        setFrameCount(temp.length - 1);
        let tempCurFrame = curFrame
        if (tempCurFrame !== 1) {
            tempCurFrame--;
            setCurFrame(tempCurFrame);
        }
        setSelectedPoints({ ...temp[tempCurFrame] });
        setSelectedPointsArray(temp);
        // 刷新岩点列表显示
        resetPointList({ ...temp[tempCurFrame] });
        toastMessage(`删除成功`);
    }

    // 岩板布局组件
    const PointLayout = (changeFlag) => {
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
        <>
            {showLoding ?
                <LinearProgress color="#3366ff" />
                :
                <View style={styles.box}>
                    {/* 顶部导航栏，标题 */}
                    <View style={styles.titleBox}>
                        <View style={styles.titleSubBox}>
                            <TouchableOpacity style={styles.backButtonBox} onPress={navigation.goBack}>
                                <Image
                                    source={require('../../static/img/common-icons/arrow-left-bold.png')}
                                    style={styles.backButtonIcon}
                                ></Image>
                            </TouchableOpacity>
                            <View style={styles.titleTextBox}>
                                <Text style={styles.titleText}>{draftLineInfo?.name || boardType.name} 难度线路</Text>
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
                                <PointLayout changeFlag={pointList} />
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
                        {/* 切换当前帧 */}
                        <View style={{ marginLeft: 25, flexDirection: 'row', alignItems: 'center' }}>
                            <TouchableOpacity
                                style={{ justifyContent: 'center', alignItems: 'center', marginLeft: 22 }}
                                onPress={() => changeFrime(1)}
                                disabled={curFrame === 1}
                            >
                                <Image
                                    source={require('../../static/img/common-icons/arrow-right.png')}
                                    resizeMode={'stretch'}
                                    style={{ height: 27, width: 28, transform: [{ rotate: '180deg' }] }}
                                ></Image>
                            </TouchableOpacity>
                            <Text style={{ fontSize: 17, color: '#808080', marginHorizontal: 10 }}>{curFrame} / {frameCount}</Text>
                            <TouchableOpacity
                                style={{ justifyContent: 'center', alignItems: 'center' }}
                                onPress={() => changeFrime(2)}
                                disabled={frameCount >= 30}
                            >
                                <Image
                                    source={require('../../static/img/common-icons/arrow-right.png')}
                                    resizeMode={'stretch'}
                                    style={{ height: 27, width: 28, }}
                                ></Image>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={{ justifyContent: 'center', alignItems: 'center' }}
                                onPress={() => setFrimeDeleteConfirm(true)}
                                disabled={frameCount === 1}
                            >
                                <Image
                                    source={require('../../static/img/common-icons/delete.png')}
                                    resizeMode={'stretch'}
                                    style={{ height: 22, width: 22, }}
                                ></Image>
                            </TouchableOpacity>
                            {/* 删除帧的弹出框 */}
                            <Overlay isVisible={frimeDeleteConfirm} onBackdropPress={() => { setFrimeDeleteConfirm(false) }}>
                                <View style={{ ...styles.overlayBox, width: screenWidth * 0.7 }}>
                                    <View>
                                        <Text style={styles.overlayTitle}>确认要删除当前帧吗？</Text>
                                    </View>
                                    <View style={styles.buttonGroup}>
                                        <Button
                                            title="取消"
                                            type="clear"
                                            titleStyle={styles.cancelButtonBox}
                                            buttonStyle={styles.cancelButton}
                                            onPress={() => { setFrimeDeleteConfirm(false) }}
                                        />
                                        <Button
                                            title="确认"
                                            type="clear"
                                            titleStyle={styles.saveButtonBox}
                                            buttonStyle={styles.saveButton}
                                            onPress={() => { deleteFrime(curFrame); setFrimeDeleteConfirm(false) }}
                                        />
                                    </View>
                                </View>
                            </Overlay>
                        </View>
                        {/* 右侧 "下一步" */}
                        <View style={styles.actiongBoxRight}>
                            <Button
                                title="下一步"
                                containerStyle={styles.nextButtonContainer}
                                buttonStyle={styles.nextButton}
                                titleStyle={styles.nextButtonText}
                                onPress={handlerNextStep}
                            />
                        </View>
                    </View>
                </View >
            }
        </>
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
)(LineCreatePart1ForLevelScreen);
