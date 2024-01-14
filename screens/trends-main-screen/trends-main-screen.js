// 设置视图
import React, { useState, useEffect } from "react";
import { View, Text, FlatList, Image, useWindowDimensions } from 'react-native';
import { styles } from "./trends-main-screen.style";
import { connect } from "react-redux";
import { getMainNavigation, getUserToken, getUserInfo, getBoardSettingType } from "../../redux/selectors";
import { http, GET, POST } from "../../common/http";
import { toastMessage } from "../../common/global";
import ScrollableTabView, { DefaultTabBar } from 'react-native-scrollable-tab-view';
import { TREADS_TYPE } from "../../config/treads";
import { CustomTerendsList } from "../../components/custom-trends-list/custom-trends-list";

// 视图主组件
const TrendsMainScreen = ({ navigation, userToken, userID, boardType }) => {
    // 屏幕尺寸
    let screenWidth = useWindowDimensions().width;
    let screenHeight = useWindowDimensions().height;

    // 当前页数-最新动态
    const [pageIndex, setPageIndex] = useState(0);
    // 是否正在刷新-最新动态
    const [refreshing, setRefreshing] = useState(false);
    // 当前页数-关注动态
    const [pageIndex1, setPageIndex1] = useState(0);
    // 是否正在刷新-关注动态
    const [refreshing1, setRefreshing1] = useState(false);
    // 动态列表
    const [treadsList, setTreadsList] = useState([]);
    const [followTreadsList, setFollowTreadsList] = useState([]);

    // 初始化
    useEffect(() => {
        getAllTreadsList();
        getMineTreadsList();
    }, []);

    // 当切换板子后重新获得数据
    useEffect(() => {
        getAllTreadsList();
        getMineTreadsList();
    }, [boardType]);

    // 获取最新动态列表和关注的人动态列表
    const getAllTreadsList = (pageIndex = 0) => {
        setRefreshing(true);
        // 1：查询指定userID的动态；2：查询指定userID关注的用户的动态；3：查询所有动态
        http(`dynamic/infos?myID=${userID}&userID=${userID}&type=${3}&index=${pageIndex + 1}&pageSize=${10}&boardID=${boardType.id}`, GET, {})
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
                        setPageIndex(pageIndex - 1);
                    }
                } else {
                    // 刷新数据
                    setPageIndex(0);
                    if (!res.data) {
                        res.data = [];
                    }
                    setTreadsList(res.data);
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

    // 获取关注的人动态列表
    const getMineTreadsList = (pageIndex = 0) => {
        setRefreshing1(true);
        // 1：查询指定userID的动态；2：查询指定userID关注的用户的动态；3：查询所有动态
        http(`dynamic/infos?myID=${userID}&userID=${userID}&type=${2}&index=${pageIndex + 1}&pageSize=${10}&boardID=${boardType.id}`, GET, {})
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
                        setFollowTreadsList([...followTreadsList, ...res.data]);
                    } else {
                        setPageIndex1(pageIndex - 1);
                    }
                } else {
                    // 刷新数据
                    setPageIndex1(0);
                    if (!res.data) {
                        res.data = [];
                    }
                    setFollowTreadsList(res.data);
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

    // 最新动态下拉到底部时，获取下一页列表
    const getMoreLines = () => {
        // 借助 state 属性 refreshing 判断当前是否正在请求中
        if (refreshing) {
            // 暂缓调用
            return;
        } else {
            setPageIndex(pageIndex + 1);
            getAllTreadsList(pageIndex + 1);
        }
    }

    // 关注动态下拉到底部时，获取下一页列表
    const getMoreLines1 = () => {
        // 借助 state 属性 refreshing 判断当前是否正在请求中
        if (refreshing1) {
            // 暂缓调用
            return;
        } else {
            setPageIndex1(pageIndex1 + 1);
            getMineTreadsList(pageIndex1 + 1);
        }
    }

    // 关注/取消关注
    const followAction = (isFollow, targetUserID, dynamicInfoID) => {
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
                    const temp = treadsList.filter((item) => item.createUserID === targetUserID);
                    const temp1 = followTreadsList.filter((item) => item.createUserID === targetUserID);
                    if (temp && temp.length !== 0) {
                        temp.forEach(item => {
                            item.isFollowed = 1;
                            item.fansNum = (item.fansNum || 0) + 1;
                        })
                    }
                    if (temp1 && temp1.length !== 0) {
                        temp1.forEach(item => {
                            item.isFollowed = 1;
                            item.fansNum = (item.fansNum || 0) + 1;
                        })
                    }
                    setTreadsList([...treadsList]);
                    setFollowTreadsList([...followTreadsList]);
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
                    const temp = treadsList.filter((item) => item.createUserID === targetUserID);
                    const temp1 = followTreadsList.filter((item) => item.createUserID === targetUserID);
                    if (temp && temp.length !== 0) {
                        temp.forEach(item => {
                            item.isFollowed = 0;
                            item.fansNum = (item.fansNum || 1) - 1;
                        })
                    }
                    if (temp1 && temp1.length !== 0) {
                        temp1.forEach(item => {
                            item.isFollowed = 0;
                            item.fansNum = (item.fansNum || 1) - 1;
                        })
                    }
                    setTreadsList([...treadsList]);
                    setFollowTreadsList([...followTreadsList]);
                })
                .catch((error) => {
                    console.error(error);
                    toastMessage(`请求失败`);
                })
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

    // 跳转至个人对外展示页面
    const gotoPresentationPage = (userID) => {
        navigation.push('UserPresentationScreen', {
            userID: userID
        })
    }

    // 列表项
    const renderItem = ({ item }) => (
        <CustomTerendsList
            item={item}
            userToken={userToken}
            myUserID={userID}
            gotoPresentationPage={gotoPresentationPage}
            followAction={followAction}
            gotoLinePage={gotoLinePage}
        ></CustomTerendsList>
    );

    // 返回react组件
    return (
        <View style={styles.box}>
            <ScrollableTabView
                initialPage={0}
                renderTabBar={() => <DefaultTabBar style={{ borderColor: '#c8c6cb', borderBottomWidth: 0, paddingRight: screenWidth - 170, height: 48 }} />}
                tabBarActiveTextColor='#22934f'
                tabBarInactiveTextColor='#808080'
                tabBarTextStyle={{ fontSize: 18, paddingTop: 10 }}
                tabBarUnderlineStyle={{ backgroundColor: '#22934f', height: 0 }}
                onChangeTab={(info) => { }}
                onScroll={(pos) => { }}
            >
                <View tabLabel='关注' style={styles.listBox}>
                    {(!followTreadsList || followTreadsList.length === 0) ?
                        <View style={{ ...styles.noHaveTreads, height: screenHeight - 150 }}>
                            <Text style={styles.noHaveTreadsText}>
                                暂时没有动态哦
                            </Text>
                        </View>
                        :
                        <FlatList
                            data={followTreadsList}
                            renderItem={renderItem}
                            keyExtractor={item => item.dynamicInfoID}
                            onRefresh={getMineTreadsList}
                            refreshing={refreshing1}
                            onEndReached={getMoreLines1}
                            onEndReachedThreshold={0.25}
                        />
                    }
                </View>
                <View tabLabel='最新' style={styles.listBox}>
                    {(!treadsList || treadsList.length === 0) ?
                        <View style={{ ...styles.noHaveTreads, height: screenHeight - 150 }}>
                            <Text style={styles.noHaveTreadsText}>
                                暂时没有动态哦
                            </Text>
                        </View>
                        :
                        <FlatList
                            data={treadsList}
                            renderItem={renderItem}
                            keyExtractor={item => item.dynamicInfoID}
                            onRefresh={getAllTreadsList}
                            refreshing={refreshing}
                            onEndReached={getMoreLines}
                            onEndReachedThreshold={0.25}
                        />
                    }
                </View>
            </ScrollableTabView>
        </View>
    );
}

const mapStateToProps = state => {
    return {
        mainNavigation: getMainNavigation(state),
        userToken: getUserToken(state),
        userID: getUserInfo(state).userID,
        boardType: getBoardSettingType(state),
    };
};


export default connect(
    mapStateToProps,
    {}
)(TrendsMainScreen);


