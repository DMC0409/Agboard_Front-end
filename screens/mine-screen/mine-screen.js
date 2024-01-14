// 我的tab视图
import React, { useState, useEffect } from "react";
import { View, Text, Image, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MINE_FEATURE_LIST, MINE_COMMON_LIST, MINE_ADMIN_LIST, DEFAULT_AVATER, MINE_COURSE_LIST } from "../../config/mine";
import { CustomOptionList, CustomOptionSeparator } from "../../components/custom-option-list/custom-option-list";
import { styles } from "./mine-screen.styles";
import { connect } from "react-redux";
import { getUserInfo, getUserToken } from "../../redux/selectors";
import { AVATAR_IMG_URL } from "../../config/http";
import { http, GET, POST } from "../../common/http";
import { USER_ROLE } from "../../config/login";
import { setUserPermission } from "../../redux/actions";
import { toastMessage } from "../../common/global";

// 视图主组件
const MineScreen = ({ userRole, userID, userToken, linePermission, coursePermission, setUserPermission }) => {
    // 获取导航对象
    const navigation = useNavigation();
    const [MINE_FEATURE_LIST_FILTER, SET_MINE_FEATURE_LIST_FILTER] = useState([]);

    // 用户信息
    const [userInfo, setUserInfo] = useState({});
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

    // 当页面聚焦时，重新获取数据
    useEffect(() => {
        // 当页面参数都填充好时绑定 focus 监听函数
        const unsubscribe = navigation.addListener('focus', () => {
            getUserInfo();
            getUserLineInfo();
            getNoticeCount();
        });
        return () => {
            unsubscribe();
        };
    }, [navigation]);

    // 组件初始化
    useEffect(() => {
        getUserInfo();
        getUserLineInfo();
        getNoticeCount();
    }, []);

    // 检查线路权限
    useEffect(() => {
        SET_MINE_FEATURE_LIST_FILTER(
            [...MINE_FEATURE_LIST].filter(item => {
                if (linePermission === 2 && item.id === '1') {
                    return false;
                }
                return true;
            })
        )
    }, [linePermission]);

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
    // 头像栏点击处理
    const handlerHeaderPress = () => {
        if (userInfo && userInfo !== {}) {
            navigation.navigate('PersonalInfoScreen', {
                userInfo: userInfo,
            })
        }
    }

    // 我的列表视图
    const mineListRenderItem = ({ item }) => {
        // 列表项点击处理
        const handleListPress = (id) => {
            switch (id) {
                // 临时新主页
                case 'temp':
                    navigation.navigate('MineNewScreen');
                    break;
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
            {/* 顶部个人信息栏 */}
            <View style={styles.mineInfoBox}>
                {/* 头像栏 */}
                <TouchableOpacity onPress={handlerHeaderPress}
                    style={styles.mineInfoButton}>
                    <View style={styles.userNameBox}>
                        {/* 头像 */}
                        {userInfo.avatar ?
                            <Image
                                source={{
                                    uri: `${AVATAR_IMG_URL}${userInfo.avatar}`,
                                    headers: { 'Authorization': userToken }
                                }}
                                style={styles.avatarImg}
                            ></Image>
                            :
                            <Image source={DEFAULT_AVATER} style={styles.avatarImg}></Image>
                        }
                        {/* 昵称，手机号 */}
                        <View style={styles.nicknameBox}>
                            <View style={styles.nicknameFa}>
                                {/* 大V认证： 1认证  2未认证 */}
                                {userInfo.cert === 1 &&
                                    <Image source={require('../../static/img/common-icons/V-idenity.png')} style={styles.VidenityImg}></Image>
                                }
                                <Text style={styles.nickname}>{userInfo.userName || 'ALPHA WALL用户'}</Text>
                            </View>
                            <Text style={styles.userName}>手机号：{userPhone}</Text>
                        </View>
                    </View>
                    <Image source={require('../../static/img/common-icons/arrow-right.png')} style={styles.arrowRight}></Image>
                </TouchableOpacity>
                {/* 快捷栏 */}
                <View style={styles.lineBar}>
                    <TouchableOpacity style={styles.lineEnterItem} onPress={() => { navigation.navigate('MessageNotificationScreen', { isCreat: false }) }}>
                        <Text style={styles.lineEnterCount}>{noticeCount}</Text>
                        <Text style={styles.lineEnterText}>新通知</Text>
                    </TouchableOpacity>
                    <View style={styles.splitLines}></View>
                    <TouchableOpacity style={styles.lineEnterItem} onPress={() => { navigation.navigate('MyDesignLinesScreen') }}>
                        <Text style={styles.lineEnterCount}>{designCount}</Text>
                        <Text style={styles.lineEnterText}>我设计的</Text>
                    </TouchableOpacity>
                    <View style={styles.splitLines}></View>
                    <TouchableOpacity style={styles.lineEnterItem} onPress={() => { navigation.navigate('FavoritesScreen') }}>
                        <Text style={styles.lineEnterCount}>{collectCount}</Text>
                        <Text style={styles.lineEnterText}>收藏夹</Text>
                    </TouchableOpacity>
                    <View style={styles.splitLines}></View>
                    <TouchableOpacity style={styles.lineEnterItem} onPress={() => { navigation.navigate('CompleteRecordScreen') }}>
                        <Text style={styles.lineEnterCount}>{finishCount}</Text>
                        <Text style={styles.lineEnterText}>完成历史</Text>
                    </TouchableOpacity>
                </View>
            </View>
            {/* 列表 */}
            <ScrollView style={styles.listBox}>
                <View style={styles.listPart}>
                    <FlatList
                        data={MINE_FEATURE_LIST_FILTER}
                        renderItem={mineListRenderItem}
                        keyExtractor={item => item.id}
                        ItemSeparatorComponent={CustomOptionSeparator}
                    />
                </View>
                <View style={styles.listPart}>
                    <FlatList
                        data={[...MINE_COMMON_LIST]}
                        renderItem={mineListRenderItem}
                        keyExtractor={item => item.id}
                        ItemSeparatorComponent={CustomOptionSeparator}
                    />
                </View>
                {/* 二级课程管理 */}
                {userRole !== USER_ROLE.ADMIN && coursePermission === 1 &&
                    <View style={styles.listPart}>
                        <FlatList
                            data={[...MINE_COURSE_LIST]}
                            renderItem={mineListRenderItem}
                            keyExtractor={item => item.id}
                            ItemSeparatorComponent={CustomOptionSeparator}
                        />
                    </View>
                }
                {/* 管理员功能 */}
                {/* USER_ROLE.ADMIN */}
                {userRole === USER_ROLE.ADMIN &&
                    <View style={styles.listPart}>
                        <FlatList
                            data={[...MINE_ADMIN_LIST]}
                            renderItem={mineListRenderItem}
                            keyExtractor={item => item.id}
                            ItemSeparatorComponent={CustomOptionSeparator}
                        />
                    </View>
                }
            </ScrollView>
        </View>
    );
}

const mapStateToProps = state => {
    return {
        userID: getUserInfo(state).userID,
        userRole: getUserInfo(state).userRole,
        linePermission: getUserInfo(state).linePermission,
        coursePermission: getUserInfo(state).coursePermission,
        userToken: getUserToken(state)
    };
};

export default connect(
    mapStateToProps,
    { setUserPermission }
)(MineScreen);