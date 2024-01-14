// 设置视图
import React, { useState, useEffect } from "react";
import { View, FlatList, TouchableOpacity, Image, useWindowDimensions, Text } from 'react-native';
import { CustomFeedbackList, CustomNotificationSeparator } from "../../components/custom-feedback-list/custom-feedback-list";
import { CustomOptionList, CustomOptionSeparator } from "../../components/custom-option-list/custom-option-list";
import { CustomButton } from "../../components/custom-button/custom-button";
import { styles } from "./line-feedback-list-screen.style";
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
const LineFeedbackListScreen = ({ route, navigation, userToken, userID }) => {
    // 屏幕尺寸
    let screenWidth = useWindowDimensions().width;
    let screenHeight = useWindowDimensions().height;

    // 用户列表
    const [dataList, setDataList] = useState([]);
    // 当前页数
    const [pageIndex, setPageIndex] = useState(0);
    // 在等待加载新数据时将此属性设为 true，列表就会显示出一个正在加载的符号
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        getNoticeList();
    }, []);

    // 获取我发布的通知列表
    const getNoticeList = (pageIndex = 0) => {
        http(`line/report/list/${pageIndex}/10`, POST, {
            body: {
                offset: pageIndex,
                length: 10
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
                if (pageIndex !== 0) {
                    // 追加数据
                    if (res.data) {
                        setDataList([...dataList, ...res.data]);
                    } else {
                        setPageIndex(pageIndex - 1);
                    }
                } else {
                    // 刷新数据
                    setPageIndex(0);
                    if (!res.data) {
                        res.data = [];
                    }
                    setDataList(res.data);
                }
            })
            .catch((error) => {
                console.error(error);
                toastMessage(`请求失败`);
            })
    }

    // 已读单个反馈
    const readMessage = (info) => {
        http(`line/report/read/${info.id}`, GET)
            .then((res) => {
                // errorCode
                if (res.errCode) {
                    console.error('response error code: ', res.errCode);
                    // toastMessage(`请求失败`);
                    return;
                }
                info.status = 2;
                setDataList([...dataList]);
            })
            .catch((error) => {
                console.error(error);
                // toastMessage(`请求失败`);
            })
    }

    // 下拉到底部时，获取下一页列表
    const getMoreLines = () => {
        // 借助 state 属性 refreshing 判断当前是否正在请求中
        if (refreshing) {
            // 暂缓调用
            return;
        } else {
            setPageIndex(pageIndex + 1);
            getNoticeList(pageIndex + 1);
        }
    }

    // 列表视图
    const ListRenderItem = ({ item }) => {
        // 列表项点击处理
        const handleListPress = (info) => {
            readMessage(info);
            info.lineId = info.lineID;
            navigation.navigate('FeedbackLineLayoutScreen', {
                lineInfo: info,
            })
        }
        return <View style={{ paddingHorizontal: 10 }}>
            <CustomFeedbackList listItem={item} onPress={() => handleListPress(item)} userToken={userToken} />
        </View>

    };

    // 返回react组件
    return (
        <View style={styles.box}>
            {/* 选项列表 */}
            <View style={styles.listGroup}>
                <FlatList
                    contentContainerStyle={{ paddingVertical: 10 }}
                    data={dataList}
                    renderItem={ListRenderItem}
                    keyExtractor={item => item.id}
                    ItemSeparatorComponent={CustomNotificationSeparator}
                    onRefresh={getNoticeList}
                    refreshing={refreshing}
                    onEndReached={getMoreLines}
                    onEndReachedThreshold={0.25}
                />
            </View>
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
)(LineFeedbackListScreen);


