// 设置视图
import React, { useState, useEffect } from "react";
import { View, FlatList, ScrollView, Image, useWindowDimensions, Text } from 'react-native';
import { CustomNotificationList, CustomNotificationSeparator } from "../../components/custom-notification-list/custom-notification-list";
import { CustomOptionList, CustomOptionSeparator } from "../../components/custom-option-list/custom-option-list";
import { CustomButton } from "../../components/custom-button/custom-button";
import { styles } from "./message-detail-screen.style";
import { romoveUserToken, romoveUserInfo } from "../../common/user";
import { resetUserData } from "../../redux/actions";
import { connect } from "react-redux";
import { getMainNavigation, getUserToken, getUserInfo } from "../../redux/selectors";
import { SETTING_LIST_COMMON, SETTING_LIST_BUSINESS } from "../../config/mine";
import { http, GET, POST } from "../../common/http";
import { toastMessage } from "../../common/global";
import { SearchBar, Overlay, CheckBox } from 'react-native-elements';
import { AVATAR_IMG_URL } from "../../config/http";
import { DEFAULT_AVATER } from "../../config/mine";

// 视图主组件
const MessageDetailScreen = ({ route, navigation, userToken, userID }) => {
    // 屏幕尺寸
    let screenWidth = useWindowDimensions().width;
    let screenHeight = useWindowDimensions().height;

    // 数据
    const [info, setInfo] = useState({});

    // 将路由参数赋值到 state
    useEffect(() => {
        setInfo(route.params.info);
    }, [route.params]);

    // 返回react组件
    return (
        <View style={styles.box}>
            <ScrollView style={{flex: 1}}>
                <Text style={{ fontSize: 24 }}>
                    {info.title}
                </Text>
                <Text style={{ color: '#9a9a9a', paddingVertical: 15, paddingTop: 5, paddingLeft: 2 }}>
                    发布时间：{info.createTime}
                </Text>
                <Text style={{ fontSize: 17, paddingHorizontal: 3 }}>
                    {info.content}
                </Text>
            </ScrollView>
        </View>
    );
}

const mapStateToProps = state => {
    return {
        mainNavigation: getMainNavigation(state),
        userToken: getUserToken(state),
        userID: getUserInfo(state).userID,
    };
};


export default connect(
    mapStateToProps,
    {}
)(MessageDetailScreen);


