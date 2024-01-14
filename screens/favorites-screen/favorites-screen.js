// 草稿箱视图
import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Image, useWindowDimensions, FlatList } from 'react-native';
import { SearchBar } from 'react-native-elements';
import { createDrawerNavigator, DrawerContentScrollView } from '@react-navigation/drawer';
import CustomLineList from "../../components/custom-line-list/custom-line-list";
import { styles } from "./favorites-screen.styles";
import { LINE_SORT_CONFIG } from "../../config/line";
import CustomLineFilter from "../../components/custom-line-filter/custom-line-filter";
import { http, GET, POST } from "../../common/http";
import { connect } from "react-redux";
import { getUserInfo, getBoardSettingType, getBoardSettingAngel } from "../../redux/selectors";
import { LINE_LEVEL_LIST, PAGE_SIZE } from "../../config/line";
import { Overlay } from 'react-native-elements';
import { toastMessage } from "../../common/global";
import { BOARD_TYPE_NAME } from "../../config/board";

// 当前页面的route name
const SOURCE_SCREEN_NAME = 'ScreenContentForLike'

// 视图内容组件
const ScreenContent = ({ route, navigation, userID, boardType, boardAngel }) => {
    // 屏幕尺寸
    let screenWidth = useWindowDimensions().width;
    let screenHeight = useWindowDimensions().height;
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

    // 线路列表
    const [lineList, setLineList] = useState([]);
    // 搜索框值
    const [searchValue, setSearchValue] = useState('');
    // 是否显示排序列表
    const [sortIsVisible, setSortIsVisible] = useState(false);
    // 是否显示角度列表
    const [angelIsVisible, setAngelIsVisible] = useState(false);
    // 岩板角度选项列表 [{id: string, value: string}]
    const [boardAngleOptions, setBoardAngleOptions] = useState([]);
    // 当前选择的排序值 {type: '', name: '', value: ''}
    const [sortValue, setSortValue] = useState({ type: '', name: '', value: '' });
    // 当前选择的角度 {id: '', name: ''}
    const [angelValue, setAngelValue] = useState(boardAngel.id ? { ...boardAngel } : { id: '', name: '角度' });
    // 在等待加载新数据时将此属性设为 true，列表就会显示出一个正在加载的符号
    const [refreshing, setRefreshing] = useState(false);
    // 标志用户操作的排序条件是否变化，用于重新获取列表
    const [orderChange, setOrderChange] = useState(false);
    // 线路列表当前加载到第几页
    const [pageIndex, setPageIndex] = useState(0);
    // 当前线路列表所用的请求参数，用于线路展示页面的左滑右滑
    const [currentListParam, setCurrentListParam] = useState(undefined);
    // 标志线路列表是否到尾部
    const [listIsTail, setListIsTail] = useState(false);
    // 标志线路是否需要回到顶部
    const [listNeedHeader, setListNeedHeader] = useState(false);

    // 初始化
    useEffect(() => {
        // 初始化排序选择值
        const initSortValue = LINE_SORT_CONFIG[0];
        setSortValue(initSortValue);
        // 获取角度列表
        getAngelList();
    }, []);

    // 监视值-用户选择的岩板角度 form redux
    useEffect(() => {
        // 初始化角度选择值
        boardAngel.id && setAngelValue({ ...boardAngel });
    }, [boardAngel]);

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
            setCurrentFilterValue(route.params.filterValue);
        }
    }, [route.params]);

    // 当排序或角度排序更新时触发，重新请求列表
    useEffect(() => {
        if (orderChange === true) {
            getLineList();
            setOrderChange(false);
        }
    }, [orderChange]);

    // 获取角度列表
    const getAngelList = () => {
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
                    res.data.unshift({ id: '-1', value: '全部角度' });
                    setBoardAngleOptions([...res.data].map((item) => {
                        return {
                            ...item,
                            name: item.value,
                        }
                    }));
                }
            })
            .catch((error) => {
                console.error(error);
                toastMessage(`请求失败`);
            })
    };

    // 获取线路列表
    const getLineList = (pageIndex = 0) => {
        // 检查校验
        if (!boardType.id || !angelValue.id) {
            return;
        }
        setRefreshing(true);
        // 组装数据
        let video = '';
        let type = 0;
        let creater = '';
        let labels = [];
        let levels = [];
        let boardTypeID = boardType.id;
        if (currentFilterValue) {
            if (currentFilterValue.haveVideo) {
                video = '1'
            }
            if (currentFilterValue.normalLineOnly) {
                type = 1
            }
            if (currentFilterValue.levelLineOnly) {
                type = 2
            }
            if (currentFilterValue.boardSize) {
                boardTypeID = ''
            }
            creater = currentFilterValue.creater || '';
            labels = currentFilterValue.labelIDList || [];
            const levelExtreme = currentFilterValue.levelValue;
            if (levelExtreme && levelExtreme.length) {
                levels = [...LINE_LEVEL_LIST].splice(levelExtreme[0], (levelExtreme[1] - levelExtreme[0]) + 1);
                if (currentFilterValue.unknownLevel && currentFilterValue.unknownLevel === true) {
                    levels.push('');
                }
            }
        }
        let orderAvgScore = '';
        let orderLevel = '';
        let orderCreateTime = '';
        let orderComplete = '';
        let orderCollect = '';
        let orderCert = '';
        sortValue.type
        if (sortValue.type === 'level') {
            orderLevel = sortValue.value;
        } else if (sortValue.type === 'score') {
            orderAvgScore = sortValue.value;
        } else if (sortValue.type === 'time') {
            orderCreateTime = sortValue.value;
        } else if (sortValue.type === 'complete') {
            orderComplete = sortValue.value;
        } else if (sortValue.type === 'collect') {
            orderCollect = sortValue.value;
        } else if (sortValue.type === 'cert') {
            orderCert = sortValue.value;
        }
        // 请求
        const requstParam = {
            // 搜索的线路名称
            name: searchValue || '',
            // 有无视频: '1'有, '0'无, ''不筛选
            video: video,
            // 0显示全部 1显示抱石 2显示难度
            type: type,
            // 筛选的创建人
            username: creater,
            // 筛选的难度范围
            levels: levels,
            // 筛选的标签
            labels: labels,
            // 板类型id
            boardId: boardTypeID,
            // 板角度id（筛选）
            angelId: '',
            // 当前的页数
            index: pageIndex,
            // 每页的展示数
            pageSize: PAGE_SIZE,
            // 角度排序（优先排序）
            orderAngel: angelValue.id === '-1' ? '' : angelValue.id,
            // 难度排序
            orderLevel: orderLevel,
            // 评分排序
            orderAvgScore: orderAvgScore,
            // 创建排序
            orderCreateTime: orderCreateTime,
            // 完成排序
            orderComplete: orderComplete,
            // 收藏排序
            orderCollect: orderCollect,
            // 认证排序
            orderCert: orderCert,
            // 用户ID
            userID: userID,
            createUser: '',
            collector: userID,
            completer: ''
        }
        setCurrentListParam({ ...requstParam });
        http(`line/lines`, POST, {
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

    // 排序背景点击事件处理
    const handlerBackdropPress = () => {
        setAngelIsVisible(false);
        setSortIsVisible(false);
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

    // 排序or角度列表项的分割线组件
    const OptionSeparator = () => {
        return <View style={styles.separator}></View>;
    };

    // 排序列表组件
    const SortList = () => {
        // 我的列表视图
        const ListItem = ({ item }) => {
            // 列表项点击处理
            const handleListPress = (item) => {
                setSortValue(item);
                setSortIsVisible(false);
                setOrderChange(true);
            }
            return (
                <TouchableOpacity style={styles.optionBox} onPress={() => handleListPress(item)}>
                    <View style={styles.option}>
                        <Text style={[styles.optionLable, sortValue.name === item.name ? styles.optionLableSelected : {}]}>
                            {item.name}
                        </Text>
                    </View>
                    {sortValue.name === item.name &&
                        <Image source={require('../../static/img/common-icons/select-blue.png')} style={styles.arrowRight}></Image>
                    }
                </TouchableOpacity>
            )
        };
        return (
            <View style={styles.optionList}>
                <FlatList
                    data={[...LINE_SORT_CONFIG]}
                    renderItem={ListItem}
                    keyExtractor={item => item.name}
                    ItemSeparatorComponent={OptionSeparator}
                />
            </View>
        )
    }

    // 角度列表组件
    const AngelList = () => {
        // 我的列表视图
        const ListItem = ({ item }) => {
            // 列表项点击处理
            const handleListPress = (item) => {
                setAngelValue(item);
                setAngelIsVisible(false);
                setOrderChange(true);
            }
            return (
                <TouchableOpacity style={styles.optionBox} onPress={() => handleListPress(item)}>
                    <View style={styles.option}>
                        <Text style={[styles.optionLable, angelValue.id === item.id ? styles.optionLableSelected : {}]}>
                            {item.name}
                        </Text>
                    </View>
                    {angelValue.id === item.id &&
                        <Image source={require('../../static/img/common-icons/select-blue.png')} style={styles.arrowRight}></Image>
                    }
                </TouchableOpacity>
            )
        };
        return (
            <View style={styles.optionList}>
                <FlatList
                    data={boardAngleOptions}
                    renderItem={ListItem}
                    keyExtractor={item => item.id}
                    ItemSeparatorComponent={OptionSeparator}
                />
            </View>
        )
    }

    // 返回react组件
    return (
        <View style={styles.box}>
            {/* 搜索栏 */}
            <View style={styles.searchBox}>
                <View style={{ width: screenWidth - 50 }}>
                    <SearchBar
                        placeholder="线路名称"
                        onChangeText={(e) => { setSearchValue(e) }}
                        onSubmitEditing={() => { getLineList() }}
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
                    <TouchableOpacity onPress={() => { getLineList() }}>
                        <Text style={styles.searchBtnText}>搜索</Text>
                    </TouchableOpacity>
                </View>
            </View>
            {/* 排序筛选栏 */}
            <View style={styles.sortBarBox}>
                {/* 排序 */}
                <TouchableOpacity style={[styles.sortOrFilterItem, { width: '35%' }]} onPress={() => setSortIsVisible(true)}>
                    <Text style={[styles.sortOrFilterText, sortIsVisible ? styles.sortOrFilterSelected : {}]}>{sortValue.name}</Text>
                    {sortIsVisible ?
                        <Image source={require('../../static/img/common-icons/arrow-up-filling.png')} style={styles.sortIcon}></Image> :
                        <Image source={require('../../static/img/common-icons/arrow-down-filling.png')} style={styles.sortIcon}></Image>}
                </TouchableOpacity>
                {/* 角度 */}
                <TouchableOpacity style={[styles.sortOrFilterItem, { width: '35%' }]} onPress={() => setAngelIsVisible(true)}>
                    <Text style={[styles.sortOrFilterText, angelIsVisible ? styles.sortOrFilterSelected : {}]}>{angelValue.name}</Text>
                    {angelIsVisible ?
                        <Image source={require('../../static/img/common-icons/arrow-up-filling.png')} style={styles.sortIcon}></Image> :
                        <Image source={require('../../static/img/common-icons/arrow-down-filling.png')} style={styles.sortIcon}></Image>}
                </TouchableOpacity>
                {/* 筛选 */}
                <TouchableOpacity style={[styles.sortOrFilterItem, { width: '30%' }]} onPress={() => navigation.openDrawer()}>
                    <Text style={styles.sortOrFilterText}>筛选</Text>
                    <Image source={require('../../static/img/common-icons/filter.png')} style={styles.filterIcon}></Image>
                </TouchableOpacity>
                {/* 排序和角度排序的 Overlay */}
                <Overlay
                    isVisible={angelIsVisible || sortIsVisible}
                    backdropStyle={styles.overlayBackdrop}
                    overlayStyle={styles.overOverlay}
                    onBackdropPress={() => handlerBackdropPress()}
                    children={sortIsVisible ? <SortList /> : <AngelList />}
                >
                </Overlay>
            </View>
            {/* 线路列表 */}
            <View style={styles.lineListBox}>
                <CustomLineList
                    navigation={navigation}
                    lineList={lineList}
                    onPress={(item, index) => {
                        navigation.navigate('LineLayoutScreen', {
                            lineInfo: item,
                            sourceScreenName: SOURCE_SCREEN_NAME,
                            index: index,
                            listParam: currentListParam,
                        })
                    }}
                    onRefresh={getLineList}
                    refreshing={refreshing}
                    onEndReached={getMoreLines}
                    isTail={listIsTail}
                    needHeader={listNeedHeader}
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
const FavoritesScreen = ({ navigation, boardType }) => {
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
)(FavoritesScreen);