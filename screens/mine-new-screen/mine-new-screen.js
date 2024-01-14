// 设置视图
import React, { useState, useEffect, useRef, useCallback } from "react";
import { View, Text, FlatList, ScrollView, Image, TouchableWithoutFeedback, useWindowDimensions, ImageBackground, Linking, Alert } from 'react-native';
import { styles } from "./mine-new-screen.style";
import { connect } from "react-redux";
import { getMainNavigation, getUserToken, getUserInfo, getBoardSettingType } from "../../redux/selectors";
import { http, GET, POST } from "../../common/http";
import { toastMessage } from "../../common/global";
import { AVATAR_IMG_URL, BACKGROUND_IMG_URL } from "../../config/http";
import { DEFAULT_AVATER } from "../../config/mine";
import { setUserPermission } from "../../redux/actions";
import { Divider, Avatar, Button, Appbar } from 'react-native-paper';
import ScrollableTabView, { DefaultTabBar } from 'react-native-scrollable-tab-view';
import { TouchableOpacity } from 'react-native-gesture-handler'
import Icon from 'react-native-vector-icons/Entypo';
import Icon1 from 'react-native-vector-icons/Ionicons';
import Icon2 from 'react-native-vector-icons/SimpleLineIcons';
import Icon3 from 'react-native-vector-icons/MaterialCommunityIcons';
import { USER_ROLE } from "../../config/login";
import { TREADS_TYPE } from "../../config/treads";
import { CustomTerendsList } from "../../components/custom-trends-list/custom-trends-list";
import _ from "lodash";
import { Badge } from 'react-native-elements';

