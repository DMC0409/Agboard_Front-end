import React from 'react';
import { animationsConfig } from './config';
import { createStackNavigator } from '@react-navigation/stack';
import CourseScreen from "../screens/course-screen/course-screen";
import { CourseLineListScreen } from "../screens/course-line-list-screen/course-line-list-screen";
import LineLayoutScreen from "../screens/line-layout-screen/line-layout-screen";
import LineCompleteScreen from "../screens/line-complete-screen/line-complete-screen";
import CourseDetailScreen from "../screens/course-detail/course-detail";
import CourseLineLayoutScreen from "../screens/course-line-layout-screen/course-line-layout-screen";

// 创建课程 Stack 的堆栈导航组件
const CourseStack = createStackNavigator();

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
export function CourseStackNode() {
  return (
    <CourseStack.Navigator screenOptions={screenOptions}>
      <CourseStack.Screen name="CourseScreen" component={CourseScreen} />
      <CourseStack.Screen name="CourseLineListScreen" component={CourseLineListScreen} />
      <CourseStack.Screen name="LineLayoutScreen" component={LineLayoutScreen} />
      <CourseStack.Screen name="LineCompleteScreen" component={LineCompleteScreen} />
      <CourseStack.Screen name="CourseDetailScreen" component={CourseDetailScreen} />
      <CourseStack.Screen name="CourseLineLayoutScreen" component={CourseLineLayoutScreen} />
    </CourseStack.Navigator>
  );
}