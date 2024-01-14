// 用户个人设置视图
import React, { useEffect, useState } from "react";
import { View, ScrollView, useWindowDimensions, Text } from 'react-native';
import { CustomOptionList, CustomOptionSeparator } from "../../components/custom-option-list/custom-option-list";
import { styles } from "./edit-links-screen.style";
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
const EditLinksScreen = ({ route, navigation, token, userID }) => {
    // 屏幕宽度
    const screenWidth = useWindowDimensions().width;
    // 最大长度
    const NAME_MAX_LENGTH = 8;
    const NICK_MAX_LENGTH = 20;

    // 初始链接数据
    const defaultLinksData = [
        {
            "app": "",
            "nickName": "",
            "url": ""
        },
        {
            "app": "",
            "nickName": "",
            "url": ""
        }, {
            "app": "",
            "nickName": "",
            "url": ""
        },
    ];

    // 链接数据
    const [links, setLinks] = useState([...defaultLinksData]);

    // 初始化
    useEffect(() => {
        getUserOtherInfo();
    }, [route.params]);

    // 获取用户当前链接信息
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
                if (res.data && res.data.links) {
                    console.log(res.data.links);
                    if (res.data.links.length === 0) {
                        setLinks([...defaultLinksData]);
                    } else if (res.data.links.length > 3) {
                        setLinks(res.data.links);
                    } else {
                        const originData = res.data.links;
                        while (originData.length < 3) {
                            originData.push({
                                "app": "",
                                "nickName": "",
                                "url": ""
                            });
                        }
                        setLinks(originData);
                    }
                }
            })
            .catch((error) => {
                console.error(error);
                toastMessage(`请求失败`);
            })
    }

    // 判断URL是否合法
    const checkURL = (URL) => {
        if (URL === '') {
            return true;
        }
        var str = URL;
        //判断URL地址的正则表达式为:http(s)?://([\w-]+\.)+[\w-]+(/[\w- ./?%&=]*)?
        //下面的代码中应用了转义字符"\"输出一个字符"/"
        var Expression = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
        var objExp = new RegExp(Expression);
        if (objExp.test(str) == true) {
            return true;
        } else {
            return false;
        }
    }

    // 整理数据
    const reBuildData = () => {
        const newLinks = links.filter((item) => {
            let res = false;
            if (item.app || item.nickName || item.url) {
                res = true;
            }
            return res;
        })
        return newLinks;
    }

    // 校验信息
    const dataVaild = () => {
        const newLinks = reBuildData();
        let res = true;
        newLinks.forEach(item => {
            if (item.app.length > NAME_MAX_LENGTH) {
                res = false;
            }
            if (item.nickName.length > NICK_MAX_LENGTH) {
                res = false;
            }
            if (!item.app || !item.nickName || !item.url) {
                res = false;
            }
        });
        return res;
    }

    // 保存信息
    const save = async () => {
        // 校验
        if (dataVaild() === false) {
            return
        }
        // 数据整理
        const newLinks = reBuildData();
        // 请求
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
                        signature: originData.signature || '',
                        links: newLinks || []
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

    const changeAppName = (index, value) => {
        links[index].app = value;
        setLinks([...links]);
    }

    const changeAppNickName = (index, value) => {
        links[index].nickName = value;
        setLinks([...links]);
    }

    const changeAppUrl = (index, value) => {
        links[index].url = value;
        setLinks([...links]);
    }

    // 能否保存数据
    const canSave = dataVaild();

    // 返回react组件
    return (
        <ScrollView style={styles.box}>
            <Appbar.Header mode="center-aligned" style={{ backgroundColor: '#fff' }}>
                <Appbar.BackAction onPress={() => { navigation.goBack() }} size={26} color={'#000'} />
                <Appbar.Content title={"编辑外部链接"} color={'#000'} titleStyle={{ fontSize: 18 }} />
                <Appbar.Action disabled={canSave === false} size={28} icon="check" color="#22934f" onPress={save} />
            </Appbar.Header>
            <View style={{}}>
                {links.map((item, index) => <View key={index} style={{ marginTop: 10 }}>
                    <Text style={{ color: '#22934f', fontSize: 13, fontWeight: 'bold', paddingHorizontal: 15, paddingBottom: 10 }}>APP {index + 1}</Text>
                    <TextInput
                        mode="flat"
                        textColor={"#000"}
                        label="应用名称"
                        placeholder=""
                        value={item.app}
                        onChangeText={value => { changeAppName(index, value) }}
                        error={item.app.length > NAME_MAX_LENGTH}
                        underlineColor={"#808080"}
                        activeUnderlineColor={'#808080'}
                        multiline={false}
                        style={{ paddingHorizontal: 20 }}
                        contentStyle={{ backgroundColor: '#fff' }}
                        right={<TextInput.Affix textStyle={{ fontSize: 12, color: item.app.length > NAME_MAX_LENGTH ? '#b3261d' : '#808080' }} text={item.app.length + "/" + NAME_MAX_LENGTH} />}
                    />
                    <TextInput
                        mode="flat"
                        textColor={"#000"}
                        label="我的昵称"
                        placeholder=""
                        value={item.nickName}
                        onChangeText={value => { changeAppNickName(index, value) }}
                        error={item.nickName.length > NICK_MAX_LENGTH}
                        outlineColor={"#fff"}
                        activeOutlineColor={'#fff'}
                        underlineColor={"#808080"}
                        activeUnderlineColor={'#808080'}
                        multiline={false}
                        style={{ paddingHorizontal: 20 }}
                        contentStyle={{ backgroundColor: '#fff' }}
                        right={<TextInput.Affix textStyle={{ fontSize: 12, color: item.nickName.length > NICK_MAX_LENGTH ? '#b3261d' : '#808080' }} text={item.nickName.length + "/" + NICK_MAX_LENGTH} />}
                    />
                    <TextInput
                        mode="flat"
                        textColor={"#000"}
                        label={`链接地址${checkURL(item.url) === false ? ' （正确格式：http(s)://xxxxx）' : ''}`}
                        placeholder=""
                        value={item.url}
                        onChangeText={value => { changeAppUrl(index, value) }}
                        error={!checkURL(item.url)}
                        outlineColor={"#fff"}
                        activeOutlineColor={'#fff'}
                        underlineColor={"#808080"}
                        activeUnderlineColor={'#808080'}
                        multiline={true}
                        style={{ paddingHorizontal: 20 }}
                        contentStyle={{ backgroundColor: '#fff' }} />
                </View>
                )}
            </View>
            <View style={{ padding: 10, paddingHorizontal: 15 }}>
                <Text style={{ color: '#808080', fontSize: 13 }}>注：链接地址一般可在APP应用的 "个人主页" 中选择分享，再选择 "复制链接" 获得</Text>
            </View>
        </ScrollView>
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
)(EditLinksScreen);