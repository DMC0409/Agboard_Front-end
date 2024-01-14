import React, { useState, useEffect } from "react";
import { View, Text, FlatList, Image, TextInput, useWindowDimensions } from 'react-native';
import { styles } from "./course-screen.styles";
import { http, GET, POST } from "../../common/http";
import { imgScale } from "../../config/course";
import { COURSE_IMG_URL } from "../../config/http";
import { getUserToken, getUserInfo, getBoardSettingType } from "../../redux/selectors";
import { connect } from "react-redux";
import { toastMessage } from "../../common/global";
import { Button, Overlay, Tab, TabView } from 'react-native-elements';

import ScrollableTabView, { DefaultTabBar } from 'react-native-scrollable-tab-view';
import { TouchableOpacity } from 'react-native-gesture-handler'

// 视图主组件
const CourseScreen = ({ navigation, userID, userToken, boardType }) => {
    // 屏幕宽度
    const screenWidth = useWindowDimensions().width;

    // 课程列表
    const [courseList, setCourseList] = useState([]);
    // 私人课程列表
    const [privateCourse, setPrivateCourse] = useState([]);
    // 活动列表
    const [activityCourse, setActivityCourse] = useState([]);
    // 是否正在刷新
    const [refreshing, setRefreshing] = useState(false);
    // 输入密码弹出框显示
    const [inputPswShow, setInputPswShow] = useState(false);
    // 当前输入的密码
    const [currentPsw, setCurrentPsw] = useState('');
    // 表单密码的消息提示
    const [currentPswMessage, setCurrentPswMessage] = useState('');
    // 当前点击的课程暂存数据，等待用户输入密码正确后使用
    const [tempCoutesData, setTempCoutesData] = useState(null);
    // 用于切换tab
    const [index, setIndex] = useState(0);

    // 组件初始化
    useEffect(() => {
        // 获取课程列表
        getCoures();
    }, []);

    // 当岩板类型改变时，重新加载列表
    useEffect(() => {
        console.log(123, boardType);
        getCoures();
    }, [boardType]);

    // 获取课程列表
    const getCoures = () => {
        setRefreshing(true);
        http(`course/courses/${'*'}`, GET)
            .then((res) => {
                // errorCode
                if (res.errCode) {
                    console.error('response error code: ', res.errCode);
                    toastMessage(`请求失败`);
                    setRefreshing(false);
                    return;
                }
                // response处理
                const publicList = [];
                const privateList = [];
                const activityList = [];
                if (res.data) {
                    res.data.forEach(item => {
                        if (item.boardId === boardType.id) {
                            // 1:公开课程 2:私人课程 3:在线活动
                            if (item.type === 1) {
                                publicList.push(item);
                            } else if (item.type === 2) {
                                privateList.push(item);
                            } else if (item.type === 3) {
                                activityList.push(item);
                            }
                        }
                    });
                }
                setCourseList(publicList);
                setPrivateCourse(privateList);
                setActivityCourse(activityList);
            })
            .catch((error) => {
                console.error(error);
                toastMessage(`请求失败`);
            })
            .finally(() => {
                setRefreshing(false);
            })
    }

    // 点击课程项目
    const handleCouseItem = (item) => {
        if (item.private === '1' && item.isUnlock !== true) {
            setCurrentPsw('');
            setCurrentPswMessage('');
            setInputPswShow(true);
            setTempCoutesData(item);
            return;
        }
        navigation.navigate('CourseDetailScreen', { course: { ...item } });
    }

    // 点击确认密码
    const handlerSaveButton = () => {
        if (!tempCoutesData) {
            toastMessage(`发生错误，请重试`);
            return;
        }
        if (!currentPsw) {
            setCurrentPswMessage('请填写密码');
            return;
        }
        http(`course/check/${tempCoutesData.id || ''}/${currentPsw}`, GET)
            .then((res) => {
                // errorCode
                if (res.errCode) {
                    console.error('response error code: ', res.errCode);
                    toastMessage(`请求失败`);
                    return;
                }
                // response处理
                if (res.data) {
                    toastMessage(`解锁成功`);
                    setInputPswShow(false);
                    navigation.navigate('CourseDetailScreen', { course: { ...tempCoutesData } });
                } else {
                    setCurrentPswMessage('密码错误');
                }
            })
            .catch((error) => {
                console.error(error);
                toastMessage(`请求失败`);
            })
    }

    // 列表项
    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={{ backgroundColor: '#ffffff', marginTop: 10, borderRadius: 8, marginHorizontal: 10 }}
            onPress={() => { handleCouseItem(item) }}
        >
            {/* 封面 */}
            {!!item.imgUrl &&
                <Image
                    source={{
                        uri: `${COURSE_IMG_URL}${item.imgUrl}`,
                        headers: { 'Authorization': userToken }
                    }}
                    style={{ width: screenWidth - 20, height: (screenWidth - 20) / imgScale, resizeMode: 'contain', borderRadius: 5 }}
                ></Image>
            }
            <View style={{ paddingHorizontal: 15, paddingVertical: 10, paddingTop: 8 }}>
                {/* 名称 */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 0 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 15 }}>{item.name}</Text>
                        {item.private === '1' && item.isUnlock !== true &&
                            < Image source={require('../../static/img/common-icons/lock.png')} style={{ height: 20, width: 20, marginLeft: 5 }}></Image>
                        }
                        {item.private === '1' && item.isUnlock === true &&
                            < Image source={require('../../static/img/common-icons/unlock.png')} style={{ height: 20, width: 20, marginLeft: 5 }}></Image>
                        }
                    </View>
                    <View></View>
                </View>
                {/* 子标题 */}
                {!!item.subtitle &&
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5, marginLeft: 10 }}>
                        <Text style={{ color: '#808080', fontSize: 14 }}>“{item.subtitle}”</Text>
                    </View>
                }
            </View>
        </TouchableOpacity >
    );

    // 返回react组件
    return (
        <View style={{ flex: 1 }}>

            <ScrollableTabView
                initialPage={0}
                renderTabBar={() => <DefaultTabBar style={{ borderColor: '#c8c6cb', borderBottomWidth: 0, paddingRight: screenWidth - 320, height: 48 }} />}
                tabBarActiveTextColor='#22934f'
                tabBarInactiveTextColor='#808080'
                tabBarTextStyle={{ fontSize: 18, paddingTop: 10 }}
                tabBarUnderlineStyle={{ backgroundColor: '#22934f', height: 0 }}
                onChangeTab={(info) => { console.log(info) }}
                onScroll={(pos) => { }}
            >
                <View tabLabel='公开课程' style={{ flex: 1 }}>
                    {(!!courseList && courseList.length === 0) &&
                        <View style={{ justifyContent: 'center', alignContent: 'center', paddingVertical: 20 }}>
                            <Text style={{ textAlign: 'center', fontSize: 16, color: '#808080' }}>无课程数据</Text>
                        </View>
                    }
                    {/* 公开课程列表 */}
                    <View style={{ flex: 1 }}>
                        <FlatList
                            data={courseList}
                            renderItem={renderItem}
                            keyExtractor={item => item.id}
                            onRefresh={getCoures}
                            refreshing={refreshing}
                        />
                    </View>
                </View>
                <View tabLabel='私人课程' style={{ flex: 1 }}>
                    {(!!privateCourse && privateCourse.length === 0) &&
                        <View style={{ justifyContent: 'center', alignContent: 'center', paddingVertical: 20 }}>
                            <Text style={{ textAlign: 'center', fontSize: 16, color: '#808080' }}>无课程数据</Text>
                        </View>
                    }
                    {/* 私人课程列表 */}
                    <View style={{ flex: 1 }}>
                        <FlatList
                            data={privateCourse}
                            renderItem={renderItem}
                            keyExtractor={item => item.id}
                            onRefresh={getCoures}
                            refreshing={refreshing}
                        />
                    </View>
                </View>
                <View tabLabel='连线活动' style={{ flex: 1 }}>
                    {(!!activityCourse && activityCourse.length === 0) &&
                        <View style={{ justifyContent: 'center', alignContent: 'center', paddingVertical: 20 }}>
                            <Text style={{ textAlign: 'center', fontSize: 16, color: '#808080', justifyContent: 'center' }}>无活动数据</Text>
                        </View>
                    }
                    {/* 连线活动列表 */}
                    <View style={{ flex: 1 }}>
                        <FlatList
                            data={activityCourse}
                            renderItem={renderItem}
                            keyExtractor={item => item.id}
                            onRefresh={getCoures}
                            refreshing={refreshing}
                        />
                    </View>
                </View>
            </ScrollableTabView>

            {/* 输入密码 */}
            <Overlay isVisible={inputPswShow} onBackdropPress={() => { }}>
                <View style={{ ...styles.overlayBox, width: screenWidth * 0.7 }}>
                    <View>
                        <Text style={styles.overlayTitle}>课程密码：</Text>
                        <TextInput
                            style={styles.nameInput}
                            placeholder='填写密码'
                            value={currentPsw}
                            onChangeText={text => setCurrentPsw(text)}
                        />
                        <Text style={styles.message}>{currentPswMessage}</Text>
                    </View>
                    <View style={styles.buttonGroup}>
                        <Button
                            title="取消"
                            type="clear"
                            titleStyle={styles.cancelButtonBox}
                            buttonStyle={styles.cancelButton}
                            onPress={() => setInputPswShow(false)}
                        />
                        <Button
                            title="确认"
                            type="clear"
                            titleStyle={styles.saveButtonBox}
                            buttonStyle={styles.saveButton}
                            onPress={() => handlerSaveButton()}
                        />
                    </View>
                </View>
            </Overlay>
        </View>
    );
}

const mapStateToProps = state => {
    return {
        userToken: getUserToken(state),
        boardType: getBoardSettingType(state),
        userID: getUserInfo(state).userID,
    };
};

export default connect(
    mapStateToProps,
    {}
)(CourseScreen);