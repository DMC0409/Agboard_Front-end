// 设置视图
import React, { useState, useEffect } from "react";
import { View, FlatList, TouchableOpacity, Image, useWindowDimensions, Text } from 'react-native';
import { CustomNotificationList, CustomNotificationSeparator } from "../../components/custom-notification-list/custom-notification-list";
import { CustomOptionList, CustomOptionSeparator } from "../../components/custom-option-list/custom-option-list";
import { CustomButton } from "../../components/custom-button/custom-button";
import { styles } from "./message-notification-screen.style";
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
const MessageNotificationScreen = ({ route, navigation, userToken, userID }) => {
    // 屏幕尺寸
    let screenWidth = useWindowDimensions().width;
    let screenHeight = useWindowDimensions().height;

    // 用户列表
    const [dataList, setDataList] = useState([]);
    // 当前页数
    const [pageIndex, setPageIndex] = useState(0);
    // 在等待加载新数据时将此属性设为 true，列表就会显示出一个正在加载的符号
    const [refreshing, setRefreshing] = useState(false);
    // 当前是否是创建模式
    const [isCreat, setIsCreat] = useState(null);

    // 当页面聚焦时，重新获取数据
    useEffect(() => {
        // 当页面参数都填充好时绑定 focus 监听函数
        const unsubscribe = navigation.addListener('focus', () => {
            if (isCreat !== null) {
                getNoticeList(0);
            }
        });
        return () => {
            unsubscribe();
        };
    }, [navigation, isCreat]);

    // 将路由参数赋值到 state
    useEffect(() => {
        setIsCreat(route.params.isCreat);
    }, [route.params]);

    useEffect(() => {
        if (isCreat !== null) {
            getNoticeList(pageIndex);
        }
    }, [isCreat]);

    // 获取我发布的通知列表
    const getNoticeList = (pageIndex = 0) => {
        http(`message/${isCreat === true ? 'patch' : 'user/' + userID}/${pageIndex}/10`, GET, {})
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

    // 已读所有消息
    const readMessage = (item) => {
        if (!item.readTime) {
            http(`message/read`, POST, {
                body: {
                    userID: userID,
                    messageID: item.id
                }
            })
                .then((res) => {
                    // errorCode
                    if (res.errCode) {
                        console.error('response error code: ', res.errCode);
                        // toastMessage(`请求失败`);
                        return;
                    }
                })
                .catch((error) => {
                    console.error(error);
                    // toastMessage(`请求失败`);
                })
        }
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
            navigation.navigate('MessageDetailScreen', {
                info: info
            })
        }
        return <View style={{ paddingHorizontal: 10 }}>
            <CustomNotificationList listItem={item} onPress={() => handleListPress(item)} />
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
            {/* 新增按钮 */}
            {isCreat === true &&
                <TouchableOpacity
                    onPress={() => { navigation.navigate('AddMessageNotificationScreen') }}
                    style={{ position: 'absolute', bottom: 20, right: 20, backgroundColor: '#e6e6e6', borderRadius: 50, height: 50, width: 50, alignItems: 'center', justifyContent: 'center' }}
                >
                    <Image source={require('../../static/img/common-icons/add.png')} style={{ height: 35, width: 35 }}></Image>
                </TouchableOpacity>
            }
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
)(MessageNotificationScreen);


