// 设置视图
import React, { useState, useEffect } from "react";
import { View, FlatList } from 'react-native';
import { styles } from "./admin-feature-screen.styles";
import { resetUserData } from "../../redux/actions";
import { connect } from "react-redux";
import { getMainNavigation, getUserInfo } from "../../redux/selectors";
import { MINE_ADMIN_LIST } from "../../config/mine";
import { CustomOptionList, CustomOptionSeparator } from "../../components/custom-option-list/custom-option-list";

// 视图主组件
const AdminFeatureScreen = ({ navigation, resetUserData, mainNavigation, userID }) => {

    const mineListRenderItem = ({ item }) => {
        // 列表项点击处理
        const handleListPress = (id) => {
            switch (id) {
                // 草稿箱
                case '1':
                    navigation.navigate('DraftBoxScreen');
                    break;
                // 排行榜
                case '2':
                    navigation.navigate('RankingScreen');
                    break;
                // 设置
                case '3':
                    navigation.navigate('SettingScreen');
                    break;
                // 课程管理
                case '4':
                    navigation.navigate('CourseManagementScreen');
                    break;
                // 岩灯测试
                case '5':
                    navigation.navigate('LED_TestScreen');
                    break;
                // 切换岩板（临时-管理员用）
                case '6':
                    navigation.navigate('TempBoardTypeSettingScreen');
                    break;
                // 岩点颜色测试
                case '7':
                    navigation.navigate('ColorPickScreen');
                    break;
                // 申请开通线路设计权限
                case '8':
                    navigation.navigate('Show_WX_AndEmailScreen');
                    break;
                // 用户管理
                case '9':
                    navigation.navigate('UserManagmentScreen');
                    break;
                // 课程管理
                case '10':
                    navigation.navigate('CourseManagementScreen');
                    break;
                // 使用说明
                case '11':
                    navigation.navigate('InstructionsScreen');
                    break;
                // 发布通知
                case '12':
                    navigation.navigate('MessageNotificationScreen', { isCreat: true });
                    break;
                // 线路反馈
                case '13':
                    navigation.navigate('LineFeedbackListScreen');
                    break;
                default:
                    break;
            }
        }

        return <CustomOptionList listItem={item} onPress={() => handleListPress(item.id)} />;
    };

    // 返回react组件
    return (
        <View style={styles.box}>
            <View style={styles.listPart}>
                <FlatList
                    data={[...MINE_ADMIN_LIST]}
                    renderItem={mineListRenderItem}
                    keyExtractor={item => item.id}
                    ItemSeparatorComponent={CustomOptionSeparator}
                />
            </View>
        </View>
    );
}

const mapStateToProps = state => {
    return {
        mainNavigation: getMainNavigation(state),
        userID: getUserInfo(state).userID,
    };
};


export default connect(
    mapStateToProps,
    { resetUserData }
)(AdminFeatureScreen); 