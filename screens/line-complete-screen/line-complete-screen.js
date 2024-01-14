import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Image, TextInput, useWindowDimensions, FlatList, ScrollView } from 'react-native';
import { Button, Input } from 'react-native-elements';
import { CustomLabelsGroup } from "../../components/custom-labels-group/custom-labels-group";
import { styles } from "./line-complete-screen.styles";
import { http, GET, POST } from "../../common/http";
import { LINE_LEVEL_LIST } from "../../config/line";
import { Overlay } from 'react-native-elements';
import { CustomOptionList, CustomOptionSeparator } from "../../components/custom-option-list/custom-option-list";
import { connect } from "react-redux";
import { getUserInfo, getBoardSettingAngel } from "../../redux/selectors";
import { AirbnbRating } from 'react-native-ratings';
import { toastMessage } from "../../common/global";

// 视图主组件
const LineCompleteScreen = ({ route, navigation, userID, boardAngel }) => {
    // 屏幕尺寸
    let screenWidth = useWindowDimensions().width;
    let screenHeight = useWindowDimensions().height;

    const [FLASH_OPTION, setFLASH_OPTION] = useState([
        {
            id: 1,
            name: 'Flash',
            selected: false
        },
        {
            id: 2,
            name: '2次',
            selected: false
        },
        {
            id: 3,
            name: '3次',
            selected: false
        },
        {
            id: 4,
            name: '4次',
            selected: false
        },
        {
            id: 5,
            name: '5次',
            selected: false
        },
        {
            id: 6,
            name: '6+',
            selected: false
        },
    ]);

    // 岩板角度标签数组
    const [boardAngleOptions, setBoardAngleOptions] = useState([]);
    // 难度弹出框显示控制
    const [showLevelOptions, setShowLevelOptions] = useState(false);
    // 表单值-难度
    const [levelValue, setLevelValue] = useState(boardAngel.level || '');
    // 表单值-评分
    const [starValue, setStarValue] = useState(0);
    // 表单值-角度
    const [angleValue, setAngleValue] = useState({ id: '', name: '' });
    // 表单值-完成次数
    const [numValue, setNumValue] = useState(0);
    // 表单值-简介
    const [detailValue, setDetailValue] = useState('');
    // 线路信息
    const [lineInfo, setLineInfo] = useState({});
    // 该线路的不同角度列表信息
    const [lineAngels, setLineAngels] = useState([]);
    // 用户是否可以编辑难度
    const [canEditLevel, setCanEditLevel] = useState(false);
    // 当前选择的角度的line_info_id
    const [lineInfoId, setLineInfoID] = useState('');
    // 校验 message
    const [message, setMessage] = useState('');
    // 未评星 message
    const [messageForStar, setMessageForStar] = useState('');
    // 未选完成次数 message
    const [messageForNum, setMessageForNum] = useState('');

    // 组件初始化
    useEffect(() => {
        // 获取岩板角度选项列表
        getAngelList();
        // 获取线路在不同角度下的既有难度
        getLevelForLine();
    }, []);

    // 将线路信息参数赋值到 state
    useEffect(() => {
        setLineInfo(route.params.lineInfo)
    }, [route.params]);

    // 当角度变化时
    useEffect(() => {
        refelshLevelValue(lineAngels);
    }, [angleValue]);

    // 当完成次数变化时
    useEffect(() => {
        FLASH_OPTION.forEach(item => {
            if (item.id === numValue) {
                item.selected = true;
            } else {
                item.selected = false;
            }
        })
        if (numValue) {
            setMessageForNum('');
        }
    }, [numValue]);

    // 刷新对应角度的难度表单项
    const refelshLevelValue = (lineAngels) => {
        if (lineAngels && lineAngels.length) {
            let findIt = false;
            lineAngels.forEach((item) => {
                if (item.angelValue === angleValue.name) {
                    findIt = true;
                    if (!item.level) {
                        setCanEditLevel(false);
                        setLevelValue('');
                    } else {
                        setCanEditLevel(true);
                        setLevelValue(item.level);
                    }
                    // 记录该角度的lineInfoID
                    setLineInfoID(item.lineInfoId);
                }
            })
            if (!findIt) {
                setCanEditLevel(false);
                setLevelValue('');
                // 记录该角度的lineInfoID
                setLineInfoID('');
            }
        }
    }

    // 获取岩板角度选项列表
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
                    setBoardAngleOptions([...res.data].map((item) => {
                        // 默认选择这个岩板的角度
                        if (item.value === route.params.lineInfo.angelValue) {
                            setAngleValue({ ...item });
                        }
                        return {
                            ...item,
                            name: item.value,
                            // 默认选择这个岩板的角度
                            selected: item.value === route.params.lineInfo.angelValue ? true : false
                        }
                    }));
                }
            })
            .catch((error) => {
                console.error(error);
                toastMessage(`请求失败`);
            })
    }

    // 获取线路在不同角度下的既有难度
    const getLevelForLine = () => {
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
                    setLineAngels(res.data);
                    refelshLevelValue(res.data);
                }
            })
            .catch((error) => {
                console.error(error);
                toastMessage(`请求失败`);
            })
    }

    // 验证表单内容
    const validateForm = () => {
        let res = true;
        if (!levelValue) {
            setMessage('难度不能为空');
            res = false;
        }
        if (!starValue) {
            setMessageForStar('请评价星级');
            res = false;
        }
        if (!numValue) {
            setMessageForNum('请选择完成使用次数');
            res = false;
        }
        return res;
    }

    // 完成线路
    const save = () => {
        // 验证
        if (!validateForm()) {
            return;
        }
        // 请求
        http(`line/complete/insert`, POST, {
            body: {
                Id: '',
                lineID: lineInfo.lineId || '',
                userId: userID,
                notes: detailValue,
                score: starValue,
                level: levelValue,
                angelId: angleValue.id,
                lineInfoId: lineInfoId || '',
                num: numValue
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
                    // 完成成功
                    navigation.navigate(route.params.sourceScreenName, { needRefresh: true });
                } else {
                    // 完成失败
                    toastMessage(`操作失败`);
                }
            })
            .catch((error) => {
                console.error(error);
                toastMessage(`请求失败`);
            })
    }

    // 难度列表视图
    const ListRenderItem = ({ item }) => {
        // 当前选择的图标
        const selectedIcon = require('../../static/img/common-icons/select-blue.png');
        // 列表项点击处理
        const handleListPress = (item) => {
            setLevelValue(item);
            setMessage('');
            setShowLevelOptions(false);
        }

        return <CustomOptionList
            listItem={{ id: '', name: item, icon: levelValue === item ? selectedIcon : null }}
            hideArrow={true}
            onPress={() => handleListPress(item)}
        />;
    };

    // 返回react组件
    return (
        <View style={styles.box}>
            {/* 顶部导航栏，标题 */}
            <View style={styles.titleBox}>
                <View style={styles.titleSubBox}>
                    <TouchableOpacity style={styles.backButtonBox} onPress={navigation.goBack}>
                        <Image
                            source={require('../../static/img/common-icons/arrow-left-bold.png')}
                            style={styles.backButtonIcon}
                        ></Image>
                    </TouchableOpacity>
                    <View style={styles.titleTextBox}>
                        <Text style={styles.titleText}>填写完成信息</Text>
                    </View>
                </View>
            </View>
            {/* 信息表单 */}
            <ScrollView style={styles.formBox}>
                <View style={styles.formAngelBox}>
                    <Text style={[styles.formName, styles.formAngelName]}>角度:</Text>
                    <View style={{ width: '88%' }}>
                        <CustomLabelsGroup
                            labelList={boardAngleOptions}
                            singleOnly={true}
                            labelOnPress={(item) => { setAngleValue({...item}) }}
                        />
                    </View>
                </View>
                <View style={{ ...styles.formAngelBox, flexDirection: 'column' }}>
                    <Text style={[styles.formName, styles.formAngelName]}>完成使用次数:</Text>
                    <View style={{ width: 0.88 * screenWidth, marginLeft: 0.12 * screenWidth }}>
                        <CustomLabelsGroup
                            labelList={FLASH_OPTION}
                            singleOnly={true}
                            labelOnPress={(item) => { setNumValue(item.id) }}
                        />
                    </View>
                    <Text style={{ ...styles.message, marginLeft: 0.12 * screenWidth }}>{messageForNum}</Text>
                </View>
                <View style={styles.formLevelBox}>
                    <Text style={styles.formName}>评价:</Text>
                    <AirbnbRating
                        count={5}
                        defaultRating={starValue}
                        size={22}
                        showRating={false}
                        onFinishRating={(value) => { setStarValue(parseInt(value)); setMessageForStar(''); }}
                    />
                    <Text style={styles.message}>{messageForStar}</Text>
                </View>
                <View style={styles.formLevelBox}>
                    <Text style={styles.formName}>难度:</Text>
                    <Text>
                        {
                            levelValue ?
                                (
                                    levelValue.indexOf('@') !== -1 ?
                                        (
                                            lineInfo.type === 2 ?
                                                levelValue.slice(levelValue.indexOf('@') + 1)
                                                : levelValue.slice(0, `${levelValue}`.indexOf('@'))
                                        )
                                        : levelValue
                                )
                                : '未知难度'
                        }
                    </Text>
                    <Button
                        title="指定难度"
                        containerStyle={styles.levelButtonBox}
                        buttonStyle={styles.levelButton}
                        titleStyle={styles.levelButtonText}
                        onPress={() => { setShowLevelOptions(true) }}
                    />
                    <Text style={styles.message}>{message}</Text>
                </View>
                {/* 难度选择弹出框 */}
                <Overlay
                    isVisible={showLevelOptions}
                    overlayStyle={[styles.overOverlay, { width: 0.8 * screenWidth, height: 0.7 * screenHeight }]}
                    onBackdropPress={() => setShowLevelOptions(false)}
                >
                    <FlatList
                        data={LINE_LEVEL_LIST}
                        renderItem={ListRenderItem}
                        keyExtractor={item => item}
                        ItemSeparatorComponent={CustomOptionSeparator}
                    />
                </Overlay>
                <View style={styles.formDetailBox}>
                    <Text style={styles.formName}>笔记:</Text>
                    <TextInput
                        style={styles.formRowsInput}
                        multiline
                        numberOfLines={4}
                        placeholder='完成笔记（选填）'
                        value={detailValue}
                        onChangeText={text => setDetailValue(text)}
                    />
                </View>
            </ScrollView>
            {/* 底部操作栏 */}
            <View style={styles.actionBox}>
                {/* 左侧操作集合 */}
                <View style={styles.actiongBoxLeft}></View>
                {/* 右侧 */}
                <View style={styles.actiongBoxRight}>
                    <Button
                        title="完成"
                        icon={<Image source={require('../../static/img/common-icons/complete-white.png')} style={styles.companyIcon}></Image>}
                        containerStyle={styles.nextButtonContainer}
                        buttonStyle={styles.nextButton}
                        titleStyle={styles.nextButtonText}
                        onPress={save}
                    />
                </View>
            </View>
        </View>
    );
}

const mapStateToProps = state => {
    return {
        ...getUserInfo(state),
        boardAngel: getBoardSettingAngel(state)
    };
};

export default connect(
    mapStateToProps,
    {}
)(LineCompleteScreen);
