import React, { useState, useEffect } from "react";
import { View, FlatList, } from 'react-native';
import { styles } from "./temp-board-type-setting-screen.styles";
import { http, GET, POST } from "../../common/http";
import { CustomOptionList, CustomOptionSeparator } from "../../components/custom-option-list/custom-option-list";
import { connect } from "react-redux";
import { getBoardSettingType, getBoardSettingAngel, getUserInfo } from "../../redux/selectors";
import { updateBoardSettingType } from "../../redux/actions";
import { toastMessage } from "../../common/global";

// 视图主组件
const TempBoardTypeSettingScreen = ({ navigation, userID, currentBoardType, currentAngelType, updateBoardSettingType }) => {
    // 当前选中显示的icon
    const SELECTED_ICON = require('../../static/img/common-icons/select.png');

    // 岩板类型列表
    const [boardTypeList, setBoardTypeList] = useState([]);

    // 组件初始化时，获取岩板类型列表
    useEffect(() => {
        // 获取岩板类型选项列表
        getBoardTypeList();
    }, []);

    // 请求-获取岩板类型选项列表
    const getBoardTypeList = () => {
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
                    setBoardTypeList([...res.data].map((item) => {
                        return {
                            ...item,
                            icon: currentBoardType.id === item.id ? SELECTED_ICON : null
                        }
                    }));
                }
            })
            .catch((error) => {
                console.error(error);
                toastMessage(`请求失败`);
            })
    }

    // 列表视图
    const ListRenderItem = ({ item }) => {
        // 列表项点击处理
        const handleListPress = (boardType) => {
            // 请求保存岩板类型设置
            http(`userPrefer/update`, POST, {
                body: {
                    id: currentBoardType.upID,
                    boardId: boardType.id,
                    angelId: currentAngelType.id,
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
                        console.log('成功更新偏好设置,upID:', res.data);
                        // 更新redux中的数据
                        updateBoardSettingType({
                            id: boardType.id,
                            name: boardType.name
                        });
                        // 刷新显示
                        setBoardTypeList([...boardTypeList].map((item) => {
                            return {
                                ...item,
                                icon: boardType.id === item.id ? SELECTED_ICON : null
                            }
                        }));
                    }
                })
                .catch((error) => {
                    console.error(error);
                    toastMessage(`请求失败`);
                })
        }

        return <CustomOptionList listItem={item} hideArrow={true} onPress={() => handleListPress(item)} />;
    };

    // 返回react组件
    return (
        <View style={styles.box}>
            {/* 选项列表 */}
            <View style={styles.listGroup}>
                <FlatList
                    data={boardTypeList}
                    renderItem={ListRenderItem}
                    keyExtractor={item => item.id}
                    ItemSeparatorComponent={CustomOptionSeparator}
                />
            </View>
        </View>
    );
}

const mapStateToProps = state => {
    return {
        currentBoardType: getBoardSettingType(state),
        currentAngelType: getBoardSettingAngel(state),
        userID: getUserInfo(state).userID
    };
};

export default connect(
    mapStateToProps,
    { updateBoardSettingType }
)(TempBoardTypeSettingScreen);