// 视图主组件
const MineNewScreen = ({ navigation, userID, linePermission, userRole, boardType, coursePermission, userToken, setUserPermission }) => {
    // 屏幕尺寸
    let screenWidth = useWindowDimensions().width;
    let screenHeight = useWindowDimensions().height;
    // 每个功能项的长度
    const featureBlockWidth = ((screenWidth - 20) * 0.25);

    // 用户信息
    const [userInfo, setUserInfo] = useState({});
    // 用户其他信息
    const [userOtherInfo, setUserOtherInfo] = useState({});
    // 脱敏用户手机号
    const [userPhone, setUserPhone] = useState('');
    // 我设计的计数
    const [designCount, setDesignCount] = useState(0);
    // 我收藏的计数
    const [collectCount, setCollectCount] = useState(0);
    // 我完成的计数
    const [finishCount, setFinishCount] = useState(0);
    // 新通知的计数
    const [noticeCount, setNoticeCount] = useState(0);
    // 是否正在刷新
    const [refreshing, setRefreshing] = useState(false);
    // 当前页数-全部动态
    const [pageIndex1, setPageIndex1] = useState(0);
    // 全部动态列表
    const [treadsList, setTreadsList] = useState();
    // 可滑动框节点ref
    const scrollViewEl = useRef(null);
    // 全部动态总数
    const [treadsCount, setTreadsCount] = useState(0);

    // 初始化
    useEffect(() => {
        getUserInfo();
        getUserLineInfo();
        getNoticeCount();
        getUserOtherInfo();
        getTreadsList();
    }, []);

    // 当页面聚焦时，重新获取数据
    useEffect(() => {
        // 当页面参数都填充好时绑定 focus 监听函数
        const unsubscribe = navigation.addListener('focus', () => {
            getUserInfo();
            getUserLineInfo();
            getNoticeCount();
            getUserOtherInfo();
            getTreadsList();
        });
        return () => {
            unsubscribe();
        };
    }, [navigation, boardType]);

    // 获取用户信息
    const getUserInfo = () => {
        http(`user/info/${userID}`, GET)
            .then((res) => {
                // errorCode
                if (res.errCode) {
                    console.error('response error code: ', res.errCode);
                    toastMessage(`请求失败`);
                    return;
                }
                // response处理
                if (res.data) {
                    setUserInfo({ ...res.data });
                    // 脱敏用户手机号
                    const phoneArray = res.data.phone.toString().split('');
                    let phoneString = '';
                    phoneArray.forEach((item, index) => {
                        if ([3, 4, 5, 6].indexOf(index) !== -1) {
                            phoneString = phoneString + '*';
                        } else {
                            phoneString = phoneString + item;
                        }
                    })
                    setUserPhone(phoneString);
                    setUserPermission(res.data.linePermission, res.data.coursePermission);
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
                console.log(res.data);
                setUserOtherInfo(res.data || {});
            })
            .catch((error) => {
                console.error(error);
                toastMessage(`请求失败`);
            })
    }

    // 获取用户线路相关计数信息
    const getUserLineInfo = () => {
        http(`user/count/${userID}`, GET)
            .then((res) => {
                // errorCode
                if (res.errCode) {
                    console.error('response error code: ', res.errCode);
                    toastMessage(`请求失败`);
                    return;
                }
                // response处理
                if (res.data) {
                    setDesignCount(res.data.designCount);
                    setCollectCount(res.data.collectCount);
                    setFinishCount(res.data.completeCount);
                }
            })
            .catch((error) => {
                console.error(error);
                toastMessage(`请求失败`);
            })
    }

    // 获取新通知计数信息
    const getNoticeCount = () => {
        http(`message/unread/${userID}`, GET)
            .then((res) => {
                // errorCode
                if (res.errCode) {
                    console.error('response error code: ', res.errCode);
                    toastMessage(`请求失败`);
                    return;
                }
                // response处理
                if (res.data || res.data === 0) {
                    setNoticeCount(res.data);
                }
            })
            .catch((error) => {
                console.error(error);
                toastMessage(`请求失败`);
            })
    }

    // 获取动态列表
    const getTreadsList = (pageIndex = 0) => {
        setRefreshing(true);
        // 1：查询指定userID的动态；2：查询指定userID关注的用户的动态；3：查询所有动态
        http(`dynamic/infos?myID=${userID}&userID=${userID}&type=${1}&index=${pageIndex + 1}&pageSize=${10}&boardID=${boardType.id}`, GET, {})
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

    // 打开URI链接
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

    // 列表项
    const renderItem = ({ item }) => (
        <CustomTerendsList
            isPresentation={true}
            item={item}
            userToken={userToken}
            myUserID={userID}
            gotoPresentationPage={() => { }}
            followAction={() => { }}
            gotoLinePage={gotoLinePage}
        ></CustomTerendsList>
    );

    // 头像栏点击处理
    const handlerHeaderPress = () => {
        if (userInfo && userInfo !== {}) {
            navigation.navigate('PersonalInfoScreen', {
                userInfo: userInfo,
            })
        }
    }

    // 回到顶部
    const backToTop = () => {
        scrollViewEl.current.scrollTo({ x: 0, y: 0, animated: true });
    }

    // 返回react组件
    return (
        <ScrollView ref={scrollViewEl} style={styles.box} onScroll={getMoreLines}>
            <View style={{ position: 'absolute', width: "100%", zIndex: 1, backgroundColor: 'rgba(52, 52, 52, 0)', flexDirection: 'row', justifyContent: 'space-between' }}>
                <TouchableWithoutFeedback style={{ width: screenWidth - 50 }} onPress={() => { handlerHeaderPress() }}>
                    <View style={{ width: screenWidth - 50 }}></View>
                </TouchableWithoutFeedback>
                <TouchableOpacity style={{height: 50, width: 50, alignItems: 'center', justifyContent: 'center', borderRadius: 50 }} extraButtonProps={{ rippleColor: '#FF990000' }}
                    onPress={() => { navigation.navigate('MessageNotificationScreen', { isCreat: false }) }}
                >
                    <Icon3 name="bell" size={28} color="#FF9900" />
                    {!!noticeCount &&
                        <Badge
                            value={noticeCount}
                            containerStyle={{ position: 'absolute', top: 5, right: 5 }}
                            status="error"
                            badgeStyle={{ borderWidth: 0 }}
                        />
                    }
                </TouchableOpacity>
            </View>
            <TouchableWithoutFeedback style={{ height: 105 }} onPress={() => { handlerHeaderPress() }}>
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
            </TouchableWithoutFeedback>
            <View style={styles.hearderBox}>
                <View style={styles.Avatar}>
                    <TouchableOpacity extraButtonProps={{ rippleColor: '#fff' }} onPress={() => { handlerHeaderPress() }}>
                        {userInfo.avatar ?
                            <Avatar.Image size={74} source={{
                                uri: `${AVATAR_IMG_URL}${userInfo.avatar}`,
                                headers: { 'Authorization': userToken }
                            }} />
                            :
                            <Avatar.Image size={74} source={DEFAULT_AVATER} />
                        }
                    </TouchableOpacity>
                </View>
                <View style={styles.lineBar}>
                    <TouchableOpacity extraButtonProps={{ rippleColor: '#fff' }} style={styles.lineEnterItem1} onPress={() => { navigation.navigate('userFollowedListScreen', { userID: userID, userName: userInfo.userName }) }}>
                        <Text style={styles.lineEnterCount}>{userOtherInfo.followingNum}</Text>
                        <Text style={styles.lineEnterText}>关注</Text>
                    </TouchableOpacity>
                    <View style={styles.splitLines}></View>
                    <TouchableOpacity extraButtonProps={{ rippleColor: '#fff' }} style={styles.lineEnterItem1} onPress={() => { navigation.navigate('UserFansListScreen', { userID: userID, userName: userInfo.userName }) }}>
                        <Text style={styles.lineEnterCount}>{userOtherInfo.fansNum}</Text>
                        <Text style={styles.lineEnterText}>粉丝</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.nameBox}>
                <View style={styles.nameBoxLeft}>
                    <TouchableOpacity extraButtonProps={{ rippleColor: '#fff' }} onPress={() => { handlerHeaderPress() }}>
                        <Text numberOfLines={1} style={styles.nameText}>{userInfo.userName || 'ALPHA WALL用户'}</Text>
                    </TouchableOpacity>
                    {/* 大V认证： 1认证  2未认证 */}
                    {userInfo.cert === 1 &&
                        <Image source={require('../../static/img/common-icons/V-idenity.png')} style={styles.nameIcon}></Image>}
                </View>
                <View style={styles.nameBoxRight}>
                </View>
            </View>
            <View style={styles.briefBox}>
                <TouchableOpacity extraButtonProps={{ rippleColor: '#fff' }} onPress={() => { handlerHeaderPress() }}>
                    <Text numberOfLines={4} style={styles.brieText}>{userOtherInfo.signature || 'ta 暂未设置个人签名哦……'}</Text>
                </TouchableOpacity>
                {/* <Button style={{ opacity: 0.7, height: 22 }} textColor="#22934f" icon="pencil" mode="text" onPress={() => console.log('Pressed')}></Button> */}
            </View>
            <View style={styles.cardOuterBox}>
                <View style={styles.outerLinkBox}>
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
            </View>
            <View style={styles.cardOuterOuterBox}>
                <View style={styles.cardOuterBox}>
                    <View style={styles.cardBox}>
                        <View style={{ ...styles.lineBar1 }}>
                            <TouchableOpacity style={{ ...styles.lineEnterItem, width: featureBlockWidth }} extraButtonProps={{ rippleColor: '#fff' }}
                                onPress={() => { navigation.navigate('FavoritesScreen') }}
                            >
                                <Icon name="heart-outlined" size={26} color="#FF6666" />
                                {!!collectCount &&
                                    <Badge
                                        value={collectCount}
                                        containerStyle={{ position: 'absolute', top: 0, right: screenWidth * 0.03 + (String(collectCount).length < 3 ? (3 - String(collectCount).length) * 5 : 0) }}
                                        badgeStyle={{ backgroundColor: '#FF6666' }}

                                    />
                                }
                                <Text style={{ ...styles.lineEnterText1 }}>收藏夹</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ ...styles.lineEnterItem, width: featureBlockWidth }} extraButtonProps={{ rippleColor: '#fff' }}
                                onPress={() => { navigation.navigate('CompleteRecordScreen') }}
                            >
                                <Icon1 name="reader-outline" size={26} color="#FF9900" />
                                {!!finishCount &&
                                    <Badge
                                        value={finishCount}
                                        containerStyle={{ position: 'absolute', top: 0, right: screenWidth * 0.03 + (String(collectCount).length < 3 ? (3 - String(finishCount).length) * 5 : 0) }}
                                        badgeStyle={{ backgroundColor: '#FF9900' }}
                                    />
                                }
                                <Text style={{ ...styles.lineEnterText1 }}>完成记录</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ ...styles.lineEnterItem, width: featureBlockWidth }} extraButtonProps={{ rippleColor: '#fff' }}
                                onPress={() => { navigation.navigate('MyDesignLinesScreen') }}
                            >
                                <Icon2 name="pencil" size={24} color="#99CC33" />
                                {!!designCount &&
                                    <Badge
                                        value={designCount}
                                        containerStyle={{ position: 'absolute', top: 0, right: screenWidth * 0.03 - 4 + (String(collectCount).length < 3 ? (3 - String(designCount).length) * 5 : 0) }}
                                        badgeStyle={{ backgroundColor: '#99CC33' }}
                                    />
                                }
                                <Text style={{ ...styles.lineEnterText1 }}>我设计的</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ ...styles.lineEnterItem, width: featureBlockWidth }} extraButtonProps={{ rippleColor: '#fff' }}
                                onPress={() => { navigation.navigate('SettingScreen') }}
                            >
                                <Icon1 name="md-settings-outline" size={26} color="#6699CC" />
                                <Text style={{ ...styles.lineEnterText1 }}>设置</Text>
                            </TouchableOpacity>
                            {linePermission !== 2 &&
                                <TouchableOpacity style={{ ...styles.lineEnterItem, width: featureBlockWidth }} extraButtonProps={{ rippleColor: '#fff' }}
                                    onPress={() => { navigation.navigate('DraftBoxScreen') }}
                                >
                                    <Icon1 name="create-outline" size={28} color="#0099CC" />
                                    <Text style={{ ...styles.lineEnterText1 }}>草稿箱</Text>
                                </TouchableOpacity>
                            }
                            <TouchableOpacity style={{ ...styles.lineEnterItem, width: featureBlockWidth }} extraButtonProps={{ rippleColor: '#fff' }}
                                onPress={() => { navigation.navigate('RankingScreen') }}
                            >
                                <Icon1 name="trophy-outline" size={26} color="#f2cc51" />
                                <Text style={{ ...styles.lineEnterText1 }}>排行榜</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ ...styles.lineEnterItem, width: featureBlockWidth }} extraButtonProps={{ rippleColor: '#fff' }}
                                onPress={() => { navigation.navigate('Show_WX_AndEmailScreen') }}
                            >
                                <Icon1 name="lock-open-outline" size={26} color="#663399" />
                                <Text style={{ ...styles.lineEnterText1 }}>设计权限</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={{ ...styles.lineEnterItem, width: featureBlockWidth }} extraButtonProps={{ rippleColor: '#fff' }}
                                onPress={() => { navigation.navigate('InstructionsScreen') }}
                            >
                                <Icon1 name="book-outline" size={26} color="#62a079" />
                                <Text style={{ ...styles.lineEnterText1 }}>使用说明</Text>
                            </TouchableOpacity>
                            {userRole !== USER_ROLE.ADMIN && coursePermission === 1 &&
                                <TouchableOpacity style={{ ...styles.lineEnterItem, width: featureBlockWidth }} extraButtonProps={{ rippleColor: '#fff' }}
                                    onPress={() => { navigation.navigate('CourseManagementScreen') }}
                                >
                                    <Icon1 name="school-outline" size={26} color="#003399" />
                                    <Text style={{ ...styles.lineEnterText1 }}>课程管理</Text>
                                </TouchableOpacity>
                            }
                            {userRole === USER_ROLE.ADMIN &&
                                <TouchableOpacity style={{ ...styles.lineEnterItem, width: featureBlockWidth }} extraButtonProps={{ rippleColor: '#fff' }}
                                    onPress={() => { navigation.navigate('AdminFeatureScreen') }}
                                >
                                    <Icon1 name="ios-build-outline" size={26} color="#666666" />
                                    <Text style={{ ...styles.lineEnterText1 }}>全局管理</Text>
                                </TouchableOpacity>
                            }
                        </View>
                    </View>
                </View>
            </View>
            <View style={styles.recordBox}>
                <Text style={{ marginTop: 5, fontSize: 14, paddingHorizontal: 20, fontWeight: 'bold' }}>全部动态（{treadsCount}）</Text>
                <FlatList
                    data={treadsList}
                    renderItem={renderItem}
                    keyExtractor={item => item.recordID}
                    onRefresh={getTreadsList}
                    refreshing={refreshing}
                />
            </View>
        </ScrollView>
    );
}

const mapStateToProps = state => {
    return {
        mainNavigation: getMainNavigation(state),
        userRole: getUserInfo(state).userRole,
        linePermission: getUserInfo(state).linePermission,
        coursePermission: getUserInfo(state).coursePermission,
        userID: getUserInfo(state).userID,
        userToken: getUserToken(state),
        boardType: getBoardSettingType(state),
    };
};


export default connect(
    mapStateToProps,
    { setUserPermission }
)(MineNewScreen);


