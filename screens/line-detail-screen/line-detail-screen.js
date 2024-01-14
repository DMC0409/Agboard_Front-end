import React, { useState, useEffect } from "react";
import { View, FlatList, Text, TouchableOpacity, Image, useWindowDimensions } from 'react-native';
import { styles } from "./line-detail-screen.styles";
import { http, GET, POST } from "../../common/http";
import { CustomOptionList, CustomOptionSeparator } from "../../components/custom-option-list/custom-option-list";
import { connect } from "react-redux";
import { getBoardSettingType, getBoardSettingAngel, getUserInfo } from "../../redux/selectors";
import { updateBoardSettingAngel } from "../../redux/actions";
import { toastMessage } from "../../common/global";
import { Rating } from 'react-native-ratings';
import { BarChart } from "react-native-chart-kit";

// 视图主组件
const LineDetailScreen = ({ route, navigation, userID, updateBoardSettingAngel }) => {
    // 屏幕尺寸
    let screenWidth = useWindowDimensions().width;
    let screenHeight = useWindowDimensions().height;
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
        formatYLabel: (yLabel) => {
            if (chartMaxItem === 1 && yLabel === '0.50') {
                return '0'
            }
            return String(Number(yLabel).toFixed(0))
        },
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
    const [hasChartData, setHasChartData] = useState(false);
    // 是否由图表
    const [chartMaxItem, setChartMaxItem] = useState(1);
    // 当前选中显示的icon
    const SELECTED_ICON = require('../../static/img/common-icons/select.png');

    // 岩板角度列表
    const [boardAngelList, setBoardAngelList] = useState([]);
    // 线路信息
    const [lineData, setLineData] = useState({});
    // FA信息
    const [faData, setFaData] = useState({});
    // 完成记录列表
    const [finishList, setFinishList] = useState([]);
    // 当前页数
    const [pageIndex, setPageIndex] = useState(0);
    // 在等待加载新数据时将此属性设为 true，列表就会显示出一个正在加载的符号
    const [refreshing, setRefreshing] = useState(false);

    // 组件初始化时，获取岩板类型列表
    useEffect(() => {
        // 获取线路详情
        getLineInfo(route.params.lineInfo.lineId);
        // 获取岩板角度选项列表
        getBoardAngelList();
        // 获取获取完成列表
        getFinishList(pageIndex);
    }, []);

    // 获得参数时
    useEffect(() => {
        if (!route.params) {
            return;
        }
    }, [route.params]);

    useEffect(() => {
        // 获取FA信息
        getFA_Info();
    }, [lineData]);

    // 请求-获取岩板角度选项列表
    const getBoardAngelList = () => {
        http(`angel/angels`, GET)
            .then((res) => {
                // errorCode
                if (res.errCode) {
                    console.error('response error code: ', res.errCode);
                    toastMessage(`请求失败`);
                    return;
                }
                // response处理
                if (res.data) {
                    // {id: string, value: string}
                    const baseList = [...res.data].map((item) => {
                        return {
                            ...item,
                            angelValue: item.value,
                            avgScore: 0
                        }
                    });
                    // 获取岩板角度选项列表
                    getAngelsForLine(baseList);
                }
            })
            .catch((error) => {
                console.error(error);
                toastMessage(`请求失败`);
            })
    }

    // 请求-获取完成列表
    const getFinishList = (pageIndex = 0) => {
        http(`line/complete/infos`, POST, {
            body: {
                "index": pageIndex,
                "pageSize": 10,
                "lineID": String(route.params.lineInfo.lineId)
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
                        setFinishList([...finishList, ...res.data]);
                    } else {
                        setPageIndex(pageIndex - 1);
                    }
                } else {
                    // 刷新数据
                    setPageIndex(0);
                    if (!res.data) {
                        res.data = [];
                    }
                    setFinishList(res.data);
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
            getFinishList(pageIndex + 1);
        }
    }

    // 请求-获取FA信息
    const getFA_Info = () => {
        http(`line/complete/user/${route.params.lineInfo.lineId}`, GET)
            .then((res) => {
                // errorCode
                if (res.errCode) {
                    console.error('response error code: ', res.errCode);
                    toastMessage(`请求失败`);
                    return;
                }
                // response处理
                if (res.data) {
                    setFaData(res.data);
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
                                item.level = lineData.level || '';
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
                            setHasChartData(true);
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

    // 获取线路详情
    const getLineInfo = (lineID) => {
        http(`line/info/${lineID}/${userID}`, GET)
            .then((res) => {
                // errorCode
                if (res.errCode) {
                    console.error('response error code: ', res.errCode);
                    toastMessage(`请求失败`);
                    return;
                }
                // response处理
                if (res.data) {
                    setLineData({ ...route.params.lineInfo, ...res.data });
                }
            })
            .catch((error) => {
                console.error(error);
                toastMessage(`请求失败`);
            })
    }

    // 获取线路各个角度的信息
    const getAngelsForLine = (baseList) => {
        http(`line/infos/${route.params.lineInfo.lineId}/${userID}`, GET)
            .then((res) => {
                // errorCode
                if (res.errCode) {
                    console.error('response error code: ', res.errCode);
                    toastMessage(`请求失败`);
                    return;
                }
                // response处理
                if (res.data) {
                    const resList = [];
                    res.data.forEach((item) => {
                        baseList.forEach((baseItem, index) => {
                            if (item.angelValue === baseItem.angelValue) {
                                resList[index] = { ...item }
                            } else {
                                resList[index] = { ...baseItem }
                            }
                        });
                    });
                    setBoardAngelList(resList);
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

    // 列表视图
    const ListRenderItem = ({ item }) => {
        // 列表项点击事件
        const handlerListItem = () => {

        }

        return (
            <View style={styles.optionBox} onPress={handlerListItem}>
                <View style={styles.option}>
                    <Image source={require('../../static/img/common-icons/select-blue.png')} style={{ height: 25, width: 25, marginRight: 8 }}></Image>
                </View>
                <View style={{ flex: 1 }}>
                    <View>
                        <TouchableOpacity onPress={() => gotoPresentationPage('1')}><Text>{item.username}</Text></TouchableOpacity>
                    </View>
                    <View>
                        <Text style={{ color: '#000' }}>{item.completeTime}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text>{item.level || lineData.level || ''}&nbsp;&nbsp;{item.angelValue}&nbsp;&nbsp;{item.num === 1 ? 'Flash' : item.num + '次' || ''}</Text>
                        {item.num === 1 &&
                            <Image source={require('../../static/img/common-icons/lightning.png')} style={{ height: 20, width: 20 }}></Image>
                        }
                    </View>
                    <View style={{ flexDirection: 'row', alignContent: 'center' }}>
                        <Rating
                            style={{ width: 60, paddingVertical: 4 }}
                            ratingCount={5}
                            startingValue={parseFloat(item.score || 0)}
                            imageSize={12}
                            readonly={true}
                            showRating={false}
                        />
                        {!!item.notes &&
                            <Text style={{ fontStyle: 'italic', marginLeft: 10 }}>"{item.notes}"</Text>
                        }
                    </View>
                </View>
            </View>
        );
    };

    // 返回react组件
    return (
        <View style={{ flex: 1 }}>
            {/* 线路信息 */}
            <View style={{ padding: 10, backgroundColor: '#fff' }}>
                <Text style={{ fontSize: 14, paddingVertical: 2 }}>线路名称： {lineData.name}</Text>
                <Text style={{ fontSize: 14, paddingVertical: 2 }}>设计角度： {lineData.angelValue}</Text>
                <Text style={{ fontSize: 14, paddingVertical: 2 }}>创建人：    <TouchableOpacity onPress={() => gotoPresentationPage('1')}><Text>{lineData.username}</Text></TouchableOpacity></Text>
                <Text style={{ fontSize: 14, paddingVertical: 2 }}>创建时间： {lineData.createTime}</Text>
                <Text style={{ fontSize: 14, paddingVertical: 2 }}>First Ascent：{faData.username ? `${faData.username}；${faData.completeTime}` : '暂无'}</Text>
                <Text style={{ fontSize: 14, paddingVertical: 2 }}>完成人数： {faData.peopleNum || 0}</Text>
            </View>
            {hasChartData === true &&
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
                        segments={chartMaxItem <= 4 ? (chartMaxItem < 2 ? 2 : chartMaxItem) : 4}
                    />
                </View>
            }
            {/* 列表 */}
            <View style={{ backgroundColor: '#fff', marginTop: 10 }}>
                <FlatList
                    data={finishList}
                    renderItem={ListRenderItem}
                    keyExtractor={(item, index) => index}
                    ItemSeparatorComponent={CustomOptionSeparator}
                    onRefresh={getFinishList}
                    refreshing={refreshing}
                    onEndReached={getMoreLines}
                    onEndReachedThreshold={0.25}
                />
            </View>
        </View>
    );
}

const mapStateToProps = state => {
    return {
        currentBoardType: getBoardSettingType(state),
        currentAngelType: getBoardSettingAngel(state),
        userID: getUserInfo(state).userID
    };
};

export default connect(
    mapStateToProps,
    { updateBoardSettingAngel }
)(LineDetailScreen);