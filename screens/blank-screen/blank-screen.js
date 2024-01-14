import React, { useState, useEffect } from "react";
import { View, Text, Image } from 'react-native';
import { styles } from "./blank-screen.styles";
import { connect } from "react-redux";
import { getMainNavigation } from "../../redux/selectors";

// 视图主组件
const BlankScreen = ({ route, navigation, mainNavigation }) => {
    // 控制此页等待3秒，后导航至应显示的页面
    useEffect(() => {
        let timeout;
        // 计时(3s)
        timeout = setTimeout(() => {
            jumpToPage();
        }, 2200);
        // 销毁组件时，清理工作
        return () => {
            timeout && clearTimeout(timeout);
        }
    }, []);

    // 开屏页面后，跳转至应显示的页面
    const jumpToPage = () => {
        const { autoLogin } = route.params;
        // 跳转页面
        if (autoLogin === false) {
            navigation.reset({
                index: 0,
                routes: [
                    { name: 'LoginScreen' }
                ],
            });
        } else {
            navigation.reset({
                index: 0,
                routes: [
                    { name: 'TabNode' }
                ],
            });
        }
    }

    // 返回react组件
    return (
        <View style={styles.box}>
            <View style={styles.logoBox}>
                <Image source={require('../../static/img/Alpha_Wall_LOGO.png')} style={styles.icon}></Image>
            </View>
            <View style={styles.fontBox}>
                <Text style={styles.nameFont}>ALPHA WALL</Text>
            </View>
        </View>
    );
}

const mapStateToProps = state => {
    return { mainNavigation: getMainNavigation(state) };
};

export default connect(
    mapStateToProps,
    {}
)(BlankScreen);
