// 设置视图
import React from "react";
import { View } from 'react-native';
import { styles } from "./privacy-policy-screen.styles";
import { connect } from "react-redux";
import { USER_PRIVACY_AGREEMENT_URL } from "../../config/http";
import { WebView } from 'react-native-webview';

// 视图主组件
const PrivacyPolicyScreen = ({ navigation }) => {

    // 返回react组件
    return (
        <WebView
            containerStyle={{ paddingHorizontal: 10, backgroundColor: '#fff' }}
            showsVerticalScrollIndicator={false}
            source={{ uri: USER_PRIVACY_AGREEMENT_URL }}
        />
    )
}


const mapStateToProps = state => {
    return {};
};


export default connect(
    mapStateToProps,
    {}
)(PrivacyPolicyScreen);