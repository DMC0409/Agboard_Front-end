// 用户个人设置视图
import React, { useEffect, useState } from "react";
import { View, FlatList, useWindowDimensions, TextInput, Text } from 'react-native';
import { CustomOptionList, CustomOptionSeparator } from "../../components/custom-option-list/custom-option-list";
import { styles } from "./personal-setting-screen.styles";
import ImagePicker from "react-native-image-crop-picker";
import { PERSONAL_SETTING_LIST } from "../../config/mine";
import RNFetchBlob from 'rn-fetch-blob'
import { getUserToken, getUserInfo } from "../../redux/selectors";
import { connect } from "react-redux";
import { Button, Overlay } from 'react-native-elements';
import { http, GET, POST } from "../../common/http";
import { toastMessage } from "../../common/global";
import { BACK_END_URL, BACK_END_API } from "../../config/http";

// 视图主组件
const PersonalSettingScreen = ({ route, navigation, token, userID }) => {
    // 屏幕宽度
    const screenWidth = useWindowDimensions().width;

    // 表单值-昵称
    const [userInfo, setUserInfo] = useState({});
    // 修改昵称弹出框
    const [userNameEditShow, setUserNameEditShow] = useState(false);
    // 表单值-昵称
    const [userNameValue, setUserNameValue] = useState(route.params.userInfo.userName || '');

    // 将路由参数赋值到 state
    useEffect(() => {
        setUserInfo(route.params.userInfo)
    }, [route.params]);

    // 选择图库图像-用于更换背景
    const selectImgForBack = () => {
        ImagePicker.openPicker({
            width: 2472,
            height: 630,
            cropping: true,
            cropperToolbarTitle: '选取背景区域',
            loadingLabelText: '正在处理',
            cropperChooseText: '选择',
            cropperCancelText: '取消',
            compressImageQuality: 0.8,
            compressImageMaxWidth: 4080,
            compressImageMaxHeight: 1024,
            mediaType: 'photo',
            hideBottomControls: false
        }).then(image => {
            console.log('image', image);
            uploadImgForBack(image.path);
        }).catch((error) => {
            console.warn('取消选择背景', error);
        });
    }

    // 上传图片为头像
    const uploadImgForBack = (url) => {
        if (url) {
            RNFetchBlob.fetch('POST', `${BACK_END_URL}/${BACK_END_API}/user/background/update`, {
                Authorization: token,
                'Content-Type': 'multipart/form-data',
            }, [
                { name: 'background', type: 'image/jpg', filename: 'userAvatar.jpg', data: RNFetchBlob.wrap(url) },
                { name: 'userID', data: userID },
            ]).then((resp) => {
                console.log('resp', resp);
                const res = JSON.parse(resp.data);
                // errorCode
                if (res.errCode) {
                    console.error('response error code: ', res.errCode);
                    toastMessage(`请求失败`);
                    return;
                }
                // response处理
                if (res.data) {
                    console.log('背景更新成功');
                    toastMessage('背景更新成功');
                    navigation.goBack();
                } else {
                    toastMessage(`背景更新失败`);
                }
            }).catch((err) => {
                console.error(err);
            })
        }
    }

    // 选择图库图像
    const selectImg = () => {
        ImagePicker.openPicker({
            width: 300,
            height: 300,
            cropping: true,
            cropperToolbarTitle: '选取头像区域',
            loadingLabelText: '正在处理',
            cropperChooseText: '选择',
            cropperCancelText: '取消',
            compressImageQuality: 0.8,
            compressImageMaxWidth: 500,
            compressImageMaxHeight: 500,
            mediaType: 'photo',
            hideBottomControls: false
        }).then(image => {
            console.log(image);
            uploadImg(image.path);
        }).catch((error) => {
            console.warn('取消选择头像', error);
        });
    }

    // 上传图片为头像
    const uploadImg = (url) => {
        if (url) {
            RNFetchBlob.fetch('POST', `${BACK_END_URL}/${BACK_END_API}/user/avatar/update`, {
                Authorization: token,
                'Content-Type': 'multipart/form-data',
            }, [
                { name: 'avatar', type: 'image/jpg', filename: 'userAvatar.jpg', data: RNFetchBlob.wrap(url) },
                { name: 'userID', data: userID },
            ]).then((resp) => {
                const res = JSON.parse(resp.data);
                // errorCode
                if (res.errCode) {
                    console.error('response error code: ', res.errCode);
                    toastMessage(`请求失败`);
                    return;
                }
                // response处理
                if (res.data) {
                    console.log('头像更新成功');
                    toastMessage('头像更新成功');
                    navigation.goBack();
                } else {
                    toastMessage(`头像更新失败`);
                }
            }).catch((err) => {
                console.error(err);
            })
        }
    }

    // 修改昵称保存处理
    const handlerSaveButton = () => {
        // 请求
        http(`user/update`, POST, {
            body: {
                ...userInfo,
                userName: userNameValue
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
                    console.log('修改昵称成功');
                    toastMessage('昵称修改成功');
                    setUserNameEditShow(false)
                } else {
                    toastMessage('昵称修改失败');
                }
            })
            .catch((error) => {
                console.error(error);
                toastMessage(`请求失败`);
            })
    }

    // 列表视图
    const ListRenderItem = ({ item }) => {
        // 列表项点击处理
        const handleListPress = (id) => {
            switch (id) {
                // 更换背景
                case '5':
                    selectImgForBack();
                    break;
                // 更换头像
                case '1':
                    selectImg();
                    break;
                // 修改昵称
                case '2':
                    setUserNameEditShow(true);
                    break;
                // 修改签名
                case '3':
                    navigation.navigate('EditBriefScreen', {})
                    break;
                // 编辑外部链接
                case '4':
                    navigation.navigate('EditLinksScreen', {})
                    break;
                default:
                    break;
            }
        }

        return <CustomOptionList listItem={item} onPress={() => { handleListPress(item.id) }} />;
    };

    // 返回react组件
    return (
        <View style={styles.box}>
            <View style={styles.listBox}>
                <FlatList
                    data={PERSONAL_SETTING_LIST}
                    renderItem={ListRenderItem}
                    keyExtractor={item => item.id}
                    ItemSeparatorComponent={CustomOptionSeparator}
                />
            </View>
            <Overlay isVisible={userNameEditShow} onBackdropPress={() => { }}>
                <View style={{ ...styles.overlayBox, width: screenWidth * 0.7 }}>
                    <View>
                        <Text style={styles.overlayTitle}>修改昵称：</Text>
                        <TextInput
                            style={styles.nameInput}
                            placeholder='填写新昵称'
                            value={userNameValue}
                            onChangeText={text => setUserNameValue(text)}
                        />
                    </View>
                    <View style={styles.buttonGroup}>
                        <Button
                            title="取消"
                            type="clear"
                            titleStyle={styles.cancelButtonBox}
                            buttonStyle={styles.cancelButton}
                            onPress={() => setUserNameEditShow(false)}
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
        token: getUserToken(state),
        userID: getUserInfo(state).userID
    };
};

export default connect(
    mapStateToProps,
    {}
)(PersonalSettingScreen);