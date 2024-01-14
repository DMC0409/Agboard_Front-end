import React from 'react';
import { animationsConfig } from './config';
import { createStackNavigator } from '@react-navigation/stack';
import LineScreen from "../screens/line-screen/line-screen";
import LineLayoutScreen from "../screens/line-layout-screen/line-layout-screen";
import LineCreatePart1Screen from "../screens/line-create-part1-screen/line-create-part1-screen";
import LineCreatePart2Screen from "../screens/line-create-part2-screen/line-create-part2-screen";
import LineCompleteScreen from "../screens/line-complete-screen/line-complete-screen";
import LineDetailScreen from "../screens/line-detail-screen/line-detail-screen";
import LineCreatePart1ForLevelScreen from "../screens/line-create-part1-for-level-screen/line-create-part1-for-level-screen";
import LineCreatePart2ForLevelScreen from "../screens/line-create-part2-for-level-screen/line-create-part2-for-level-screen";
import UserPresentationScreen from "../screens/user-presentation-screen/user-presentation-screen";
import UserFansListScreen from "../screens/user-fans-list-screen/user-fans-list-screen";
import userFollowedListScreen from "../screens/user-followed-list-screen/user-followed-list-screen";

// 创建线路 Stack 的堆栈导航组件
const LineStack = createStackNavigator();

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

console.log('screenOptions', screenOptions)

// 线路 Stack 组件
export function LineStackNode() {
  return (
    <LineStack.Navigator screenOptions={screenOptions}>
      <LineStack.Screen name="LineScreen" component={LineScreen} />
      <LineStack.Screen name="LineLayoutScreen" component={LineLayoutScreen} />
      <LineStack.Screen name="LineCreatePart1Screen" component={LineCreatePart1Screen} />
      <LineStack.Screen name="LineCreatePart1ForLevelScreen" component={LineCreatePart1ForLevelScreen} />
      <LineStack.Screen name="LineCreatePart2ForLevelScreen" component={LineCreatePart2ForLevelScreen} />
      <LineStack.Screen name="LineCreatePart2Screen" component={LineCreatePart2Screen} />
      <LineStack.Screen name="LineCompleteScreen" component={LineCompleteScreen} />
      <LineStack.Screen name="UserPresentationScreen" component={UserPresentationScreen} />
      <LineStack.Screen name="UserFansListScreen" component={UserFansListScreen} />
      <LineStack.Screen name="LineDetailScreen" component={LineDetailScreen} options={{ headerShown: true, title: '线路信息', headerTitle: '线路信息' }} />
      <LineStack.Screen name="userFollowedListScreen" component={userFollowedListScreen} />
    </LineStack.Navigator>
  );
}