import React from 'react';
import { animationsConfig } from './config';
import { createStackNavigator } from '@react-navigation/stack';
import TrendsMainScreen from "../screens/trends-main-screen/trends-main-screen";
import LineLayoutScreen from "../screens/line-layout-screen/line-layout-screen";
import UserPresentationScreen from "../screens/user-presentation-screen/user-presentation-screen";
import UserFansListScreen from "../screens/user-fans-list-screen/user-fans-list-screen";
import userFollowedListScreen from "../screens/user-followed-list-screen/user-followed-list-screen";
import LineDetailScreen from "../screens/line-detail-screen/line-detail-screen";
import LineCompleteScreen from "../screens/line-complete-screen/line-complete-screen";

// 创建课程 Stack 的堆栈导航组件
const TrendsStack = createStackNavigator();

// 页面配置
let screenOptions = {
  headerShown: false,
  headerBackTitle: '', 
  headerBackTitleVisible: false,
  transitionSpec: {
    open: animationsConfig,
    close: animationsConfig,
  },
}
if (Platform.OS !== 'ios') {
  screenOptions = { ...screenOptions, headerBackTitleVisible: false, headerLeftContainerStyle: { paddingLeft: 10 } }
}

// 课程 Stack 组件
export function TrendsStackNode() {
  return (
    <TrendsStack.Navigator screenOptions={screenOptions}>
      <TrendsStack.Screen name="TrendsMainScreen" component={TrendsMainScreen} />
      <TrendsStack.Screen name="LineLayoutScreen" component={LineLayoutScreen} />
      <TrendsStack.Screen name="UserFansListScreen" component={UserFansListScreen} />
      <TrendsStack.Screen name="UserPresentationScreen" component={UserPresentationScreen} />
      <TrendsStack.Screen name="userFollowedListScreen" component={userFollowedListScreen} />
      <TrendsStack.Screen name="LineDetailScreen" component={LineDetailScreen} options={{ headerShown: true, title: '线路信息', headerTitle: '线路信息' }} />
      <TrendsStack.Screen name="LineCompleteScreen" component={LineCompleteScreen} />
    </TrendsStack.Navigator>
  );
}