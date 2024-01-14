// 设置视图
import React, { useState, useEffect, useCallback } from "react";
import { View, ScrollView, Text, FlatList, Image, useWindowDimensions, ImageBackground, Linking, Alert } from 'react-native';
import { CustomUserList, CustomUserSeparator } from "../../components/custom-user-list/custom-user-list";
import { CustomOptionList, CustomOptionSeparator } from "../../components/custom-option-list/custom-option-list";
import { CustomButton } from "../../components/custom-button/custom-button";
import { styles } from "./user-presentation-screen.style";
import { romoveUserToken, romoveUserInfo } from "../../common/user";
import { resetUserData } from "../../redux/actions";
import { connect } from "react-redux";
import { getMainNavigation, getUserToken, getUserInfo, getBoardSettingType } from "../../redux/selectors";
import { SETTING_LIST_COMMON, SETTING_LIST_BUSINESS } from "../../config/mine";
import { http, GET, POST } from "../../common/http";
import { toastMessage } from "../../common/global";
import { SearchBar, Overlay, CheckBox } from 'react-native-elements';
import { AVATAR_IMG_URL, BACKGROUND_IMG_URL } from "../../config/http";
import { DEFAULT_AVATER } from "../../config/mine";

import { Divider, Avatar, Button, Appbar } from 'react-native-paper';
import ScrollableTabView, { DefaultTabBar } from 'react-native-scrollable-tab-view';
import { TouchableOpacity } from 'react-native-gesture-handler'
import { TREADS_TYPE } from "../../config/treads";
import { CustomTerendsList } from "../../components/custom-trends-list/custom-trends-list";
import _ from "lodash";

