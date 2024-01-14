// 设置视图
import React, { useState, useRef, useEffect } from "react";
import { View, Text, Image, FlatList, ScrollView } from 'react-native';
import { useWindowDimensions } from 'react-native';
import { ButtonGroup } from "react-native-elements";
import { styles } from "./ranking-screen.styles";
import { DEFAULT_AVATER } from "../../config/mine";
import { AVATAR_IMG_URL } from "../../config/http";
import { getUserToken } from "../../redux/selectors";
import { connect } from "react-redux";
import { http, GET, POST } from "../../common/http";
import { toastMessage } from "../../common/global";

// 视图主组件
const RankingScreen = ({ navigation, userToken }) => {
    // 屏幕宽度
    let screenWidth = useWindowDimensions().width;

    // tabs定义
    const TABS = [
        { element: () => <Text style={tabIndex === 0 ? [styles.tabSelectedText] : []}>完成榜</Text> },
        { element: () => <Text style={tabIndex === 1 ? [styles.tabSelectedText] : []}>难度榜</Text> },
        { element: () => <Text style={tabIndex === 2 ? [styles.tabSelectedText] : []}>设计榜</Text> }
    ];

    // 排行榜类型
    const RANKING_TYPE = {
        // 设计总数:3、难度:2、完成总数:1
        SINGE: '3',
        LEVEL: '2',
        FINISH: '1'
    }

    // 利用 Effect Hook 使用 state
    // 当前选择的tab索引
    const [tabIndex, setTabIndex] = useState(0);
    // 排行榜信息数据
    const [singeRankingIData, setSingeRankingIData] = useState([]);
    // 排行榜信息数据
    const [levelRankingIData, setLevelRankingIData] = useState([]);
    // 排行榜信息数据
    const [finishRankingIData, setFinishRankingIData] = useState([]);

    // 利用 Hook 使用 ref 对元素的引用
    const scrollViewEl = useRef(null);

    // 组件初始化
    useEffect(() => {
        // 补足排行榜信息数据数组
        setSingeRankingIData(createRankingIData(singeRankingIData));
        setLevelRankingIData(createRankingIData(levelRankingIData));
        setFinishRankingIData(createRankingIData(finishRankingIData));
        // 获取当前月份的排行榜信息
        getRankingInfo(RANKING_TYPE.FINISH, setFinishRankingIData);
        getRankingInfo(RANKING_TYPE.LEVEL, setLevelRankingIData);
        getRankingInfo(RANKING_TYPE.SINGE, setSingeRankingIData);
    }, []);

    // 补足排行榜信息数据数组元素到10个元素
    const createRankingIData = (oldList) => {
        const newList = [...oldList] || [];
        while (newList.length < 10) {
            newList.push({
                userName: '',
                avatar: '',
                highLevel: '',
                completeCount: '',
                designCount: '',
                value: ''
            });
            if (newList.length >= 10) {
                return newList;
            }
        }
        return newList;
    }

    // 获取当前月份的排行榜信息
    const getRankingInfo = (orderType, setData) => {
        // 获取当前年月
        const year = new Date().getFullYear();
        const month = new Date().getMonth() + 1;
        // 设计总数:3、难度:2、完成总数:1
        http(`ranking/rankings/${orderType}/${year}/${month}`, GET)
            .then((res) => {
                // errorCode
                if (res.errCode) {
                    console.error('response error code: ', res.errCode);
                    toastMessage(`请求失败`);
                    return;
                }
                // response处理
                if (res.data) {
                    const data = [...res.data]
                    data.forEach((item) => {
                        switch (orderType) {
                            case RANKING_TYPE.FINISH:
                                item.value = item.completeCount
                                break;
                            case RANKING_TYPE.LEVEL:
                                item.value = item.highLevel
                                break;
                            case RANKING_TYPE.SINGE:
                                item.value = item.designCount
                                break;
                            default:
                                item.value = '0';
                                break;
                        }
                    });
                    setData(createRankingIData(data));
                }
            })
            .catch((error) => {
                console.error(error);
                toastMessage(`请求失败`);
            })
    }

    // 列表视图
    const ListRenderItem = ({ item, index }) => {
        return (
            <View style={styles.listBox}>
                <View style={styles.listItem}>
                    {item.avatar ?
                        <Image
                            source={{
                                uri: `${AVATAR_IMG_URL}${item.avatar}`,
                                headers: { 'Authorization': userToken }
                            }}
                            style={styles.listImg}
                        ></Image>
                        :
                        <Image source={DEFAULT_AVATER} style={styles.listImg}></Image>
                    }
                    <Text style={styles.listLable}>No.{index + 4} {item.userName || '暂无'}</Text>
                </View>
                <View style={styles.countBox}>
                    <Text style={styles.listLable}>{item.count}</Text>
                </View>
            </View>
        );
    };

    // 列表分割线
    const CustomOptionSeparator = () => {
        return <View style={styles.separator}></View>;
    };

    // 页面左右滑动事件
    const handlerScroll = (e) => {
        // 求出水平方向上的偏移量
        const offSetX = e.nativeEvent.contentOffset.x;
        // 计算当前页码
        const currentPage = (offSetX / screenWidth).toFixed(0);
        // 设置当前选择tab
        setTabIndex(parseInt(currentPage));
    };

    // 点击 tab 触发
    const handlerTabPress = (e) => {
        setTabIndex(e);
        scrollViewEl.current.scrollTo({ x: (e) * screenWidth, y: 0, animated: true });
    }

    // 排行榜容器组件
    const RankingContent = ({ data }) => {
        return (
            <View style={{ width: screenWidth }}>
                {data.length !== 0 &&
                    <View style={{ flex: 1 }}>
                        {/* 排行榜列表 */}
                        <View style={{ backgroundColor: '#FFFFFF', flex: 1 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 20 }}>
                                {/* 第二名 */}
                                <View style={{ alignItems: 'center', justifyContent: 'flex-end', width: '38%' }}>
                                    {data[1].avatar ?
                                        <Image
                                            source={{
                                                uri: `${AVATAR_IMG_URL}${data[1].avatar}`,
                                                headers: { 'Authorization': userToken }
                                            }}
                                            style={styles.headerIcon}
                                        ></Image>
                                        :
                                        <Image source={DEFAULT_AVATER} style={styles.headerIcon}></Image>
                                    }
                                    <Text style={{ fontSize: 13 }}>No2：{data[1].userName || '暂无'}</Text>
                                    <Text style={{ fontSize: 13, fontWeight: 'bold' }}>{data[1].value}</Text>
                                </View>
                                {/* 第一名 */}
                                <View style={{ alignItems: 'center', justifyContent: 'flex-end', width: '24%', marginBottom: 10 }}>
                                    {data[0].avatar ?
                                        <Image
                                            source={{
                                                uri: `${AVATAR_IMG_URL}${data[0].avatar}`,
                                                headers: { 'Authorization': userToken }
                                            }}
                                            style={styles.hearderIconFirst}
                                        ></Image>
                                        :
                                        <Image source={DEFAULT_AVATER} style={styles.hearderIconFirst}></Image>
                                    }
                                    <Text style={{ fontSize: 14 }}>No1：{data[0].userName || '暂无'}</Text>
                                    <Text style={{ fontSize: 14, fontWeight: 'bold' }}>{data[0].value}</Text>
                                </View>
                                {/* 第三名 */}
                                <View style={{ alignItems: 'center', justifyContent: 'flex-end', width: '38%' }}>
                                    {data[2].avatar ?
                                        <Image
                                            source={{
                                                uri: `${AVATAR_IMG_URL}${data[2].avatar}`,
                                                headers: { 'Authorization': userToken }
                                            }}
                                            style={styles.headerIcon}
                                        ></Image>
                                        :
                                        <Image source={DEFAULT_AVATER} style={styles.headerIcon}></Image>
                                    }
                                    <Text style={{ fontSize: 13 }}>No3：{data[2].userName || '暂无'}</Text>
                                    <Text style={{ fontSize: 13, fontWeight: 'bold' }}>{data[2].value}</Text>
                                </View>
                            </View>
                            <View style={styles.separator}></View>
                            <FlatList
                                data={data.slice(3)}
                                renderItem={ListRenderItem}
                                keyExtractor={(item, index) => String(index)}
                                ItemSeparatorComponent={CustomOptionSeparator}
                            />
                        </View>
                    </View>
                }
            </View>
        );
    }

    // 返回react组件
    return (
        <View style={{ flex: 1 }}>
            <View style={{ backgroundColor: '#808080' }}>
                <ButtonGroup
                    selectedButtonStyle={{ backgroundColor: '#fff' }}
                    selectedTextStyle={{}}
                    innerBorderStyle={{ width: 0 }}
                    onPress={(e) => { handlerTabPress(e) }}
                    selectedIndex={tabIndex}
                    buttons={TABS}
                    containerStyle={{ height: 35, marginHorizontal: 0, marginVertical: 0, borderRadius: 0 }} />
            </View>
            <View style={{ flex: 1 }}>
                <ScrollView
                    ref={scrollViewEl}
                    horizontal={true}
                    pagingEnabled={true}
                    showsHorizontalScrollIndicator={false}
                    onMomentumScrollEnd={(e) => { handlerScroll(e) }}>
                    <RankingContent data={finishRankingIData} />
                    <RankingContent data={levelRankingIData} />
                    <RankingContent data={singeRankingIData} />
                </ScrollView>
            </View>
        </View>

    );
}

const mapStateToProps = state => {
    return { userToken: getUserToken(state) };
};

export default connect(
    mapStateToProps,
    {}
)(RankingScreen);