// 草稿箱视图
import React, { useState, useEffect } from "react";
import { View } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import CustomLineList from "../../components/custom-line-list/custom-line-list";
import { styles } from "./draft-box-screen.styles";
import { http, POST } from "../../common/http";
import { connect } from "react-redux";
import { getUserInfo } from "../../redux/selectors";
import { PAGE_SIZE } from "../../config/line";
import { toastMessage } from "../../common/global";

// 视图内容组件
const ScreenContent = ({ route, navigation, userID }) => {
    // 线路列表当前加载到第几页
    let pageIndex = 0;

    // 线路列表
    const [lineList, setLineList] = useState([]);
    // 在等待加载新数据时将此属性设为 true，列表就会显示出一个正在加载的符号
    const [refreshing, setRefreshing] = useState(false);

    // 初始化
    useEffect(() => {
        getLineList();
    }, []);

    // 监视值-页面路由参数
    useEffect(() => {
        if (!route.params) {
            return;
        }
        // 当路由参数说明需要刷新列表时，刷新列表
        if (route.params.needRefresh === true) {
            // 请求列表
            getLineList();
            return;
        }
        // 当筛选项更新时触发
        if (route.params.filterValue) {
            // 将当前筛选保存在 state
            currentFilterValue = route.params.filterValue
            // 请求列表
            getLineList();
        }
    }, [route.params]);

    // 获取线路列表
    const getLineList = (pageIndex = 0) => {
        setRefreshing(true);
        // 请求
        http(`line/draft/drafts`, POST, {
            body: {
                // 当前的页数
                index: pageIndex,
                // 每页的展示数
                pageSize: PAGE_SIZE,
                // 用户ID
                userID: userID,
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
                if (res.data && res.data.length) {
                    res.data.forEach(element => {
                        element['lineId'] = element.id
                    });
                    if (pageIndex !== 0) {
                        // 追加数据
                        setLineList([...lineList, ...res.data]);
                    } else {
                        // 刷新数据
                        setLineList(res.data);
                    }
                } else {
                    if (pageIndex !== 0) {
                        // 追加数据
                    } else {
                        // 刷新数据
                        setLineList([]);
                    }
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

    // 下拉到底部时，获取下一页线路列表
    const getMoreLines = () => {
        // 借助 state 属性 refreshing 判断当前是否正在请求中
        if (refreshing) {
            // 暂缓调用
            return;
        } else {
            pageIndex = pageIndex + 1;
            getLineList(pageIndex);
        }
    }

    // 返回react组件
    return (
        <View style={styles.box}>
            {/* 线路列表 */}
            <View style={styles.lineListBox}>
                <CustomLineList
                    navigation={navigation}
                    lineList={lineList}
                    onPress={(item, index) => { 
                        if (item.type === 2) {
                            navigation.navigate('LineCreatePart1ForLevelScreen', { ...item });
                        } else {
                            navigation.navigate('DraftLinePart1Screen', { ...item });
                        }
                    }}
                    onRefresh={getLineList}
                    refreshing={refreshing}
                    onEndReached={getMoreLines}
                />
            </View>
        </View>
    );
}

const mapStateToProps = state => {
    return {
        ...getUserInfo(state),
    };
};

const ScreenContentPack = connect(
    mapStateToProps,
    {}
)(ScreenContent);

// 视图主组件
export const DraftBoxScreen = ({ route, navigation }) => {
    // 仅用作侧边栏筛选
    const Drawer = createDrawerNavigator();

    return (
        <View style={styles.drawerBox}>
            {/* 仅用作侧边栏筛选 */}
            <Drawer.Navigator
                drawerPosition="right"
                initialRouteName="ScreenContentForDraft"
                drawerStyle={styles.drawe}
            >
                <Drawer.Screen
                    name='ScreenContentForDraft'
                    component={ScreenContentPack}
                    options={{ swipeEnabled: false }}
                    initialParams={{ ...route.params }}
                />
            </Drawer.Navigator>
        </View>
    );
}