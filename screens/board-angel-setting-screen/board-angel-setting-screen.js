import React, { useState, useEffect } from "react";
import { View, FlatList, } from 'react-native';
import { styles } from "./board-angel-setting-screen.styles";
import { http, GET, POST } from "../../common/http";
import { CustomOptionList, CustomOptionSeparator } from "../../components/custom-option-list/custom-option-list";
import { connect } from "react-redux";
import { getBoardSettingType, getBoardSettingAngel, getUserInfo } from "../../redux/selectors";
import { updateBoardSettingAngel } from "../../redux/actions";
import { toastMessage } from "../../common/global";

// 视图主组件
const BoardAngelSettingScreen = ({ navigation, userID, currentBoardType, currentAngelType, updateBoardSettingAngel }) => {
    // 当前选中显示的icon
    const SELECTED_ICON = require('../../static/img/common-icons/select.png');

    // 岩板角度列表
    const [boardAngelList, setBoardAngelList] = useState([]);

    // 组件初始化时，获取岩板类型列表
    useEffect(() => {
        // 获取岩板类型选项列表
        getBoardAngelList();
    }, []);

    // 请求-获取岩板角度选项列表
    const getBoardAngelList = () => {
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
                    setBoardAngelList([...res.data].map((item) => {
                        return {
                            ...item,
                            name: item.value,
                            icon: currentAngelType.id === item.id ? SELECTED_ICON : null
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
        const handleListPress = (boardAngel) => {
            // 请求保存岩板角度设置
            http(`userPrefer/update`, POST, {
                body: {
                    id: currentBoardType.upID,
                    boardId: currentBoardType.id,
                    angelId: boardAngel.id,
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
                        updateBoardSettingAngel({
                            id: boardAngel.id,
                            name: boardAngel.name
                        });
                        // 刷新显示
                        setBoardAngelList([...boardAngelList].map((item) => {
                            return {
                                ...item,
                                icon: boardAngel.id === item.id ? SELECTED_ICON : null
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
                    data={boardAngelList}
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
    { updateBoardSettingAngel }
)(BoardAngelSettingScreen);