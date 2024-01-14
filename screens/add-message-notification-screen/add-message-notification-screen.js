import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Image, useWindowDimensions, TextInput } from 'react-native';
import { Button } from 'react-native-elements';
import { styles } from "./add-message-notification-screen.style";
import ImagePicker from "react-native-image-crop-picker";
import RNFetchBlob from 'rn-fetch-blob'
import { getUserToken, getBoardSettingType, getUserInfo } from "../../redux/selectors";
import { connect } from "react-redux";
import { imgScale } from "../../config/course";
import { toastMessage } from "../../common/global";
import { BOARD_TYPE_NAME } from "../../config/board";
import { BACK_END_URL, BACK_END_API, COURSE_IMG_URL } from "../../config/http";
import { SearchBar, Overlay, CheckBox } from 'react-native-elements';
import { CustomLabelsGroup } from "../../components/custom-labels-group/custom-labels-group";
import { http, GET, POST } from "../../common/http";

// 视图主组件
const AddMessageNotificationScreen = ({ route, navigation, userToken, userID, boardType }) => {
    // 屏幕宽度
    const screenWidth = useWindowDimensions().width;

    // 表单值-名称
    const [nameValue, setNameValue] = useState('');
    // 表单值-内容
    const [subtitleValue, setSubtitleValue] = useState('');
    // 名称 input message
    const [contentInputMessage, setNameInputMessage] = useState('');
    // 课程密码 input message
    const [pswInputMessage, setContentInputMessage] = useState('');

    // 验证表单内容
    const validateForm = () => {
        let res = true;
        if (!nameValue) {
            setNameInputMessage('标题不能为空');
            res = false;
        } else {
            setNameInputMessage('');
        }
        if (!subtitleValue) {
            setContentInputMessage('内容不能为空');
            res = false;
        } else {
            setContentInputMessage('');
        }
        return res
    }

    // 保存
    const save = () => {
        // 验证
        if (!validateForm()) {
            return;
        }
        // 请求
        http(`message/new`, POST, {
            body: {
                id: '',
                title: nameValue || '',
                content: subtitleValue|| '',
                createTime: ''
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
                    toastMessage(`创建成功`);
                    navigation.goBack();
                }
            })
            .catch((error) => {
                console.error(error);
                toastMessage(`请求失败`);
            })
    }

    // 返回react组件
    return (
        <View style={{ flex: 1 }}>
            <ScrollView style={{ flex: 1, backgroundColor: '#ffffff' }}>
                {/* 信息表单 */}
                <View style={{ flex: 1, paddingHorizontal: 20, paddingBottom: 20 }}>
                    <View style={styles.formNameBox}>
                        <View style={styles.formNameRow}>
                            <Text style={styles.formName}>通知标题</Text>
                            <TextInput
                                style={styles.nameInput}
                                placeholder='填写通知标题'
                                value={nameValue}
                                onChangeText={text => setNameValue(text)}
                            />
                        </View>
                        <Text style={styles.message}>{contentInputMessage}</Text>
                    </View>
                    <View style={{ marginTop: 20, flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#808080', paddingRight: 15 }}>通知内容</Text>
                        <TextInput
                            style={styles.formRowsInput}
                            multiline
                            numberOfLines={25}
                            editable
                            maxLength={2000}
                            placeholder='填写通知内容'
                            value={subtitleValue}
                            onChangeText={text => setSubtitleValue(text)}
                        />
                    </View>
                    <Text style={styles.message}>{pswInputMessage}</Text>
                </View>
            </ScrollView>
            {/* 底部操作栏 */}
            <View style={{ height: 50, backgroundColor: '#ffffff', borderTopWidth: 0.5, borderBottomWidth: 0.5, borderColor: '#808080', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}></View>
                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                    <Button
                        title="发布"
                        containerStyle={{ minHeight: 10, marginRight: 10 }}
                        buttonStyle={{ backgroundColor: '#3366ff', paddingHorizontal: 20, height: 35, borderRadius: 10 }}
                        titleStyle={{ fontSize: 14 }}
                        onPress={() => { save() }}
                    />
                </View>
            </View>
        </View >
    );
}

const mapStateToProps = state => {
    return {
        userToken: getUserToken(state),
        boardType: getBoardSettingType(state),
        userID: getUserInfo(state).userID,
    };
};

export default connect(
    mapStateToProps,
    {}
)(AddMessageNotificationScreen);