// 草稿箱视图
import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Image, useWindowDimensions, FlatList } from 'react-native';
import { ButtonGroup, Rating } from 'react-native-elements';
import { createDrawerNavigator, DrawerContentScrollView } from '@react-navigation/drawer';
import CustomLineList from "../../components/custom-line-list/custom-line-list";
import { styles } from "./complete-record-screen.styles";
import { LINE_SORT_CONFIG } from "../../config/line";
import CustomLineFilter from "../../components/custom-line-filter/custom-line-filter";
import { http, GET, POST } from "../../common/http";
import { connect } from "react-redux";
import { getUserInfo, getBoardSettingType, getBoardSettingAngel } from "../../redux/selectors";
import { LINE_LEVEL_LIST, PAGE_SIZE } from "../../config/line";
import { BOARD_TYPE_NAME } from "../../config/board";
import { Overlay } from 'react-native-elements';
import { toastMessage } from "../../common/global";
import { BarChart } from "react-native-chart-kit";

// 当前页面的route name
export const SOURCE_SCREEN_NAME = 'ScreenContentForRecord'

// 视图内容组件
const ScreenContent = ({ route, navigation, userID, boardType, boardAngel }) => {
    // 屏幕尺寸
    let screenWidth = useWindowDimensions().width;
    let screenHeight = useWindowDimensions().height;
    // 获取当前年月
    const curYear = new Date().getFullYear();
    const curMonth = new Date().getMonth() + 1;
    const curDay = new Date().getDate();
    // 当前筛选值
    const [currentFilterValue, setCurrentFilterValue] = useState({
        haveVideo: false,
        normalLineOnly: false,
        levelLineOnly: false,
        creater: '',
        levelValue: [],
        unknownLevel: true,
        labelIDList: [],
        boardSize: boardType.id === BOARD_TYPE_NAME.M ? false : true
    });
    // 图表配置
    const [chartData, setChartData] = useState({
        labels: [],
        datasets: [
            {
                data: []
            }
        ]
    });
    const chartConfig = {
        formatYLabel: (yLabel) => String(Number(yLabel).toFixed(0)),
        backgroundGradientFrom: "#fff",
        backgroundGradientFromOpacity: 1,
        backgroundGradientTo: "#fff",
        backgroundGradientToOpacity: 1,
        color: (opacity = 1) => `rgba(62, 85, 196, ${opacity})`,
        fillShadowGradient: `#3e55c4`,
        fillShadowGradientOpacity: 1,
        strokeWidth: 3, // optional, default 3
        barPercentage: 0.5,
        barRadius: 0,
        useShadowColorFromDataset: false // optional
    };
    // 是否由图表
    const [chartMaxItem, setChartMaxItem] = useState(1);
    // 线路列表
    const [lineList, setLineList] = useState([]);
    // 在等待加载新数据时将此属性设为 true，列表就会显示出一个正在加载的符号
    const [refreshing, setRefreshing] = useState(false);
    // 线路列表当前加载到第几页
    const [pageIndex, setPageIndex] = useState(0);
    // 当前线路列表所用的请求参数，用于线路展示页面的左滑右滑
    const [currentListParam, setCurrentListParam] = useState(undefined);
    // 标志线路列表是否到尾部
    const [listIsTail, setListIsTail] = useState(false);
    // 标志线路是否需要回到顶部
    const [listNeedHeader, setListNeedHeader] = useState(false);
    // 年月日选择
    const [dateSelectedIndex, setDateSelectedIndex] = useState(0);
    // 列表对象
    const [listObj, setListObj] = useState({});
    // 完成次数
    const [completeCount, setCompleteCount] = useState(0);
    // 攀爬次数
    const [climbCount, setClimbCount] = useState(0);


    // 初始化
    useEffect(() => {
        getLineList();
        getCountInfo();
    }, []);

    // 当年月日选择更新时，重新加载列表
    useEffect(() => {
        getLineList();
        getCountInfo();
    }, [dateSelectedIndex]);

    // 当筛选项更新时，重新加载列表
    useEffect(() => {
        getLineList();
    }, [currentFilterValue]);

    // 监视值-页面路由参数
    useEffect(() => {
        // 当路由参数说明需要刷新列表时，刷新列表
        if (route.params.needRefresh === true) {
            // 请求列表
            getLineList();
            return;
        }
        // 当筛选项更新时触发
        if (route.params.filterValue) {
            // 将当前筛选保存在 state
            setCurrentFilterValue(route.params.filterValue)
        }
    }, [route.params]);

    // 监听是否需要回到顶部
    useEffect(() => {
        setTimeout(() => {
            if (listNeedHeader === true && listObj && lineList && lineList.length > 3) {
                listObj.scrollToIndex({
                    animated: false,
                    index: 0,
                    viewPosition: 0,
                    viewOffset: 500
                });
            }
        }, 0);
    }, [listNeedHeader]);

    // 获取统计信息
    const getCountInfo = () => {
        setChartData(
            {
                labels: [],
                datasets: [
                    {
                        data: []
                    }
                ]
            }
        );
        let createYear = '';
        let creatMonth = '';
        let createDay = '';
        if (dateSelectedIndex === 1) {
            createYear = String(curYear);
        } else if (dateSelectedIndex === 2) {
            creatMonth = String(curMonth);
            creatMonth = String(curYear) + '-' + (creatMonth.length > 1 ? creatMonth : '0' + creatMonth);
        } else if (dateSelectedIndex === 3) {
            createDay = String(curDay);
            let tempMonth = String(curMonth);
            tempMonth = String(curYear) + '-' + (tempMonth.length > 1 ? tempMonth : '0' + tempMonth);
            createDay = tempMonth + '-' + (createDay.length > 1 ? createDay : '0' + createDay);
        }
        http(`line/user/complete/detail`, POST, {
            body: {
                "userID": userID,
                "createYear": createYear,
                "createMonth": creatMonth,
                "createDay": createDay
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
                if (res.data) {
                    setCompleteCount(res.data.completeNum || 0);
                    setClimbCount(res.data.totalNum || 0);
                    if (res.data.completeLevels) {
                        res.data.completeLevels = res.data.completeLevels.sort((a, b) => {
                            if (Number(a.level.slice(1, a.length)) > Number(b.level.slice(1, b.length))) {
                                return 1;
                            } else if (Number(a.level.slice(1, a.length)) < Number(b.level.slice(1, b.length))) {
                                return -1;
                            } else {
                                return 0;
                            }
                        });
                        let labels = [];
                        let datasets = [];
                        let max = 1;
                        res.data.completeLevels.forEach(item => {
                            if (item.level === '') {
                                item.level = '未知'
                            }
                            if (item.level && labels.indexOf(item.level) === -1) {
                                labels.push(item.level);
                                datasets.push(item.num);
                                if (item.num > max) {
                                    max = item.num;
                                }
                            }
                        })
                        if (labels.length !== 0) {
                            setChartMaxItem(max);
                            setChartData({
                                labels: labels,
                                datasets: [
                                    {
                                        data: datasets,
                                    }
                                ]
                            });
                        } 
                    }
                }
            })
            .catch((error) => {
                console.error(error);
                toastMessage(`请求失败`);
            })
    }

    // 获取线路列表
    const getLineList = (pageIndex = 0) => {
        let createYear = '';
        let creatMonth = '';
        let createDay = '';
        if (dateSelectedIndex === 1) {
            createYear = String(curYear);
        } else if (dateSelectedIndex === 2) {
            creatMonth = String(curMonth);
            creatMonth = String(curYear) + '-' + (creatMonth.length > 1 ? creatMonth : '0' + creatMonth);
        } else if (dateSelectedIndex === 3) {
            createDay = String(curDay);
            let tempMonth = String(curMonth);
            tempMonth = String(curYear) + '-' + (tempMonth.length > 1 ? tempMonth : '0' + tempMonth);
            createDay = tempMonth + '-' + (createDay.length > 1 ? createDay : '0' + createDay);
        }
        // 请求
        const requstParam = {
            "index": pageIndex,
            "pageSize": 10,
            "userID": userID,
            "createYear": createYear,
            "createMonth": creatMonth,
            "createDay": createDay
        }
        setCurrentListParam({ ...requstParam });
        http(`line/user/complete/infos`, POST, {
            body: requstParam
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
                        setLineList([...lineList, ...res.data]);
                        setListIsTail(false);
                    } else {
                        setPageIndex(pageIndex - 1);
                        setListIsTail(true);
                    }
                    setListNeedHeader(false);
                } else {
                    // 刷新数据
                    setPageIndex(0);
                    if (!res.data) {
                        res.data = [];
                    }
                    setLineList(res.data);
                    setListIsTail(false);
                    setListNeedHeader(true);
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
            setPageIndex(pageIndex + 1);
            getLineList(pageIndex + 1);
        }
    }

    // 列表视图
    const ListRenderItem = ({ item }) => {
        // 列表项点击事件
        const handlerListItem = (item1, index) => {
            const lineInfo = { ...item };
            lineInfo.lineId = item.lineID;
            lineInfo.name = item.lineName;
            lineInfo.level = item.lineLevel;
            navigation.navigate('LineLayoutScreen', {
                lineInfo: lineInfo,
                sourceScreenName: SOURCE_SCREEN_NAME,
                index: index,
                listParam: currentListParam,
                recordSouce: true
            })
        }

        return (
            <>
                <View style={{ backgroundColor: '#e5e5e5', paddingHorizontal: 17, paddingVertical: 3 }}>
                    <Text style={{ fontWeight: 'bold' }}>{item.completeTime}</Text>
                </View>
                <TouchableOpacity style={styles.optionBox} onPress={handlerListItem}>
                    <View style={styles.option}>
                        <Image source={require('../../static/img/common-icons/select.png')} style={{ height: 20, width: 20, marginRight: 5 }}></Image>
                    </View>
                    <View style={{ flex: 1 }}>

                        <View>
                            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{item.lineName}</Text>
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text>{item.level || ''} </Text>
                            <Rating
                                style={{ width: 60, paddingVertical: 4 }}
                                ratingCount={5}
                                startingValue={parseFloat(item.score || 0)}
                                imageSize={12}
                                readonly={true}
                                showRating={false}
                            />
                            <Text> @ {item.angelValue} </Text>
                            <Text>{item.num === 1 ? 'Flash' : item.num + '次' || ''}</Text>
                            {item.num === 1 &&
                                <Image source={require('../../static/img/common-icons/lightning.png')} style={{ height: 20, width: 20 }}></Image>
                            }
                        </View>
                        <View style={{ flexDirection: 'row', alignContent: 'center' }}>
                            {!!item.notes &&
                                <Text style={{ fontStyle: 'italic', marginLeft: 0 }}>"{item.notes}"</Text>
                            }
                        </View>
                    </View>
                </TouchableOpacity>
            </>

        );
    };

    // 返回react组件
    return (
        <View style={styles.box}>
            {/* 年月日 */}
            <View style={{ paddingVertical: 8, paddingHorizontal: 15, backgroundColor: '#fff' }}>
                <ButtonGroup
                    buttons={['全部', '年', '月', '日']}
                    selectedIndex={dateSelectedIndex}
                    onPress={(value) => {
                        setDateSelectedIndex(value);
                    }}
                    containerStyle={{
                        borderWidth: 0,
                        borderRadius: 0,
                        backgroundColor: '#efefef',
                        marginVertical: 0,
                        marginHorizontal: 0,
                        borderRadius: 8,
                        height: 35
                    }}
                    innerBorderStyle={{
                        width: 0
                    }}
                    selectedButtonStyle={{
                        backgroundColor: '#00b050',
                        borderRadius: 8
                    }}
                    textStyle={{
                        fontSize: 15
                    }}
                />
            </View>

            {/* 线路列表 */}
            <View style={styles.lineListBox}>
                <FlatList
                    ref={ref => setListObj(ref)}
                    data={lineList}
                    renderItem={ListRenderItem}
                    keyExtractor={(item, index) => index}
                    onRefresh={getLineList}
                    refreshing={refreshing}
                    onEndReached={getMoreLines}
                    onEndReachedThreshold={0.25}
                    ListFooterComponent={
                        (!!lineList && lineList.length !== 0 && listIsTail === true) ?
                            <View style={{ felx: 1, justifyContent: 'center', alignContent: 'center', paddingVertical: 15 }}>
                                <Text style={{ textAlign: 'center', fontSize: 14, color: '#808080' }}>——— 到底了 ———</Text>
                            </View>
                            :
                            null
                    }
                    ListHeaderComponent={
                        <>
                            {/* 数据块 */}
                            <View style={{ paddingVertical: 8, paddingHorizontal: 15, backgroundColor: '#fff', paddingBottom: 15 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <View style={{ height: 80, alignItems: 'center', width: '49%', justifyContent: 'center', backgroundColor: '#a9d18e', borderRadius: 10 }}>
                                        <Text style={{ color: '#fff', fontSize: 13 }}>完成线路 </Text>
                                        <Text style={{ color: '#fff', fontSize: 25, paddingTop: 5 }}>{completeCount}</Text>
                                    </View>
                                    <View style={{ height: 80, alignItems: 'center', width: '49%', justifyContent: 'center', backgroundColor: '#ffc000', borderRadius: 10 }}>
                                        <Text style={{ color: '#fff', fontSize: 13 }}>攀爬次数 </Text>
                                        <Text style={{ color: '#fff', fontSize: 25, paddingTop: 5 }}>{climbCount}</Text>
                                    </View>
                                </View>
                            </View>
                            {chartData.datasets[0].data.length !== 0 &&
                                <View style={{ paddingHorizontal: 10, backgroundColor: '#fff' }}>
                                    <BarChart
                                        style={{ paddingRight: 45 }}
                                        data={chartData}
                                        width={screenWidth - 20}
                                        height={220}
                                        yAxisSuffix="人"
                                        chartConfig={chartConfig}
                                        verticalLabelRotation={0}
                                        showBarTops={true}
                                        showValuesOnTopOfBars={true}
                                        fromZero={true}
                                        withHorizontalLabels={true}
                                        segments={chartMaxItem <= 4 ? chartMaxItem : 4}
                                    />
                                </View>
                            }
                        </>
                    }
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
const CompleteRecordScreen = ({ navigation, boardType }) => {
    // 岩板标签数组
    const [markLabelList, setMarkLabelList] = useState([]);
    // 当前的筛选条件
    const [filterValue, setFilterValue] = useState({
        haveVideo: false,
        normalLineOnly: false,
        levelLineOnly: false,
        creater: '',
        levelValue: [],
        unknownLevel: true,
        labelIDList: [],
        boardSize: boardType.id === BOARD_TYPE_NAME.M ? false : true
    });

    // 初始化时，获取岩板标签数组
    useEffect(() => {
        http(`label/labels`, GET)
            .then((res) => {
                // errorCode
                if (res.errCode) {
                    console.error('response error code: ', res.errCode);
                    toastMessage(`请求失败`);
                    return;
                }
                // response处理
                if (res.data) {
                    setMarkLabelList(
                        [...res.data].map((item) => {
                            return {
                                id: item.id,
                                name: item.labelName,
                                selected: false
                            }
                        })
                    );
                }
            })
            .catch((error) => {
                console.error(error);
                toastMessage(`请求失败`);
            })
    }, []);

    // 筛选重置处理
    const handlerReset = () => {
        setFilterValue({
            haveVideo: false,
            normalLineOnly: false,
            levelLineOnly: false,
            creater: '',
            levelValue: [],
            unknownLevel: true,
            labelIDList: [],
            boardSize: boardType.id === BOARD_TYPE_NAME.M ? false : true
        });
    }

    // 筛选保存处理
    const handlerSave = (data) => {
        setFilterValue({ ...data })
    }

    // 自定义的 DrawerContent react组件
    const CustomDrawerContent = (props) => {
        // 侧边栏筛选
        return (
            <DrawerContentScrollView {...props}>
                <CustomLineFilter
                    navigation={props.navigation}
                    filterValueProp={filterValue}
                    markLabelList={markLabelList}
                    resetOnPress={handlerReset}
                    saveOnPress={handlerSave}
                    referringPage={SOURCE_SCREEN_NAME}
                />
            </DrawerContentScrollView>
        );
    }

    // 仅用作侧边栏筛选
    const Drawer = createDrawerNavigator();

    return (
        <View style={styles.drawerBox}>
            {/* 仅用作侧边栏筛选 */}
            <Drawer.Navigator
                drawerPosition="right"
                initialRouteName={SOURCE_SCREEN_NAME}
                drawerStyle={styles.drawe}
                drawerContent={(props) => <CustomDrawerContent {...props} />}
            >
                <Drawer.Screen
                    name={SOURCE_SCREEN_NAME}
                    component={ScreenContentPack}
                    options={{ swipeEnabled: false }}
                    initialParams={{ filterValue: { ...filterValue } }}
                />
            </Drawer.Navigator>
        </View>
    );
}

const mapStateToProps1 = state => {
    return {
        boardType: getBoardSettingType(state),
    };
};

export default connect(
    mapStateToProps1,
    {}
)(CompleteRecordScreen);