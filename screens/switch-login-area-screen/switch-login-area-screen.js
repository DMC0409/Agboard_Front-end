import React, { useState, useEffect } from "react";
import { View, FlatList, } from 'react-native';
import { styles } from "./switch-login-area-screen.style";
import { CustomOptionList, CustomOptionSeparator } from "../../components/custom-option-list/custom-option-list";
import { connect } from "react-redux";
import { getUserInfo, getLoginArea } from "../../redux/selectors";
import { switchLoginArea } from "../../redux/actions";

// 视图主组件
const SwitchLoginAreaScreen = ({ navigation, userID, loginArea, switchLoginArea }) => {
    // 当前选中显示的icon
    const SELECTED_ICON = require('../../static/img/common-icons/select.png');

    // 地区列表
    const [areaList, setAreaList] = useState([
        { id: 0, key: '0', name: '中国', icon: null },
        { id: 1, key: '1', name: '其他地区', icon: null },
    ]);

    // 组件初始化
    useEffect(() => {
    }, []);

    // 路由参数
    useEffect(() => {
        areaList.forEach((item) => {
            item.icon = null;
            if (item.id === loginArea) {
                item.icon = SELECTED_ICON;
            }
        });
        setAreaList([...areaList]);
    }, [loginArea]);

    // 列表视图
    const ListRenderItem = ({ item }) => {
        // 列表项点击处理
        const handleListPress = (area) => {
            areaList.forEach((temp) => {
                temp.icon = null;
                if (temp.id === area.id) {
                    temp.icon = SELECTED_ICON;
                }
            });
            switchLoginArea(area.id);
            // 跳回登录页
            navigation.reset({
                index: 0,
                routes: [
                    { name: 'LoginScreen' }
                ],
            });
        }

        return <CustomOptionList listItem={item} hideArrow={true} onPress={() => handleListPress(item)} />;
    };

    // 返回react组件
    return (
        <View style={styles.box}>
            {/* 选项列表 */}
            <View style={styles.listGroup}>
                <FlatList
                    data={areaList}
                    renderItem={ListRenderItem}
                    keyExtractor={item => item.key}
                    ItemSeparatorComponent={CustomOptionSeparator}
                />
            </View>
        </View>
    );
}

const mapStateToProps = state => {
    return {
        userID: getUserInfo(state).userID,
        loginArea: getLoginArea(state),
    };
};

export default connect(
    mapStateToProps,
    { switchLoginArea }
)(SwitchLoginAreaScreen);