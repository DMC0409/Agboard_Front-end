// 设置视图
import React, { useState, useEffect } from "react";
import { View, FlatList, TouchableOpacity, Image, useWindowDimensions, Text } from 'react-native';
import { CustomUserList, CustomUserSeparator } from "../../components/custom-user-list/custom-user-list";
import { CustomOptionList, CustomOptionSeparator } from "../../components/custom-option-list/custom-option-list";
import { CustomButton } from "../../components/custom-button/custom-button";
import { styles } from "./user-fans-list-screen.style";
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
import { Divider, Avatar, Button, Appbar } from 'react-native-paper';
import { CustomFanOrFollowedList } from '../../components/custom-fan-or-followed-list/custom-fan-or-followed-list'

// 视图主组件
const UserFansListScreen = ({ route, navigation, userToken, myUserID }) => {
    // 屏幕尺寸
    let screenWidth = useWindowDimensions().width;
    let screenHeight = useWindowDimensions().height;

    // 路由参数
    const userID = route.params.userID || '';
    const userName = route.params.userName || '';

    // 是否正在刷新
    const [refreshing1, setRefreshing1] = useState(false);
    // 当前页数
    const [pageIndex1, setPageIndex1] = useState(0);
    // 用户列表
    const [userList, setUserList] = useState([]);

    // 初始化
    useEffect(() => {
        if (userID) {
            getUserList();
        }
    }, [route.params]);

    // 获取用户粉丝列表
    const getUserList = (pageIndex = 0) => {
        setRefreshing1(true);
        http(`following/fans?userID=${userID}&index=${pageIndex + 1}&pageSize=${20}`, GET, {})
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
                        const listData = res.data.map(item => {
                            return item;
                        })
                        setUserList([...userList, ...listData]);
                    } else {
                        setPageIndex1(pageIndex - 1);
                    }
                } else {
                    // 刷新数据
                    setPageIndex1(0);
                    if (!res.data) {
                        res.data = [];
                    }
                    const listData = res.data.map(item => {
                        return item;
                    })
                    setUserList(listData);
                }
            })
            .catch((error) => {
                console.error(error);
                toastMessage(`请求失败`);
            })
            .finally(() => {
                setRefreshing1(false);
            })
    }

    // 获取下一页列表
    const getMoreLines1 = () => {
        // 借助 state 属性 refreshing 判断当前是否正在请求中
        if (refreshing1) {
            // 暂缓调用
            return;
        } else {
            setPageIndex1(pageIndex1 + 1);
            getUserList(pageIndex1 + 1);
        }
    }

    // 跳转至个人对外展示页面
    const gotoPresentationPage = (userID) => {
        navigation.push('UserPresentationScreen', {
            userID: userID
        })
    }

    // 关注/取消关注
    const followAction = (isFollow, targetUserID) => {
        if (isFollow === true) {
            http(`following/follow/user`, POST, {
                body: {
                    userID: Number(targetUserID),
                    followerID: Number(userID)
                }
            })
                .then((res) => {
                    // errorCode
                    if (res.errCode) {
                        console.error('response error code: ', res.errCode);
                        toastMessage(`关注失败`);
                        return;
                    }
                    // response处理
                    const temp = userList.find((item) => item.userID === targetUserID);
                    temp.isFollowed = 1;
                    setUserList([...userList]);
                })
                .catch((error) => {
                    console.error(error);
                    toastMessage(`请求失败`);
                })
        } else {
            http(`following/unfollow/user`, 'DELETE', {
                body: {
                    userID: Number(targetUserID),
                    followerID: Number(userID)
                }
            })
                .then((res) => {
                    // errorCode
                    if (res.errCode) {
                        console.error('response error code: ', res.errCode);
                        toastMessage(`取关失败`);
                        return;
                    }
                    // response处理
                    const temp = userList.find((item) => item.userID === targetUserID);
                    temp.isFollowed = 0;
                    setUserList([...userList]);
                })
                .catch((error) => {
                    console.error(error);
                    toastMessage(`请求失败`);
                })
        }
    }

    // 列表项
    const renderItem = ({ item }) => (
        <CustomFanOrFollowedList
            item={item}
            userToken={userToken}
            myUserID={myUserID}
            gotoPresentationPage={gotoPresentationPage}
            followAction={followAction}
        ></CustomFanOrFollowedList>
    );

    // 返回react组件
    return (
        <View style={styles.box}>
            <Appbar.Header mode="center-aligned" style={{ backgroundColor: '#fff' }}>
                <Appbar.BackAction onPress={() => { navigation.goBack() }} size={26} color={'#000'} />
                <Appbar.Content title={userName + "的粉丝"} color={'#000'} titleStyle={{ fontSize: 18 }} />
            </Appbar.Header>
            <View style={{ flex: 1, marginTop: 5 }}>
                {(!userList || userList.length === 0) ?
                    <View style={{ ...styles.noHaveTreads, height: screenHeight - 150 }}>
                        <Text style={styles.noHaveTreadsText}>
                            暂无数据
                        </Text>
                    </View>
                    :
                    <FlatList
                        data={userList}
                        renderItem={renderItem}
                        keyExtractor={item => item.userID}
                        onRefresh={getUserList}
                        refreshing={refreshing1}
                        onEndReached={getMoreLines1}
                        onEndReachedThreshold={0.25}
                    />
                }
            </View>
        </View>
    );
}

const mapStateToProps = state => {
    return {
        mainNavigation: getMainNavigation(state),
        userToken: getUserToken(state),
        myUserID: getUserInfo(state).userID
    };
};


export default connect(
    mapStateToProps,
    {}
)(UserFansListScreen);


