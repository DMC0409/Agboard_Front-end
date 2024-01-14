// 设置视图
import React, { useState, useEffect } from "react";
import { View, FlatList, TextInput, useWindowDimensions, Image, Text } from 'react-native';
import { CustomOptionList, CustomOptionSeparator } from "../../components/custom-option-list/custom-option-list";
import { CustomButton } from "../../components/custom-button/custom-button";
import { styles } from "./setting-screen.styles";
import { romoveUserToken, romoveUserInfo } from "../../common/user";
import { resetUserData } from "../../redux/actions";
import { connect } from "react-redux";
import { SETTING_LIST_COMMON, SETTING_LIST_BUSINESS } from "../../config/mine";
import { Button, Overlay, CheckBox } from 'react-native-elements';
import { getMainNavigation, getUserToken, getUserInfo } from "../../redux/selectors";
import { http, GET, POST } from "../../common/http";
import { toastMessage } from "../../common/global";

// 视图主组件
const SettingScreen = ({ navigation, resetUserData, mainNavigation, userID }) => {
    // 屏幕尺寸
    let screenWidth = useWindowDimensions().width;
    let screenHeight = useWindowDimensions().height;

    // 自动换线弹出框
    const [lineAotuChangeShow, setLineAotuChangeShow] = useState(false);
    // 是否开启自动环线
    const [hasLineAotuChange, setHasLineAotuChange] = useState(false);
    // 自动换线间隔时长
    const [lineAotuChangeTime, setLineAotuChangeTime] = useState('');
    // 需要填写间隔时长的提示
    const [lineAotuChangeTimeHit, setLineAotuChangeTimeHit] = useState(false);
    // 删除账户弹出框（仅用于应付IOS审核）
    const [accDelConfirm, setAccDelConfirm] = useState(false);

    useEffect(() => {
        if (lineAotuChangeShow === true) {
            http(`user/timer/get/${userID}`, GET)
                .then((res) => {
                    // errorCode
                    if (res.errCode) {
                        console.error('response error code: ', res.errCode);
                        toastMessage(`请求失败`);
                        return;
                    }
                    // response处理
                    if (res.data) {
                        setHasLineAotuChange(res.data.isOpen === 1 ? true : false);
                        setLineAotuChangeTime(String(res.data.sec));
                    }
                })
                .catch((error) => {
                    console.error(error);
                    toastMessage(`请求失败`);
                })
        }
    }, [lineAotuChangeShow]);

    // 列表视图
    const ListRenderItem = ({ item }) => {
        // 列表项点击处理
        const handleListPress = (id) => {
            switch (id) {
                // 岩板类型
                case '1':
                    navigation.navigate('BoardTypeSettingScreen');
                    break;
                // 岩板角度
                case '4':
                    navigation.navigate('BoardAngelSettingScreen');
                    break;
                // 用户协议
                case '2':
                    console.log('跳转用户协议');
                    break;
                // 隐私协议
                case '3':
                    console.log('跳转隐私协议');
                    break;
                // 自动换线
                case '5':
                    setLineAotuChangeShow(true);
                    break;
                default:
                    break;
            }
        }

        return <CustomOptionList listItem={item} onPress={() => handleListPress(item.id)} />;
    };

    // 删除账户按钮点击处理
    const handlerAccDelButton = () => {
        handlerLogoutButton();
        toastMessage(`账户删除成功`);
    }

    // 退出按钮点击处理
    const handlerLogoutButton = () => {
        // 清除 storage 和 redux 中的用户数据
        romoveUserToken();
        romoveUserInfo();
        resetUserData();
        // 跳转至登录页
        mainNavigation && mainNavigation.reset({
            index: 0,
            routes: [
                { name: 'LoginScreen' }
            ],
        });
    }

    // 保存自动换线设置
    const handlerSaveButton = () => {
        if (hasLineAotuChange === true) {
            if (lineAotuChangeTime === '0' || lineAotuChangeTime === '') {
                setLineAotuChangeTimeHit(true);
                return;
            }
        }
        http(`user/timer/update`, POST, {
            body: {
                id: '',
                userId: userID,
                isOpen: hasLineAotuChange ? 1 : 2,
                sec: Number(lineAotuChangeTime)
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
                toastMessage(`保存成功`);
                setLineAotuChangeShow(false);
            })
            .catch((error) => {
                console.error(error);
                toastMessage(`请求失败`);
            })
    }

    // 时长输入事件
    const handleTimeChange = (text) => {
        if (!isNaN(Number(text)) & text !== ' ') {
            setLineAotuChangeTimeHit(false);
            setLineAotuChangeTime(text)
        }
    }

    // 返回react组件
    return (
        <View style={styles.box}>
            {/* 选项列表 */}
            <View style={styles.listGroup}>
                <FlatList
                    data={SETTING_LIST_BUSINESS}
                    renderItem={ListRenderItem}
                    keyExtractor={item => item.id}
                    ItemSeparatorComponent={CustomOptionSeparator}
                />
            </View>
            {/* 选项列表 */}
            <View style={styles.listGroup}>
                <FlatList
                    data={SETTING_LIST_COMMON}
                    renderItem={ListRenderItem}
                    keyExtractor={item => item.id}
                    ItemSeparatorComponent={CustomOptionSeparator}
                />
            </View>
            {/* 删除账户按钮，仅用于IOS审核要求 */}
            {
                userID === '3' &&
                <View style={styles.buttonBox1}>
                    <CustomButton
                        value="删除账户"
                        style={styles.button}
                        onPress={() => setAccDelConfirm(true)}
                    />
                </View>
            }
            {/* 删除账户弹出框 */}
            <Overlay isVisible={accDelConfirm} onBackdropPress={() => { setAccDelConfirm(false) }}>
                <View style={{ ...styles.overlayBox1, width: screenWidth * 0.7 }}>
                    <View>
                        <Text style={styles.overlayTitle}>确认要删除账户吗？</Text>
                    </View>
                    <View style={styles.buttonGroup}>
                        <Button
                            title="取消"
                            type="clear"
                            titleStyle={styles.cancelButtonBox}
                            buttonStyle={styles.cancelButton}
                            onPress={() => { setAccDelConfirm(false) }}
                        />
                        <Button
                            title="确认"
                            type="clear"
                            titleStyle={styles.saveButtonBox}
                            buttonStyle={styles.saveButton}
                            onPress={() => { setAccDelConfirm(false), handlerAccDelButton() }}
                        />
                    </View>
                </View>
            </Overlay>

            {/* 退出登录按钮 */}
            <View style={styles.buttonBox}>
                <CustomButton
                    value="退出登录"
                    style={styles.button}
                    onPress={handlerLogoutButton}
                />
            </View>
            <Overlay isVisible={lineAotuChangeShow} onBackdropPress={() => { }}>
                <View style={{ ...styles.overlayBox, width: screenWidth * 0.7, height: hasLineAotuChange ? 180 : 120 }}>
                    <View>
                        <View style={[styles.sortItemBox, styles.fleterHasVideoBox]}>
                            <CheckBox
                                containerStyle={styles.selectBox}
                                checkedIcon={<Image style={styles.selectIcon} source={require('../../static/img/common-icons/check-box.png')} />}
                                uncheckedIcon={<Image style={styles.selectIcon} source={require('../../static/img/common-icons/check-box-outline.png')} />}
                                checked={hasLineAotuChange}
                                onPress={() => { setHasLineAotuChange(!hasLineAotuChange) }}
                            />
                            <Text style={styles.sortTitle} onPress={() => { setHasLineAotuChange(!hasLineAotuChange) }}>是否开启自动换线</Text>
                        </View>
                    </View>
                    {
                        hasLineAotuChange === true &&
                        <View>
                            <Text>间隔时长（秒）:</Text>
                            <TextInput
                                style={styles.nameInput}
                                placeholder='填写数字间隔时长（秒）'
                                value={lineAotuChangeTime}
                                onChangeText={text => handleTimeChange(text)}
                                keyboardType='number-pad'
                                maxLength={4}
                            />
                            {lineAotuChangeTimeHit &&
                                <Text style={styles.message}>请填写间隔时长</Text>
                            }
                        </View>

                    }
                    <View style={styles.buttonGroup}>
                        <Button
                            title="取消"
                            type="clear"
                            titleStyle={styles.cancelButtonBox}
                            buttonStyle={styles.cancelButton}
                            onPress={() => setLineAotuChangeShow(false)}
                        />
                        <Button
                            title="保存"
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
        mainNavigation: getMainNavigation(state),
        userID: getUserInfo(state).userID,
    };
};


export default connect(
    mapStateToProps,
    { resetUserData }
)(SettingScreen); 