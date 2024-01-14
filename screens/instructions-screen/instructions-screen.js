// 设置视图
import React from "react";
import { View, FlatList, Text, Image } from 'react-native';
import { CustomOptionList, CustomOptionSeparator } from "../../components/custom-option-list/custom-option-list";
import { CustomButton } from "../../components/custom-button/custom-button";
import { styles } from "./instructions-screen.style";
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
const InstructionsScreen = ({ navigation }) => {
    // 返回react组件
    return (
        <View style={styles.box}>
            <View>
                <View>
                    <Text style={{ fontSize: 16, color: '#000' }}>Hello There</Text>
                </View>
                <View>
                    <Text style={{ fontSize: 16, color: '#000' }}>感谢使用Alpha Wall,为了维护线路质量以及使用规范性请阅读下方文字。</Text>
                </View>
            </View>
            <View style={styles.desBox}>
                <View style={styles.desImgBox}>
                    <Image source={require('../../static/img/common-icons/climbing.png')} style={styles.climbingImg}></Image>
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.descriptText}><Text style={{ fontWeight: 'bold' }}>线路指示使用:</Text>{"\n"}
                        紫色灯为"起步手点"{"\n"}
                        绿色为"手脚点"{"\n"}
                        蓝色为"脚点"{"\n"}
                        红色为"结束点"{"\n"}
                        起步手点下面的点均可当作起步脚点使用。
                        定线时请遵循以上规则，查看线路以上面为准。
                    </Text>
                </View>
            </View>
            <View style={styles.desBox}>
                <View style={styles.desImgBox}>
                    <Image source={require('../../static/img/common-icons/climbing.png')} style={styles.climbingImg}></Image>
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.descriptText}><Text style={{ fontWeight: 'bold' }}>课程板块使用：</Text>{"\n"}
                        "公开课程"为不设置密码的公开课程，{"\n"}
                        "私人课程"为设置密码的个人非公开课程,{"\n"}
                        "连线活动"为不定期跨区域连线线路。
                    </Text>
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
)(InstructionsScreen);