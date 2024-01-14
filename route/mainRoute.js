// 初始路由
import { animationsConfig } from './config';
import React, { useState, useEffect } from 'react';
import { connect } from "react-redux";
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { takeUserToken, takeUserInfo } from "../common/user";
import LoginScreen from "../screens/login-screen/login-screen";
import BlankScreen from "../screens/blank-screen/blank-screen";
import SwitchLoginAreaScreen from "../screens/switch-login-area-screen/switch-login-area-screen";
import PrivacyPolicyScreen from "../screens/privacy-policy-screen/privacy-policy-screen";
import { TabNode } from "./tabRoute";
import { setUserToken, setUserInfo, setMainNavigation } from "../redux/actions";
import { Platform } from 'react-native';

// 页面配置
let screenOptions = {
    headerShown: false,
    transitionSpec: {
        open: animationsConfig,
        close: animationsConfig,
    },
}
if (Platform.OS !== 'ios') {
    screenOptions = { ...screenOptions, headerBackTitleVisible: false, headerLeftContainerStyle: { paddingLeft: 10 } }
}

// 创建普通堆栈导航组件
const Stack = createStackNavigator();

// 导航根组件
const NavigationRoot = ({ setUserToken, setUserInfo, setMainNavigation }) => {
    // 自动登录标志
    const [autoLogin, setAutoLogin] = useState();
    // 导航对象引用
    const navigationRef = React.createRef();

    // 将导航对象存入 redux
    useEffect(() => {
        setMainNavigation(navigationRef.current || null);
    }, [navigationRef])

    // 组件初始化时，从持久化存储中获取信息，判断能否自动登录
    useEffect(() => {
        let userToken;
        let userInfo;
        let autoLogin = true;
        takeUserToken()
            // 判断token
            .then((token) => {
                if (!token) {
                    autoLogin = false;
                }
                userToken = token;
                return takeUserInfo();
            })
            // 判断userInfo
            .then((info) => {
                if (!info) {
                    autoLogin = false;
                } else {
                    if (!(info['userID'] && info['userRole'])) {
                        autoLogin = false;
                    }
                    userInfo = info;
                }
            })
            // 若自动登录为true，则将 token 和 info 存入 redux
            .then(() => {
                if (autoLogin) {
                    setUserToken(userToken);
                    setUserInfo(userInfo.userID, userInfo.userRole);
                }
                setAutoLogin(autoLogin);
            })
            .catch((error) => {
                console.error(error);
                setAutoLogin(false);
            })
    }, []);

    // 应用的初始页面导航
    useEffect(() => {
        if (autoLogin !== undefined) {
            navigationRef.current.reset({
                index: 0,
                routes: [
                    { name: 'BlankScreen' }
                ],
            });
        }
    }, [autoLogin])

    return (
        <NavigationContainer ref={navigationRef}>
            <Stack.Navigator
                initialRouteName={'BlankScreen'}
                screenOptions={screenOptions}
            >
                {/* 空白视图，用于开屏延时 */}
                <Stack.Screen name="BlankScreen" component={BlankScreen} initialParams={{ autoLogin: autoLogin }} options={{ transitionSpec: { open: { animation: 'timing', config: { duration: 0 } } } }} />
                {/* 主页视图 */}
                <Stack.Screen name="TabNode" component={TabNode} />
                {/* 登录视图 */}
                <Stack.Screen name="LoginScreen" component={LoginScreen} />
                {/* 切换登录地区视图 */}
                <Stack.Screen name="SwitchLoginAreaScreen" component={SwitchLoginAreaScreen} options={{ headerShown: true, title: '切换登录地区', headerTitle: '切换登录地区' }} />
                {/* 隐私政策视图 */}
                <Stack.Screen name="PrivacyPolicyScreen" component={PrivacyPolicyScreen} options={{ headerShown: true, title: '隐私政策', headerTitle: '隐私政策' }} />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default connect(
    null,
    { setUserToken, setUserInfo, setMainNavigation }
)(NavigationRoot);