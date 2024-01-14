// 草稿箱视图
import React, { useState, useEffect } from "react";
import { View, useWindowDimensions } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView } from '@react-navigation/drawer';
import CustomLineList from "../../components/custom-line-list/custom-line-list";
import { styles } from "./course-line-list-screen.styles";
import CustomLineFilter from "../../components/custom-line-filter/custom-line-filter";
import { http, GET } from "../../common/http";
import { connect } from "react-redux";
import { getUserInfo, getBoardSettingType, getBoardSettingAngel } from "../../redux/selectors";
import { toastMessage } from "../../common/global";

// 当前页面的route name
const SOURCE_SCREEN_NAME = 'ScreenContentForCourse'

// 视图内容组件
const ScreenContent = ({ route, navigation, userID, boardType, boardAngel }) => {
    // 屏幕尺寸
    let screenWidth = useWindowDimensions().width;
    let screenHeight = useWindowDimensions().height;

    // 线路列表
    const [lineList, setLineList] = useState([]);
    // 在等待加载新数据时将此属性设为 true，列表就会显示出一个正在加载的符号
    const [refreshing, setRefreshing] = useState(false);

    // 初始化
    useEffect(() => {

    }, []);

    // 监视值-页面路由参数
    useEffect(() => {
        console.log(route.params);
        if (!route.params.courseID) {
            return;
        }
        // 当路由参数说明需要刷新列表时，刷新列表
        if (route.params.needRefresh === true) {
            // 请求列表
            getLineList(route.params.courseID);
            return;
        }
    }, [route.params]);

    // 获取线路列表
    const getLineList = (courseID = route.params.courseID) => {
        setRefreshing(true);
        // 请求
        http(`course/lines/${courseID}/${userID}`, GET)
            .then((res) => {
                // errorCode
                if (res.errCode) {
                    console.error('response error code: ', res.errCode);
                    toastMessage(`请求失败`);
                    return;
                }
                // response处理
                if (res.data) {
                    res.data = res.data.map((item) => {
                        return { ...item, lineId: item.id }
                    });
                    setLineList(res.data)
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

    // 返回react组件
    return (
        <View style={styles.box}>
            {/* 线路列表 */}
            <View style={styles.lineListBox}>
                <CustomLineList
                    navigation={navigation}
                    lineList={lineList}
                    showID={true}
                    onPress={(item, index) => {
                        navigation.navigate('CourseLineLayoutScreen', {
                            lineInfo: item,
                            sourceScreenName: SOURCE_SCREEN_NAME,
                            courseList: [...lineList] || [],
                            index: index,
                        })
                    }}
                    onRefresh={getLineList}
                    refreshing={refreshing}
                />
            </View>
        </View>
    );
}

const mapStateToProps = state => {
    return {
        ...getUserInfo(state),
        boardType: getBoardSettingType(state),
        boardAngel: getBoardSettingAngel(state)
    };
};

const ScreenContentPack = connect(
    mapStateToProps,
    {}
)(ScreenContent);

// 视图主组件
export const CourseLineListScreen = ({ route, navigation }) => {

    // 仅用作侧边栏筛选
    const Drawer = createDrawerNavigator();

    return (
        <View style={styles.drawerBox}>
            {/* 仅用作侧边栏筛选 */}
            <Drawer.Navigator
                drawerPosition="right"
                initialRouteName={SOURCE_SCREEN_NAME}
                drawerStyle={styles.drawe}
            >
                <Drawer.Screen
                    name={SOURCE_SCREEN_NAME}
                    component={ScreenContentPack}
                    options={{ swipeEnabled: false }}
                    initialParams={{ ...route.params }}
                />
            </Drawer.Navigator>
        </View>
    );
}