// 设置视图
import React from "react";
import { View, FlatList, Text, TouchableOpacity } from 'react-native';
import { CustomOptionList, CustomOptionSeparator } from "../../components/custom-option-list/custom-option-list";
import { CustomButton } from "../../components/custom-button/custom-button";
import { styles } from "./show-WX-and-email-screen.style";
import { romoveUserToken, romoveUserInfo } from "../../common/user";
import { resetUserData } from "../../redux/actions";
import { connect } from "react-redux";
import { getMainNavigation } from "../../redux/selectors";
import { SETTING_LIST_COMMON, SETTING_LIST_BUSINESS } from "../../config/mine";
import { Clipboard } from 'react-native'
import { Button, Overlay } from 'react-native-elements';
import { CONTACT } from '../../config/contact'
import { toastMessage } from "../../common/global";

// 视图主组件
const Show_WX_AndEmailScreen = ({ navigation }) => {
    // 复制关键词
    const copyKeyword = (text) => {
        Clipboard.setString(text);
        toastMessage('复制成功')
    }

    // 返回react组件
    return (
        <View style={styles.box}>
            <View>
                <Text style={styles.descript}>您可以通过添加<Text style={styles.bold}>微信</Text>好友，或者发送<Text style={styles.bold}>电子邮件</Text>与我们取得联系，来申请开通线路设计权限。</Text>
            </View>
            <View style={{ flex: 1, justifyContent: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={styles.text}>
                        微信号：{CONTACT.WX}
                    </Text>
                    <TouchableOpacity style={{ padding: 5 }} onPress={() => copyKeyword(CONTACT.WX)}>
                        <Text style={{ color: '#0088ff' }}>复制</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={styles.text}>
                        邮箱：{CONTACT.EMAIL}
                    </Text>
                    <TouchableOpacity style={{ padding: 5 }} onPress={() => copyKeyword(CONTACT.EMAIL)}>
                        <Text style={{ color: '#0088ff' }}>复制</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const mapStateToProps = state => {
    return {};
};

export default connect(
    mapStateToProps,
    {}
)(Show_WX_AndEmailScreen);