// 视图主组件
const UserPresentationScreen = ({ route, navigation, userToken, myUserID, boardType }) => {
    // 屏幕尺寸
    let screenWidth = useWindowDimensions().width;
    let screenHeight = useWindowDimensions().height;

    // 路由参数
    const userID = route.params.userID || '';

    // 我当前有没有关注这个用户
    const [isFollowed, setIsFollowed] = useState(false);
    // 是否正在刷新
    const [refreshing, setRefreshing] = useState(false);
    // 用户全部动态数据
    const [treadsList, setTreadsList] = useState([]);
    // 当前页数-全部动态
    const [pageIndex1, setPageIndex1] = useState(0);
    // 用户基本信息
    const [userBaseInfo, setUserBaseInfo] = useState({});
    // 用户其他信息
    const [userOtherInfo, setUserOtherInfo] = useState({});
    // 全部动态总数
    const [treadsCount, setTreadsCount] = useState(0);

    // 初始化
    useEffect(() => {
        if (userID) {
            getUserBaseInfo();
            getUserOtherInfo();
            getIsFollowed();
            getTreadsList(pageIndex1);
        }
    }, [route.params]);

    // 打开URI
    const openURI = async (url) => {
        // Checking if the link is supported for links with custom URL scheme.
        const supported = await Linking.canOpenURL(url);
        await Linking.openURL(url);
        return;
        if (supported) {
            // Opening the link with some app, if the URL scheme is "http" the web link should be opened
            // by some browser in the mobile
            await Linking.openURL(url);
        } else {
            Alert.alert(`该地址无效`);
        }
    }

    // 获取用户基本数据
    const getUserBaseInfo = () => {
        http(`user/info/${userID}`, GET)
            .then((res) => {
                // errorCode
                if (res.errCode) {
                    console.error('response error code: ', res.errCode);
                    toastMessage(`获取用户基本数据失败`);
                    return;
                }
                // response处理
                if (res.data) {
                    setUserBaseInfo(res.data || {});
                }
            })
            .catch((error) => {
                console.error(error);
                toastMessage(`请求失败`);
            })
    }

    // 获取用户其他数据
    const getUserOtherInfo = () => {
        http(`user/index?userID=${userID}`, GET, {})
            .then((res) => {
                // errorCode
                if (res.errCode) {
                    console.error('response error code: ', res.errCode);
                    toastMessage(`获取用户其它数据失败`);
                    return;
                }
                // response处理
                setUserOtherInfo(res.data || {});
            })
            .catch((error) => {
                console.error(error);
                toastMessage(`请求失败`);
            })
    }

    // 获取我是否对该用户关注
    const getIsFollowed = () => {
        http(`following/relation/check?followerID=${myUserID}&followedUserID=${userID}`, GET, {})
            .then((res) => {
                // errorCode
                if (res.errCode) {
                    console.error('response error code: ', res.errCode);
                    toastMessage(`请求失败`);
                    return;
                }
                // response处理
                setIsFollowed(res.data || false);
            })
            .catch((error) => {
                console.error(error);
                toastMessage(`请求失败`);
            })
    }

    // 获取用户全部动态数据
    const getTreadsList = (pageIndex = 0) => {
        setRefreshing(true);
        // 1：查询指定userID的动态；2：查询指定userID关注的用户的动态；3：查询所有动态
        http(`dynamic/infos?myID=${myUserID}&userID=${userID}&type=${1}&index=${pageIndex + 1}&pageSize=${10}&boardID=${boardType.id}`, GET, {})
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
                        setTreadsList([...treadsList, ...res.data]);
                    } else {
                        setPageIndex1(pageIndex - 1);
                    }
                } else {
                    // 刷新数据
                    setPageIndex1(0);
                    if (!res.data) {
                        res.data = [];
                    }
                    setTreadsList(res.data);
                }
                // 总数
                if (res.total || res.total === 0) {
                    setTreadsCount(res.total);
                }
            })
            .catch((error) => {
                console.error(error);
                toastMessage(`请求失败`);
            })
            .finally(() => {
                setRefreshing(false);
            })
    }

    // 关注/取消关注
    const followAction = (isFollow) => {
        if (!userID && !myUserID) {
            return;
        }
        const targetUserID = userID;
        if (isFollow === true) {
            http(`following/follow/user`, POST, {
                body: {
                    userID: Number(targetUserID),
                    followerID: Number(myUserID)
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
                    setIsFollowed(true);
                })
                .catch((error) => {
                    console.error(error);
                    toastMessage(`请求失败`);
                })
        } else {
            http(`following/unfollow/user`, 'DELETE', {
                body: {
                    userID: Number(targetUserID),
                    followerID: Number(myUserID)
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
                    setIsFollowed(false);
                })
                .catch((error) => {
                    console.error(error);
                    toastMessage(`请求失败`);
                })
        }
    }

    // 获取下一分页的数据要被调用的逻辑函数
    const fun = useCallback(
        _.debounce((pageIndex1) => {
            console.log('调用了分页数据接口', pageIndex1)
            setPageIndex1(pageIndex1 + 1);
            getTreadsList(pageIndex1 + 1);
        }, 1000, { leading: true, trailing: false }),
        [], // 只有当 count 发生变化时，才会重新创建回调函数
    );

    // 全部动态下拉到底部时，获取下一页列表
    const getMoreLines = (event) => {
        // console.log('屏幕高', event.nativeEvent.layoutMeasurement.height)
        // console.log('现在位置', event.nativeEvent.contentOffset.y)
        // console.log('滚动区域高', event.nativeEvent.contentSize.height)
        const range = event.nativeEvent.contentSize.height - event.nativeEvent.layoutMeasurement.height;
        const point = range - (0.20 * event.nativeEvent.layoutMeasurement.height);
        if (event.nativeEvent.contentOffset.y > point) {
            if (refreshing) {
                // 暂缓调用
                return;
            }
            fun(pageIndex1);
        }
    }

    // 跳转至线路页面
    const gotoLinePage = (lineContent) => {
        http(`line/line/detail/${lineContent.lineID}/${userID}`, GET, {})
            .then((res) => {
                // errorCode
                if (res.errCode) {
                    console.error('response error code: ', res.errCode);
                    toastMessage(`请求失败`);
                    return;
                }
                // response处理
                if (res.data) {
                    const SOURCE_SCREEN_NAME = 'ScreenContent'
                    navigation.navigate('LineLayoutScreen', {
                        lineInfo: res.data,
                        sourceScreenName: SOURCE_SCREEN_NAME,
                    })
                }
            })
            .catch((error) => {
                console.error(error);
                toastMessage(`请求失败`);
            })
    }

    // 列表项
    const renderItem = ({ item }) => (
        <CustomTerendsList
            isPresentation={true}
            item={item}
            userToken={userToken}
            myUserID={myUserID}
            gotoPresentationPage={() => { }}
            followAction={() => { }}
            gotoLinePage={gotoLinePage}
        ></CustomTerendsList>
    );

    // 返回react组件
    return (
        <ScrollView style={styles.box} onScroll={getMoreLines}>
            {userOtherInfo.background !== undefined ?
                userOtherInfo.background !== '' ?
                    <ImageBackground resizeMode='cover'
                        source={{
                            uri: `${BACKGROUND_IMG_URL}${userOtherInfo.background}`,
                            headers: { 'Authorization': userToken }
                        }}
                        style={{...styles.topBackgroud, opacity: 0.8,}}>
                    </ImageBackground>
                    :
                    <ImageBackground resizeMode='cover' source={require('../../static/img/header-back.png')} style={styles.topBackgroud}>
                    </ImageBackground>
                :
                <View style={{ ...styles.topBackgroud, backgroundColor: '#ffffff' }}></View>
            }
            <View style={styles.hearderBox}>
                <View style={styles.Avatar}>
                    {userBaseInfo.avatar ?
                        <Avatar.Image size={74} source={{
                            uri: `${AVATAR_IMG_URL}${userBaseInfo.avatar}`,
                            headers: { 'Authorization': userToken }
                        }} />
                        :
                        <Avatar.Image size={74} source={DEFAULT_AVATER} />
                    }
                </View>
                <View style={styles.lineBar}>
                    <TouchableOpacity extraButtonProps={{ rippleColor: '#fff' }} style={styles.lineEnterItem} onPress={() => { navigation.navigate('userFollowedListScreen', { userID: userID, userName: userBaseInfo.userName }) }}>
                        <Text style={styles.lineEnterCount}>{userOtherInfo.followingNum}</Text>
                        <Text style={styles.lineEnterText}>关注</Text>
                    </TouchableOpacity>
                    <View style={styles.splitLines}></View>
                    <TouchableOpacity extraButtonProps={{ rippleColor: '#fff' }} style={styles.lineEnterItem} onPress={() => { navigation.navigate('UserFansListScreen', { userID: userID, userName: userBaseInfo.userName }) }}>
                        <Text style={styles.lineEnterCount}>{userOtherInfo.fansNum}</Text>
                        <Text style={styles.lineEnterText}>粉丝</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.nameBox}>
                <View style={styles.nameBoxLeft}>
                    <Text numberOfLines={1} style={styles.nameText}>{userBaseInfo.userName || 'ALPHA WALL用户'}</Text>
                    {/* 大V认证： 1认证  2未认证 */}
                    {userBaseInfo.cert === 1 &&
                        <Image source={require('../../static/img/common-icons/V-idenity.png')} style={styles.nameIcon}></Image>
                    }
                    {/* <Image source={require('../../static/img/medal-iocns/level-pai.png')} style={styles.nameIcon}></Image> */}
                </View>
                <View style={styles.nameBoxRight}>
                    {myUserID == userID ? <></> : isFollowed === false ?
                        <Button mode="contained" buttonColor="#22934f" textColor="#fff"
                            contentStyle={styles.followBtn}
                            labelStyle={styles.followBtnLabel}
                            onPress={() => followAction(true)}>
                            关注
                        </Button>
                        :
                        <Button mode="outlined" textColor="#22934f"
                            contentStyle={styles.followBtn}
                            labelStyle={styles.followBtnLabel}
                            style={{ borderColor: "#22934f" }}
                            onPress={() => followAction(false)}>
                            取关
                        </Button>
                    }
                </View>
            </View>
            <View style={styles.briefBox}>
                <Text numberOfLines={4} style={styles.brieText}>{userOtherInfo.signature || 'ta 暂未设置个人签名哦……'}</Text>
            </View>
            <View style={{ ...styles.outerLinkBox }}>
                {(userOtherInfo.links && userOtherInfo.links.length !== 0) &&
                    <View style={{ flexDirection: 'column' }}>
                        {userOtherInfo.links.map(item => <View style={{ flexDirection: 'row', marginVertical: 3 }}>
                            <Text style={styles.outerLinkText}>{item.app}：</Text>
                            <TouchableOpacity extraButtonProps={{ rippleColor: '#fff' }} onPress={() => openURI(item.url)}>
                                <Text numberOfLines={1} style={styles.outerLinkedText}>{item.nickName}</Text>
                            </TouchableOpacity>
                        </View>)
                        }
                    </View>
                }
            </View>
            <View style={{ height: 10, backgroundColor: '#f2f2f2', marginTop: 10, marginBottom: 5 }}></View>
            <View style={{ ...styles.recordBox }}>
                <Text style={{ marginBottom: -5, fontSize: 15, paddingHorizontal: 23, fontWeight: 'bold' }}>全部动态（{treadsCount}）</Text>
                <FlatList
                    data={treadsList}
                    renderItem={renderItem}
                    keyExtractor={item => item.dynamicInfoID}
                    onRefresh={getTreadsList}
                    refreshing={refreshing}
                />
                {/* <ScrollableTabView
                    initialPage={0}
                    renderTabBar={() => <DefaultTabBar style={{ borderColor: '#c8c6cb', borderBottomWidth: 0, paddingRight: screenWidth - 135, height: 37 }} />}
                    tabBarActiveTextColor='#000'
                    tabBarInactiveTextColor='#808080'
                    tabBarTextStyle={{ fontSize: 14, paddingTop: 10 }}
                    tabBarUnderlineStyle={{ backgroundColor: '#22934f', height: 0 }}
                    onChangeTab={(info) => { console.log(info) }}
                    onScroll={(pos) => { }}
                >
                    <View tabLabel='全部动态（19）' style={styles.listBox}>
                        <FlatList
                            data={treadsList}
                            renderItem={renderItem}
                            keyExtractor={item => item.recordID}
                            onRefresh={getTreadsList}
                            refreshing={refreshing}
                        />
                    </View>
                </ScrollableTabView> */}
            </View>
        </ScrollView>
    );
}

const mapStateToProps = state => {
    return {
        mainNavigation: getMainNavigation(state),
        userToken: getUserToken(state),
        myUserID: getUserInfo(state).userID,
        boardType: getBoardSettingType(state),
    };
};


export default connect(
    mapStateToProps,
    {}
)(UserPresentationScreen);


