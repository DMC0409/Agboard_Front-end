import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Image, TextInput, useWindowDimensions, FlatList, ScrollView } from 'react-native';
import { Button, Input } from 'react-native-elements';
import { CustomLabelsGroup } from "../../components/custom-labels-group/custom-labels-group";
import { styles } from "./draft-line-part2-screen.styles";
import { http, GET, POST } from "../../common/http";
import { LINE_LEVEL_LIST } from "../../config/line";
import { Overlay } from 'react-native-elements';
import { CustomOptionList, CustomOptionSeparator } from "../../components/custom-option-list/custom-option-list";
import { connect } from "react-redux";
import { getUserInfo, getBoardSettingType, getBoardSettingAngel } from "../../redux/selectors";
import { toastMessage } from "../../common/global";
import { CHILD_LABEL_ID } from "../../config/line"
import { judgeBoardLCanToM, BOARD_TYPE_NAME } from "../../config/board"

// 视图主组件
const DraftLinePart2Screen = ({ route, navigation, userID, boardType, boardAngel }) => {
    // 屏幕尺寸
    let screenWidth = useWindowDimensions().width;
    let screenHeight = useWindowDimensions().height;

    // 岩点选择的json数据
    const [pointJsonStr, setPointJsonStr] = useState('{}');
    // 岩板角度标签数组
    const [boardAngleOptions, setBoardAngleOptions] = useState([]);
    // 难度弹出框显示控制
    const [showLevelOptions, setShowLevelOptions] = useState(false);
    // 标签选项列表
    const [labelOptions, setLabelOptions] = useState([]);
    // 表单值-难度
    const [levelValue, setLevelValue] = useState('');
    // 表单值-角度
    const [angleValue, setAngleValue] = useState(boardAngel.id || '');
    // 表单值-名称
    const [nameValue, setNameValue] = useState('');
    // 表单值-简介
    const [detailValue, setDetailValue] = useState('');
    // 表单值-标签
    const [labelValue, setLabelValue] = useState([]);
    // 名称 input message
    const [nameInputMessage, setNameInputMessage] = useState('');
    // 标签 input message
    const [labelInputMessage, setLabelInputMessage] = useState('');
    // 确认删除弹出框
    const [deleteConfirm, setDeleteConfirm] = useState(false);

    // 组件初始化
    useEffect(() => {
        // 获取岩板角度选项列表
        getAngelList();
        // 获取标签选项列表
        getLabelOptions();
    }, []);

    // 将路由参数赋值到 state
    useEffect(() => {
        setPointJsonStr(route.params.pointJsonStr);
        // 表单还原
        if (route.params.lineInfo) {
            setLevelValue(route.params.lineInfo.level);
            setNameValue(route.params.lineInfo.name);
            setDetailValue(route.params.lineInfo.introduction);
        }
    }, [route.params]);

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
                        // 表单还原
                        if (item.value === route.params.lineInfo.angelValue) {
                            setAngleValue(item.id);
                        }
                        return {
                            ...item,
                            name: item.value,
                            // 还原选择redux中的角度
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

    // 获取标签选项列表
    const getLabelOptions = () => {
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
                    const list = [...res.data].map((item) => {
                        if (route.params.lineInfo.labels) {
                            if (route.params.lineInfo.labels.indexOf(item.id) !== -1) {
                                handlerLabelSelect(item);
                            }
                        }
                        return {
                            id: item.id,
                            name: item.labelName,
                            selected: (route.params.lineInfo.labels && route.params.lineInfo.labels.indexOf(item.id) !== -1) ? true : false
                        }
                    })
                    // “儿童”标签单独选中处理
                    if (route.params.lineInfo.labels && route.params.lineInfo.labels.length !== 0) {
                        let hasChildLabel = false;
                        route.params.lineInfo.labels.forEach((temp) => {
                            if (temp === CHILD_LABEL_ID) {
                                hasChildLabel = true;
                            }
                        });
                        if (hasChildLabel === true) {
                            list.forEach((temp) => {
                                if (temp.id === CHILD_LABEL_ID) {
                                    temp.disable = false;
                                } else {
                                    temp.disable = true;
                                }
                            });
                        } else {
                            list.forEach((temp) => {
                                if (temp.id === CHILD_LABEL_ID) {
                                    temp.disable = true;
                                } else {
                                    temp.disable = false;
                                }
                            });
                        }
                    }
                    setLabelOptions(list);
                    if (route.params.lineInfo.labels) {
                        setLabelValue(route.params.lineInfo.labels);
                    }
                }
            })
            .catch((error) => {
                console.error(error);
                toastMessage(`请求失败`);
            })
    }

    // 标签选择处理
    const handlerLabelSelect = (item) => {
        // “儿童”标签单独选中处理
        if (labelValue.length === 0) {
            const list = [...labelOptions];
            if (item.id === CHILD_LABEL_ID) {
                list.forEach(label => {
                    if (label.id === CHILD_LABEL_ID) {
                        label.disable = false;
                    } else {
                        label.disable = true;
                    }
                });
            } else {
                list.forEach(label => {
                    if (label.id === CHILD_LABEL_ID) {
                        label.disable = true;
                    } else {
                        label.disable = false;
                    }
                });
            }
            setLabelOptions(list);
        }
        // 表单数据处理
        const list = [...labelValue];
        if (item.selected) {
            list.push(item.id);
        } else {
            const index = list.indexOf(item.id);
            list.splice(index, 1);
        }
        setLabelValue(list);
        // 如果取消勾选直到空数组，则放开所有标签的disable
        if (list.length === 0) {
            const temp = [...labelOptions];
            temp.forEach(label => label.disable = false);
            setLabelOptions(temp);
        }
    }

    // 验证表单内容
    const validateForm = () => {
        let isValidate = true;
        // 线路名称必填
        if (!nameValue) {
            setNameInputMessage('线路名称不能为空');
            isValidate = false;
        } else {
            setNameInputMessage('');
        }
        // 线路名字限制2-14个个字符，以及限制特殊字符使⽤。 
        if (nameValue) {
            const regEn = /[`~!@#$%^&*()_+<>?:"{},.\/;'[\]]/im,
                regCn = /[·！#￥（——）：；“”‘、，|《。》？、【】[\]]/im;
            if (nameValue.length > 14 || nameValue.length < 2 || regEn.test(nameValue) || regCn.test(nameValue)) {
                setNameInputMessage('线路名称需2-14个个字符，且不能包含特殊字符');
                isValidate = false;
            } else {
                setNameInputMessage('');
            }
        }
        // 标签必选
        if (labelValue.length === 0) {
            setLabelInputMessage('至少选择一项标签');
            isValidate = false;
        } else if (labelValue.indexOf(CHILD_LABEL_ID) !== -1 && labelValue.length >= 2) {
            // 标签“儿童”只可单独选中
            setLabelInputMessage('"儿童" 标签只能单独选中');
            isValidate = false;
        } else {
            setLabelInputMessage('');
        }
        return isValidate;
    }

    // 删除草稿线路
    const deleteLine = () => {
        http(`line/draft/delete/${route.params.lineInfo.id}`, GET)
            .then((res) => {
                // errorCode
                if (res.errCode) {
                    console.error('response error code: ', res.errCode);
                    toastMessage(`请求失败`);
                    return;
                }
                // response处理
                if (res.data) {
                    // 删除成功
                    toastMessage(`删除成功`);
                    navigation.navigate('ScreenContentForDraft', { needRefresh: true });
                } else {
                    toastMessage(`删除失败`);
                }
            })
            .catch((error) => {
                console.error(error);
                toastMessage(`请求失败`);
            })
    }

    // 保存至草稿箱
    const saveToDraft = () => {
        // 验证
        if (!validateForm()) {
            return;
        }
        // 请求
        http(`line/draft/update`, POST, {
            body: {
                id: route.params.lineInfo.id || '',
                content: pointJsonStr || '',
                name: nameValue || '',
                video: '0',
                introduction: detailValue || '',
                boardId: boardType.id || '',
                angelId: angleValue || '',
                labels: labelValue.join(',') || '',
                level: levelValue || '',
                createUser: userID || '',
                // 1抱石 2难度
                type: 1,
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
                    console.log('线路草稿箱创建成功');
                    toastMessage(`更新成功`);
                    navigation.navigate('ScreenContentForDraft', { needRefresh: true });
                } else {
                    toastMessage(`保存失败`);
                }
            })
            .catch((error) => {
                console.error(error);
                toastMessage(`请求失败`);
            })
    }

    // 保存
    const save = () => {
        // 验证
        if (!validateForm()) {
            return;
        }
        // 如果是大版还需要判断是否能兼容小板显示
        let canToM = false;
        if (boardType.id === BOARD_TYPE_NAME.L) {
            canToM = judgeBoardLCanToM(JSON.parse(pointJsonStr));
        }
        // 请求
        http(`line/draft/release`, POST, {
            body: {
                id: route.params.lineInfo.id || '',
                content: pointJsonStr || '',
                name: nameValue || '',
                video: '',
                introduction: detailValue || '',
                boardId: boardType.id || '',
                angelId: angleValue || '',
                labels: labelValue.join(',') || '',
                level: levelValue || '',
                createUser: userID || '',
                // 1抱石 2难度
                type: 1,
                // 标记可以转小板
                compatibility: canToM,
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
                    console.log('线路创建成功');
                    navigation.goBack();
                    navigation.goBack();
                    navigation.goBack();
                    navigation.navigate('ScreenContent', { needRefresh: true });
                } else {
                    toastMessage(`创建失败`);
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
                        <Text style={styles.titleText}>创建线路信息</Text>
                    </View>
                </View>
            </View>
            {/* 信息表单 */}
            <ScrollView style={styles.formBox}>
                <View style={styles.formNameBox}>
                    <View style={styles.formNameRow}>
                        <Text style={styles.formName}>名称:</Text>
                        <TextInput
                            style={styles.nameInput}
                            placeholder='填写线路名称'
                            value={nameValue}
                            onChangeText={text => setNameValue(text)}
                        />
                    </View>
                    <Text style={styles.message}>{nameInputMessage}</Text>
                </View>
                <View>
                    <View style={{ ...styles.formLabelBox }}>
                        <Text style={[styles.formName, styles.formAngelName]}>标签:</Text>
                        <CustomLabelsGroup
                            labelList={labelOptions}
                            labelOnPress={(item) => { handlerLabelSelect(item) }}
                        />
                    </View>
                    <Text style={styles.labelMessage}>{labelInputMessage}</Text>
                </View>
                <View style={styles.formAngelBox}>
                    <Text style={[styles.formName, styles.formAngelName]}>角度:</Text>
                    <View style={{ width: '88%' }}>
                        <CustomLabelsGroup
                            labelList={boardAngleOptions}
                            singleOnly={true}
                            labelOnPress={(item) => { setAngleValue(item.id) }}
                        />
                    </View>
                </View>
                <View style={styles.formLevelBox}>
                    <Text style={styles.formName}>难度:</Text>
                    <Text>
                        {
                            levelValue ?
                                (
                                    levelValue.indexOf('@') !== -1 ?
                                        (
                                            route.params.lineInfo.type === 2 ?
                                                levelValue.slice(levelValue.indexOf('@') + 1)
                                                : levelValue.slice(0, `${levelValue}`.indexOf('@'))
                                        )
                                        : levelValue
                                )
                                : '未选择难度'
                        }
                    </Text>
                    <Button
                        title="更改难度"
                        containerStyle={styles.levelButtonBox}
                        buttonStyle={styles.levelButton}
                        titleStyle={styles.levelButtonText}
                        onPress={() => { setShowLevelOptions(true) }}
                    />
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
                    <Text style={styles.formName}>简介:</Text>
                    <TextInput
                        style={styles.formRowsInput}
                        multiline
                        numberOfLines={4}
                        placeholder='填写线路简介（选填）'
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
                        title="删除"
                        containerStyle={styles.nextButtonContainer}
                        buttonStyle={[styles.nextButton, { backgroundColor: '#d81e06' }]}
                        titleStyle={styles.nextButtonText}
                        onPress={() => { setDeleteConfirm(true) }}
                    />
                    <Button
                        title="更新至草稿箱"
                        containerStyle={styles.nextButtonContainer}
                        buttonStyle={styles.nextButton}
                        titleStyle={styles.nextButtonText}
                        onPress={saveToDraft}
                    />
                    <Button
                        title="发布"
                        containerStyle={styles.nextButtonContainer}
                        buttonStyle={styles.nextButton}
                        titleStyle={styles.nextButtonText}
                        onPress={save}
                    />
                </View>
                <Overlay isVisible={deleteConfirm} onBackdropPress={() => { setDeleteConfirm(false) }}>
                    <View style={{ ...styles.overlayBox, width: screenWidth * 0.7 }}>
                        <View>
                            <Text style={styles.overlayTitle}>确认要删除此草稿线路吗？</Text>
                        </View>
                        <View style={styles.buttonGroup}>
                            <Button
                                title="取消"
                                type="clear"
                                titleStyle={styles.cancelButtonBox}
                                buttonStyle={styles.cancelButton}
                                onPress={() => setDeleteConfirm(false)}
                            />
                            <Button
                                title="确认"
                                type="clear"
                                titleStyle={styles.saveButtonBox}
                                buttonStyle={styles.saveButton}
                                onPress={() => deleteLine()}
                            />
                        </View>
                    </View>
                </Overlay>
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

export default connect(
    mapStateToProps,
    {}
)(DraftLinePart2Screen);
