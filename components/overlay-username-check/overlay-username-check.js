import React, { useEffect, useState } from 'react';
import { Text, View, useWindowDimensions, TextInput } from 'react-native';
import { http, GET, POST } from "../../common/http";
import { Button, Overlay } from 'react-native-elements';
import { styles } from "./overlay-username-check.styles";
import { toastMessage } from "../../common/global";
import { getUserInfo } from "../../redux/selectors";
import { connect } from "react-redux";

const OverlayUsernameCheck = ({ userID }) => {
    // 屏幕宽度
    const screenWidth = useWindowDimensions().width;
    // 覆盖框显示
    const [showOverlay, setShowOverlay] = useState(false);
    // 表单值-昵称
    const [userName, setUserName] = useState('');
    // 昵称 input message
    const [nameInputMessage, setNameInputMessage] = useState('');

    // 组件初始化时，检查app是否有更新
    useEffect(() => {
        if (!userID) {
            return;
        }
        // 网络请求-查询用户是否重命名过
        http(`user/name/status/${userID}`, GET)
            .then((res) => {
                if (res.data === 0) {
                    setTimeout(() => {
                        setShowOverlay(true);
                    }, 3000);
                }
            })
            .catch((error) => {
                console.error(error);
                toastMessage(`请求失败`);
            })
    }, [userID]);

    // 点击保存
    const handlerSaveButton = () => {
        if (userName === '') {
            setNameInputMessage('请输入昵称');
            return;
        }
        setNameInputMessage('');
        http(`user/name/update`, POST, {
            body: {
                id: userID,
                userName: userName,
            }
        })
            .then((res) => {
                if (res.data === true) {
                    setShowOverlay(false);
                } else {
                    toastMessage(`保存失败，errCode：${res.errCode}`);
                }
            })
            .catch((error) => {
                console.error(error);
                toastMessage(`请求失败`);
            })
    }

    return (
        <Overlay isVisible={showOverlay} onBackdropPress={() => { }}>
            <View style={{ ...styles.overlayBox, width: screenWidth * 0.7 }}>
                <View>
                    <Text style={styles.overlayTitle}>新用户昵称：</Text>
                    <TextInput
                        style={[styles.input]}
                        placeholder="输入昵称"
                        placeholderTextColor="#BFBFBF"
                        value={userName}
                        onChangeText={text => setUserName(text)}
                    />
                    <Text style={styles.message}>{nameInputMessage}</Text>
                </View>
                <View style={styles.buttonGroup}>
                    <Button
                        title="确定"
                        type="solid"
                        titleStyle={styles.saveButtonBox}
                        buttonStyle={styles.saveButton}
                        onPress={() => handlerSaveButton()}
                    />
                </View>
            </View>
        </Overlay>
    );
};

const mapStateToProps = state => {
    return { ...getUserInfo(state) };
};

export default connect(
    mapStateToProps,
    {}
)(OverlayUsernameCheck);
