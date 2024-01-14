// 设置视图
import React, { useState, useEffect } from "react";
import { View, FlatList, TouchableOpacity, Image, useWindowDimensions, Text } from 'react-native';
import { CustomUserList, CustomUserSeparator } from "../../components/custom-user-list/custom-user-list";
import { CustomOptionList, CustomOptionSeparator } from "../../components/custom-option-list/custom-option-list";
import { CustomButton } from "../../components/custom-button/custom-button";
import { styles } from "./user-managment-screen.style";
import { romoveUserToken, romoveUserInfo } from "../../common/user";
import { resetUserData } from "../../redux/actions";
import { connect } from "react-redux";
import { getMainNavigation, getUserToken } from "../../redux/selectors";
import { SETTING_LIST_COMMON, SETTING_LIST_BUSINESS } from "../../config/mine";
import { http, GET, POST } from "../../common/http";
import { toastMessage } from "../../common/global";
import { SearchBar, Overlay, CheckBox } from 'react-native-elements';
import { AVATAR_IMG_URL } from "../../config/http";
import { DEFAULT_AVATER } from "../../config/mine";

// 视图主组件
const UserManagmentScreen = ({ navigation, userToken }) => {
    // 屏幕尺寸
    let screenWidth = useWindowDimensions().width;
    let screenHeight = useWindowDimensions().height;

    // 用户列表
    const [userList, setUserList] = useState([]);
    // 当前页数
    const [pageIndex, setPageIndex] = useState(0);
    // 在等待加载新数据时将此属性设为 true，列表就会显示出一个正在加载的符号
    const [refreshing, setRefreshing] = useState(false);
    // 搜索框值
    const [searchValue, setSearchValue] = useState('');
    // 覆盖框显示
    const [showOverlay, setShowOverlay] = useState(false);
    // 当前选中的用户信息
    const [curUserInfo, setCurUserInfo] = useState(null);
    // 当前线路权限值
    const [linePermission, setLinePermission] = useState(false);
    // 当前难度线路权限值
    const [levelLinePermission, setLevelLinePermission] = useState(false);
    // 当前课程权限值
    const [coursePermission, setCoursePermission] = useState(false);
    // 当前大V认证值
    const [certPermission, setCertPermission] = useState(false);

    // 初始化
    useEffect(() => {
        getUserList(pageIndex);
    }, []);

    // 获取用户列表
    const getUserList = (pageIndex = 0) => {
        http(`user/list`, POST, {
            body: {
                index: pageIndex,
                pageSize: 15,
                username: searchValue || ''
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
                        setUserList([...userList, ...res.data]);
                    } else {
                        setPageIndex(pageIndex - 1);
                    }
                } else {
                    // 刷新数据
                    setPageIndex(0);
                    if (!res.data) {
                        res.data = [];
                    }
                    setUserList(res.data);
                }
            })
            .catch((error) => {
                console.error(error);
                toastMessage(`请求失败`);
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
            getUserList(pageIndex + 1);
        }
    }

    // 输入框清除图标JSX
    const iconClose = (
        <TouchableOpacity onPress={() => setSearchValue('')}>
            <Image source={require('../../static/img/common-icons/close.png')} style={styles.searchBoxCleanIcon} />
        </TouchableOpacity>
    )

    // 输入框搜索图标JSX
    const iconSearch = (
        <Image source={require('../../static/img/common-icons/search.png')} style={styles.searchBoxIcon} />
    )

    // 列表视图
    const ListRenderItem = ({ item }) => {
        // 列表项点击处理
        const handleListPress = (userInfo) => {
            setShowOverlay(true);
            setCurUserInfo(userInfo);
            if (userInfo.linePermission === 1 || userInfo.linePermission === 3) {
                setLinePermission(true);
            } else {
                setLinePermission(false);
            }
            setLevelLinePermission(userInfo.linePermission === 3 ? true : false)
            setCoursePermission(userInfo.coursePermission === 1 ? true : false);
            setCertPermission(userInfo.cert === 1 ? true : false);
        }

        return <CustomUserList listItem={item} userToken={userToken} onPress={() => handleListPress(item)} />;
    };

    // 切换用户线路权限
    const handleLinePer = (type) => {
        let line = linePermission;
        let level = levelLinePermission;
        if (type === 1) {
            line = !linePermission;
        } else if (type === 3) {
            level = !levelLinePermission;
        }
        let per = line === true ? (level === true ? 3 : 1) : 2;
        http(`user/line/permission/update`, POST, {
            body: {
                userId: curUserInfo.id,
                // 2没有权限 1有抱石权限 3有抱石+难度权限
                permission: per
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
                if (per === 1 || per === 3) {
                    setLinePermission(true);
                } else {
                    setLinePermission(false);
                }
                setLevelLinePermission(per === 3 ? true : false)
                curUserInfo.linePermission = per;
                setUserList([...userList]);
            })
            .catch((error) => {
                console.error(error);
                toastMessage(`请求失败`);
            })
    }

    // 切换用户大V认证
    const handleIdenticalPer = () => {
        setCertPermission(!certPermission);
        http(`user/cert/update`, POST, {
            body: {
                userId: curUserInfo.id,
                cert: certPermission === false ? 1 : 2
            }
        })
            .then((res) => {
                // errorCode
                if (res.errCode) {
                    console.error('response error code: ', res.errCode);
                    setCertPermission(!certPermission);
                    toastMessage(`请求失败`);
                    return;
                }
                // response处理
                curUserInfo.cert = certPermission === false ? 1 : 2;
                setUserList([...userList]);
            })
            .catch((error) => {
                console.error(error);
                setCertPermission(!certPermission);
                toastMessage(`请求失败`);
            })
    }

    // 切换用户课程权限
    const handleCoursPer = () => {
        setCoursePermission(!coursePermission);
        http(`user/course/permission/update`, POST, {
            body: {
                userId: curUserInfo.id,
                permission: coursePermission === false ? 1 : 2
            }
        })
            .then((res) => {
                // errorCode
                if (res.errCode) {
                    console.error('response error code: ', res.errCode);
                    setCoursePermission(!coursePermission);
                    toastMessage(`请求失败`);
                    return;
                }
                // response处理
                curUserInfo.coursePermission = coursePermission === false ? 1 : 2;
                setUserList([...userList]);
            })
            .catch((error) => {
                console.error(error);
                setCoursePermission(!coursePermission);
                toastMessage(`请求失败`);
            })
    }

    // 返回react组件
    return (
        <View style={styles.box}>
            {/* 搜索栏 */}
            <View style={styles.searchBox}>
                <View style={{ width: screenWidth - 45 }}>
                    <SearchBar
                        placeholder="搜索用户名"
                        onChangeText={(e) => { setSearchValue(e) }}
                        onSubmitEditing={() => { getUserList() }}
                        value={searchValue}
                        round={true}
                        lightTheme={true}
                        inputStyle={styles.searchBoxInput}
                        clearIcon={iconClose}
                        searchIcon={iconSearch}
                        inputContainerStyle={styles.searchBoxInputInputContainer}
                        leftIconContainerStyle={styles.searchInputLeftIcon}
                        containerStyle={styles.searchBarContainer}
                    />
                </View>
                {/* 搜索按钮 */}
                <View style={styles.searchBtnView}>
                    <TouchableOpacity onPress={() => { getUserList() }}>
                        <Text style={styles.searchBtnText}>搜索</Text>
                    </TouchableOpacity>
                </View>
            </View>
            {/* 选项列表 */}
            <View style={styles.listGroup}>
                <FlatList
                    data={userList}
                    renderItem={ListRenderItem}
                    keyExtractor={item => item.id}
                    ItemSeparatorComponent={CustomUserSeparator}
                    onRefresh={getUserList}
                    refreshing={refreshing}
                    onEndReached={getMoreLines}
                    onEndReachedThreshold={0.25}
                />
            </View>
            {/* 点击用户显示的窗口 */}
            <Overlay isVisible={showOverlay} onBackdropPress={() => setShowOverlay(false)}>
                <View style={{ ...styles.overlayBox, width: screenWidth * 0.8 }}>
                    {curUserInfo &&
                        <View style={{ flexDirection: 'row' }}>
                            {curUserInfo['avatar'] ?
                                <Image
                                    source={{
                                        uri: `${AVATAR_IMG_URL}${curUserInfo.avatar}`,
                                        headers: { 'Authorization': userToken }
                                    }}
                                    style={styles.optionIcon}></Image>
                                :
                                <Image source={DEFAULT_AVATER} style={styles.optionIcon}></Image>
                            }
                            <View style={{ flexDirection: 'column' }}>
                                <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{curUserInfo.userName}</Text>
                                <Text style={{ fontSize: 14 }}>登录手机号：{curUserInfo.phone}</Text>
                                <Text style={{ fontSize: 14, color: 'green' }}>{curUserInfo.role === 2 ? '管理员用户' : ''}</Text>
                            </View>
                        </View>
                    }
                    <View style={[styles.sortItemBox, styles.fleterHasVideoBox]}>
                        <CheckBox
                            containerStyle={styles.selectBox}
                            checkedIcon={<Image style={styles.selectIcon} source={require('../../static/img/common-icons/check-box.png')} />}
                            uncheckedIcon={<Image style={styles.selectIcon} source={require('../../static/img/common-icons/check-box-outline.png')} />}
                            checked={linePermission}
                            onPress={() => handleLinePer(1)}
                        />
                        <Text style={styles.sortTitle}>创建抱石线路权限</Text>
                    </View>
                    {/* {linePermission &&
                        <View style={[styles.sortItemBox, styles.fleterHasVideoBox]}>
                            <CheckBox
                                containerStyle={styles.selectBox}
                                checkedIcon={<Image style={styles.selectIcon} source={require('../../static/img/common-icons/check-box.png')} />}
                                uncheckedIcon={<Image style={styles.selectIcon} source={require('../../static/img/common-icons/check-box-outline.png')} />}
                                checked={levelLinePermission}
                                onPress={() => handleLinePer(3)}
                            />
                            <Text style={styles.sortTitle}>创建难度线路权限</Text>
                        </View>
                    } */}
                    <View style={[styles.sortItemBox, styles.fleterHasVideoBox]}>
                        <CheckBox
                            containerStyle={styles.selectBox}
                            checkedIcon={<Image style={styles.selectIcon} source={require('../../static/img/common-icons/check-box.png')} />}
                            uncheckedIcon={<Image style={styles.selectIcon} source={require('../../static/img/common-icons/check-box-outline.png')} />}
                            checked={certPermission}
                            onPress={() => handleIdenticalPer()}
                        />
                        <Text style={styles.sortTitle}>大V认证用户</Text>
                    </View>
                    <View style={[styles.sortItemBox, styles.fleterHasVideoBox]}>
                        <CheckBox
                            containerStyle={styles.selectBox}
                            checkedIcon={<Image style={styles.selectIcon} source={require('../../static/img/common-icons/check-box.png')} />}
                            uncheckedIcon={<Image style={styles.selectIcon} source={require('../../static/img/common-icons/check-box-outline.png')} />}
                            checked={coursePermission}
                            onPress={() => handleCoursPer()}
                        />
                        <Text style={styles.sortTitle}>创建课程权限</Text>
                    </View>
                </View>
            </Overlay>
        </View>
    );
}

const mapStateToProps = state => {
    return {
        mainNavigation: getMainNavigation(state),
        userToken: getUserToken(state)
    };
};


export default connect(
    mapStateToProps,
    {}
)(UserManagmentScreen);


