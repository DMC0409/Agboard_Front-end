import React, { useEffect, useState } from 'react';
import { Text, View, useWindowDimensions, ScrollView } from 'react-native';
import { http, GET, POST } from "../../common/http";
import { connect } from "react-redux";
import { Button, Overlay } from 'react-native-elements';
import { styles } from "./overlay-default-board-setup.styles";
import { getUserInfo } from "../../redux/selectors";
import { CustomLabelsGroup } from "../../components/custom-labels-group/custom-labels-group";
import { setBoardSetting } from "../../redux/actions";
import { toastMessage } from "../../common/global";

const OverlayDefaultBoardSetup = ({ userID, setBoardSetting }) => {
    // 屏幕尺寸
    let screenWidth = useWindowDimensions().width;
    let screenHeight = useWindowDimensions().height;

    // 覆盖框显示
    const [showOverlay, setShowOverlay] = useState(false);
    // 表单选项-岩板类型 
    const [boardTypeOptions, setBoardTypeOptions] = useState([]);
    // 表单选项-岩板角度 {id: string, value: string}
    const [boardAngleOptions, setBoardAngleOptions] = useState([]);
    // 表单值-岩板类型
    const [boardTypeValue, setBoardTypeValue] = useState('');
    // 表单值-岩板角度
    const [boardAngleValue, setBoardAngleValue] = useState('');
    // 当前选择的岩板类型name
    const [boardTypeName, setBoardTypeName] = useState('');
    // 当前选择的岩板角度name
    const [boardAngleName, setBoardAngleName] = useState('');

    // 组件初始化时，检查当前登录用户是否进行过默认设置
    useEffect(() => {
        http(`userPrefer/check/${userID}`, GET)
            .then((res) => {
                // errorCode
                if (res.errCode) {
                    console.error('response error code: ', res.errCode);
                    toastMessage(`请求失败`);
                    return;
                }
                // response处理
                if (!res.data) {
                    // 未进行过默认设置
                    setShowOverlay(true);
                    // 获取岩板类型和角度的选项列表
                    getFormOptions();
                } else {
                    // 设置过则查询到设置信息并保存到redux
                    getPreferSetting();
                }
            })
            .catch((error) => {
                console.error(error);
                toastMessage(`请求失败`);
            })
    }, []);

    // 获取用户的默认设置
    const getPreferSetting = () => {
        http(`userPrefer/userID/${userID}`, GET)
            .then((res) => {
                // errorCode
                if (res.errCode) {
                    console.error('response error code: ', res.errCode);
                    toastMessage(`请求失败`);
                    return;
                }
                // response处理
                if (res.data) {
                    let type, angel = { id: '', name: '', upID: '' };
                    res.data.boards.forEach((item) => {
                        if (item.boardPre) {
                            type = { id: item.boardId, name: item.name, upID: item.upId }
                        }
                    });
                    res.data.angels.forEach((item) => {
                        if (item.angelPre) {
                            angel = { id: item.angelId, name: item.value, upID: item.upId }
                        }
                    });
                    // 存入 redux
                    setBoardSetting(type, angel);
                }
            })
            .catch((error) => {
                console.error(error);
                toastMessage(`请求失败`);
            })
    }

    // 获取岩板类型和角度的选项列表
    const getFormOptions = () => {
        // 获取岩板类型选项列表
        http(`board/boards`, GET)
            .then((res) => {
                // errorCode
                if (res.errCode) {
                    console.error('response error code: ', res.errCode);
                    toastMessage(`请求失败`);
                    return;
                }
                // response处理
                if (res.data) {
                    // {id: string, name: string}
                    setBoardTypeOptions([...res.data].map((item, index) => {
                        return {
                            ...item,
                            // 默认选择到第一个index
                            selected: index === 0 ? true : false
                        }
                    }));
                    if (res.data && res.data.length) {
                        setBoardTypeValue(res.data[0].id);
                        setBoardTypeName(res.data[0].name);
                    }
                }
            })
            .catch((error) => {
                console.error(error);
                toastMessage(`请求失败`);
            })
        // 获取岩板角度选项列表
        http(`angel/angels`, GET)
            .then((res) => {
                // errorCode
                if (res.errCode) {
                    console.error('response error code: ', res.errCode);
                    toastMessage(`请求失败`);
                    return;
                }
                // response处理
                if (res.data) {
                    // {id: string, value: string}
                    setBoardAngleOptions([...res.data].map((item, index) => {
                        return {
                            ...item,
                            name: item.value,
                            // 默认选择到第一个index
                            selected: index === 0 ? true : false
                        }
                    }));
                    if (res.data && res.data.length) {
                        setBoardAngleValue(res.data[0].id);
                        setBoardAngleName(res.data[0].name);
                    }
                }
            })
            .catch((error) => {
                console.error(error);
                toastMessage(`请求失败`);
            })
    }

    // 保存按钮点击
    const handlerSaveButton = () => {
        http(`userPrefer/update`, POST, {
            body: {
                id: '',
                boardId: boardTypeValue,
                angelId: boardAngleValue,
                userId: userID
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
                    console.log('新建的偏好设置ID', res.data);
                    // 将新设置保存到 redux
                    let type, angel = { id: '', name: '', upID: res.data };
                    type = { ...type, id: boardTypeValue, name: boardTypeName };
                    angel = { ...type, id: boardAngleValue, name: boardAngleName };
                    setBoardSetting(type, angel);
                    // 关闭弹出框
                    setShowOverlay(false);
                }
            })
            .catch((error) => {
                console.error(error);
                toastMessage(`请求失败`);
            })
    }

    // 岩板类型标签选择处理
    const handlerTypeSelect = (item) => {
        setBoardTypeValue(item.id);
        setBoardTypeName(item.name);
    }

    // 岩板角度标签选择处理
    const handlerAngleSelect = (item) => {
        setBoardAngleValue(item.id);
        setBoardAngleName(item.name);
    }

    return (
        <Overlay isVisible={showOverlay}>
            <View style={{ ...styles.overlayBox, width: screenWidth * 0.75 }}>
                <View>
                    <Text style={styles.overlayTitle}>岩板设置</Text>
                    {/* 岩板类型 */}
                    <Text style={styles.labelText}>岩板类型:</Text>
                    <ScrollView style={{ ...styles.labelBox, maxHeight: screenHeight * 0.2}}>
                        <CustomLabelsGroup labelList={boardTypeOptions} singleOnly={true} labelOnPress={(item) => handlerTypeSelect(item)} />
                    </ScrollView>
                    {/* 岩板角度 */}
                    <Text style={styles.labelText}>岩板角度:</Text>
                    <ScrollView style={{ ...styles.labelBox, maxHeight: screenHeight * 0.4 }}>
                        <CustomLabelsGroup labelList={boardAngleOptions} singleOnly={true} labelOnPress={(item) => handlerAngleSelect(item)} />
                    </ScrollView>
                </View>
                <View style={styles.buttonGroup}>
                    <Button
                        title="保存"
                        type="clear"
                        onPress={() => handlerSaveButton()}
                    />
                </View>
            </View>
        </Overlay>
    );
};

const mapStateToProps = state => {
    return { ...getUserInfo(state) };
};

export default connect(
    mapStateToProps,
    { setBoardSetting }
)(OverlayDefaultBoardSetup);