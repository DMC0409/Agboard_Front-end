// 用户个人设置视图
import React, { useEffect, useState } from "react";
import { View, FlatList, useWindowDimensions, Text } from 'react-native';
import { CustomOptionList, CustomOptionSeparator } from "../../components/custom-option-list/custom-option-list";
import { styles } from "./edit-brief-screen.style";
import ImagePicker from "react-native-image-crop-picker";
import { PERSONAL_SETTING_LIST } from "../../config/mine";
import RNFetchBlob from 'rn-fetch-blob'
import { getUserToken, getUserInfo } from "../../redux/selectors";
import { connect } from "react-redux";
import { http, GET, POST } from "../../common/http";
import { toastMessage } from "../../common/global";
import { BACK_END_URL, BACK_END_API } from "../../config/http";
import { Divider, TextInput, Button, Appbar } from 'react-native-paper';

// 视图主组件
const EditBriefScreen = ({ route, navigation, token, userID }) => {
    // 屏幕宽度
    const screenWidth = useWindowDimensions().width;
    // 最大长度
    const MAX_LENGTH = 100;

    // 简介输入框数据
    const [text, setText] = useState("");

    // 初始化
    useEffect(() => {
        getUserOtherInfo();
    }, [route.params]);

    // 获取用户当前简介信息
    const getUserOtherInfo = () => {
        http(`user/index?userID=${userID}`, GET, {})
            .then((res) => {
                // errorCode
                if (res.errCode) {
                    console.error('response error code: ', res.errCode);
                    toastMessage(`请求失败`);
                    return;
                }
                // response处理
                if (res.data && res.data.signature) {
                    setText(res.data.signature);
                }
            })
            .catch((error) => {
                console.error(error);
                toastMessage(`请求失败`);
            })
    }

    // 保存信息
    const save = async () => {
        try {
            res = await http(`user/index?userID=${userID}`, GET, {});
            // errorCode
            if (res.errCode) {
                console.error('response error code: ', res.errCode);
                toastMessage(`获取依赖信息失败`);
                return;
            }
            // response处理
            if (res.data) {
                const originData = res.data;
                const res2 = await http(`user/index/info/update`, POST, {
                    body: {
                        userID: Number(userID),
                        signature: text || '',
                        links: originData.links || []
                    }
                });
                // errorCode
                if (res2.errCode) {
                    console.error('response error code: ', res2.errCode);
                    toastMessage(`保存失败`);
                    return;
                }
                toastMessage(`修改成功`);
                navigation.goBack();
            }
        } catch (error) {
            console.error(error);
            toastMessage(`保存失败`);
        }
    }

    // 返回react组件
    return (
        <View style={styles.box}>
            <Appbar.Header mode="center-aligned" style={{ backgroundColor: '#fff' }}>
                <Appbar.BackAction onPress={() => { navigation.goBack() }} size={26} color={'#000'} />
                <Appbar.Content title={"编辑简介"} color={'#000'} titleStyle={{ fontSize: 18 }} />
                <Appbar.Action disabled={text.length > MAX_LENGTH} size={28} icon="check" color="#22934f" onPress={save} />
            </Appbar.Header>
            <View style={{}}>
                <View style={{ flexDirection: 'row', backgroundColor: '#fff', padding: 10, paddingHorizontal: 20 }}>
                    <Text style={{ color: text.length > MAX_LENGTH ? '#b3261d' : '#808080' }}>简介：</Text>
                </View>
                <TextInput
                    mode="flat"
                    label=""
                    placeholder=""
                    value={text}
                    onChangeText={text => setText(text)}
                    error={false}
                    outlineColor={"#fff"}
                    activeOutlineColor={'#fff'}
                    underlineColor={"#f2f2f2"}
                    activeUnderlineColor={text.length > MAX_LENGTH ? '#b3261d' : '#808080'}
                    multiline={true}
                    textColor={"#000"}
                    // numberOfLines={4}
                    underlineStyle={{ backgroundColor: '#fff' }}
                    style={{ paddingHorizontal: 20, marginTop: -10 }}
                    contentStyle={{ backgroundColor: '#fff', height: 200 }}
                />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fff', padding: 10, paddingHorizontal: 20 }}>
                    <Text style={{ color: '#b3261d' }}>{text.length > MAX_LENGTH ? '超出最大长度' : ''}</Text>
                    <Text style={{ color: text.length > MAX_LENGTH ? '#b3261d' : '#808080' }}>{text.length}/{MAX_LENGTH}</Text>
                </View>
            </View>
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
)(EditBriefScreen);