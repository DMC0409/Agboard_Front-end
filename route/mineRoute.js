import React from 'react';
import { animationsConfig } from './config';
import { createStackNavigator } from '@react-navigation/stack';
import MineScreen from "../screens/mine-screen/mine-screen";
import PersonalSettingScreen from "../screens/personal-setting-screen/personal-setting-screen";
import SettingScreen from "../screens/setting-screen/setting-screen";
import RankingScreen from "../screens/ranking-screen/ranking-screen";
import CourseManagementScreen from "../screens/course-management-screen/course-management-screen";
import CourseEditScreen from "../screens/course-edit-screen/course-edit-screen";
import CourseLinesEditScreen from "../screens/course-lines-edit-screen/course-lines-edit-screen";
import LineLayoutScreen from "../screens/line-layout-screen/line-layout-screen";
import LineCreatePart1Screen from "../screens/line-create-part1-screen/line-create-part1-screen";
import LineCreatePart2Screen from "../screens/line-create-part2-screen/line-create-part2-screen";
import { DraftBoxScreen } from "../screens/draft-box-screen/draft-box-screen";
import LED_TestScreen from "../screens/led-test-screen/led-test-screen";
import BoardTypeSettingScreen from "../screens/board-type-setting-screen/board-type-setting-screen";
import TempBoardTypeSettingScreen from "../screens/temp-board-type-setting-screen/temp-board-type-setting-screen";
import LineCompleteScreen from "../screens/line-complete-screen/line-complete-screen";
import MyDesignLinesScreen from "../screens/my-design-lines-screen/my-design-lines-screen";
import FavoritesScreen from "../screens/favorites-screen/favorites-screen";
import CompleteRecordScreen from "../screens/complete-record-screen/complete-record-screen";
import ColorPickScreen from "../screens/color-pick-screen/color-pick-screen"
import DraftLinePart1Screen from "../screens/draft-line-part1-screen/draft-line-part1-screen";
import DraftLinePart2Screen from "../screens/draft-line-part2-screen/draft-line-part2-screen";
import AddCourseLinePart1Screen from "../screens/add-course-line-part1-screen/add-course-line-part1-screen";
import AddCourseLinePart2Screen from "../screens/add-course-line-part2-screen/add-course-line-part2-screen";
import BoardAngelSettingScreen from "../screens/board-angel-setting-screen/board-angel-setting-screen";
import LineDetailScreen from "../screens/line-detail-screen/line-detail-screen";
import Show_WX_AndEmailScreen from "../screens/show-WX-and-email-screen/show-WX-and-email-screen";
import InstructionsScreen from "../screens/instructions-screen/instructions-screen";
import UserManagmentScreen from "../screens/user-managment-screen/user-managment-screen";
import AddMessageNotificationScreen from "../screens/add-message-notification-screen/add-message-notification-screen";
import MessageDetailScreen from "../screens/message-detail-screen/message-detail-screen";
import LineFeedbackListScreen from "../screens/line-feedback-list-screen/line-feedback-list-screen";
import MessageNotificationScreen from "../screens/message-notification-screen/message-notification-screen";
import FeedbackLineLayoutScreen from "../screens/feedback-line-layout-screen/feedback-line-layout-screen";
import LineCreatePart1ForLevelScreen from "../screens/line-create-part1-for-level-screen/line-create-part1-for-level-screen";
import LineCreatePart2ForLevelScreen from "../screens/line-create-part2-for-level-screen/line-create-part2-for-level-screen";
import UserPresentationScreen from "../screens/user-presentation-screen/user-presentation-screen";
import MineNewScreen from "../screens/mine-new-screen/mine-new-screen";
import AdminFeatureScreen from "../screens/admin-feature-screen/admin-feature-screen";
import UserFansListScreen from "../screens/user-fans-list-screen/user-fans-list-screen";
import userFollowedListScreen from "../screens/user-followed-list-screen/user-followed-list-screen";
import EditBriefScreen from "../screens/personal-setting-screen/edit-brief-screen";
import EditLinksScreen from "../screens/personal-setting-screen/edit-links-screen";

import { Platform } from 'react-native';

// 创建我的 Stack 的堆栈导航组件
const MineStack = createStackNavigator();

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

// 我的 Stack 组件
export function MineStackNode() {
  return (
    <MineStack.Navigator screenOptions={screenOptions}>
      <MineStack.Screen name="MineNewScreen" component={MineNewScreen} />
      <MineStack.Screen name="MineScreen" component={MineScreen} />
      <MineStack.Screen name="PersonalInfoScreen" component={PersonalSettingScreen} options={{ headerShown: true, title: '个人', headerTitle: '个人' }} />
      <MineStack.Screen name="SettingScreen" component={SettingScreen} options={{ headerShown: true, title: '设置', headerTitle: '设置' }} />
      <MineStack.Screen name="RankingScreen" component={RankingScreen} options={{ headerShown: true, title: `${new Date().getMonth() + 1}月 排行榜`, headerTitle: `${new Date().getMonth() + 1}月 排行榜` }} />
      <MineStack.Screen name="CourseManagementScreen" component={CourseManagementScreen} options={{ headerShown: true, title: '课程管理', headerTitle: '课程管理' }} />
      <MineStack.Screen name="LED_TestScreen" component={LED_TestScreen} options={{ headerShown: true, title: '岩灯测试', headerTitle: '岩灯测试' }} />
      <MineStack.Screen name="CourseEditScreen" component={CourseEditScreen} options={{ headerShown: true, title: '课程信息', headerTitle: '课程信息' }} />
      <MineStack.Screen name="CourseLinesEditScreen" component={CourseLinesEditScreen} options={{ headerShown: true, title: '课程线路', headerTitle: '课程线路' }} />
      <MineStack.Screen name="LineLayoutScreen" component={LineLayoutScreen} />
      <MineStack.Screen name="LineCreatePart1Screen" component={LineCreatePart1Screen} />
      <MineStack.Screen name="LineCreatePart2Screen" component={LineCreatePart2Screen} />
      <MineStack.Screen name="DraftBoxScreen" component={DraftBoxScreen} options={{ headerShown: true, title: '草稿箱', headerTitle: '草稿箱' }} />
      <MineStack.Screen name="Show_WX_AndEmailScreen" component={Show_WX_AndEmailScreen} options={{ headerShown: true, title: '申请开通线路设计权限', headerTitle: '申请开通线路设计权限' }} />
      <MineStack.Screen name="InstructionsScreen" component={InstructionsScreen} options={{ headerShown: true, title: '使用说明', headerTitle: '使用说明' }} />
      <MineStack.Screen name="UserManagmentScreen" component={UserManagmentScreen} options={{ headerShown: true, title: '用户管理', headerTitle: '用户管理' }} />
      <MineStack.Screen name="MessageNotificationScreen" component={MessageNotificationScreen} options={{ headerShown: true, title: '消息通知', headerTitle: '消息通知' }} />
      <MineStack.Screen name="LineFeedbackListScreen" component={LineFeedbackListScreen} options={{ headerShown: true, title: '线路反馈', headerTitle: '线路反馈' }} />
      <MineStack.Screen name="AddMessageNotificationScreen" component={AddMessageNotificationScreen} options={{ headerShown: true, title: '创建消息通知', headerTitle: '创建消息通知' }} />
      <MineStack.Screen name="BoardTypeSettingScreen" component={BoardTypeSettingScreen} options={{ headerShown: true, title: '修改岩板类型', headerTitle: '修改岩板类型' }} />
      <MineStack.Screen name="TempBoardTypeSettingScreen" component={TempBoardTypeSettingScreen} options={{ headerShown: true, title: '修改岩板类型', headerTitle: '修改岩板类型' }} />
      <MineStack.Screen name="LineCompleteScreen" component={LineCompleteScreen} />
      <MineStack.Screen name="MyDesignLinesScreen" component={MyDesignLinesScreen} options={{ headerShown: true, title: '我设计的', headerTitle: '我设计的' }} />
      <MineStack.Screen name="FavoritesScreen" component={FavoritesScreen} options={{ headerShown: true, title: '收藏夹', headerTitle: '收藏夹' }} />
      <MineStack.Screen name="CompleteRecordScreen" component={CompleteRecordScreen} options={{ headerShown: true, title: '完成历史', headerTitle: '完成历史' }} />
      <MineStack.Screen name="DraftLinePart1Screen" component={DraftLinePart1Screen} />
      <MineStack.Screen name="DraftLinePart2Screen" component={DraftLinePart2Screen} />
      <MineStack.Screen name="AddCourseLinePart1Screen" component={AddCourseLinePart1Screen} />
      <MineStack.Screen name="AddCourseLinePart2Screen" component={AddCourseLinePart2Screen} />
      <MineStack.Screen name="BoardAngelSettingScreen" component={BoardAngelSettingScreen} options={{ headerShown: true, title: '修改岩板角度', headerTitle: '修改岩板角度' }} />
      <MineStack.Screen name="ColorPickScreen" component={ColorPickScreen} options={{ headerShown: true, title: '岩点颜色测试', headerTitle: '岩点颜色测试' }} />
      <MineStack.Screen name="LineDetailScreen" component={LineDetailScreen} options={{ headerShown: true, title: '线路信息', headerTitle: '线路信息' }} />
      <MineStack.Screen name="MessageDetailScreen" component={MessageDetailScreen} options={{ headerShown: true, title: '通知详情', headerTitle: '通知详情' }} />
      <MineStack.Screen name="FeedbackLineLayoutScreen" component={FeedbackLineLayoutScreen} />
      <MineStack.Screen name="LineCreatePart2ForLevelScreen" component={LineCreatePart2ForLevelScreen} />
      <MineStack.Screen name="LineCreatePart1ForLevelScreen" component={LineCreatePart1ForLevelScreen} />
      <MineStack.Screen name="AdminFeatureScreen" component={AdminFeatureScreen} options={{ headerShown: true, title: '管理员功能', headerTitle: '管理员功能' }} />
      <MineStack.Screen name="UserPresentationScreen" component={UserPresentationScreen} />
      <MineStack.Screen name="UserFansListScreen" component={UserFansListScreen} />
      <MineStack.Screen name="EditBriefScreen" component={EditBriefScreen} />
      <MineStack.Screen name="EditLinksScreen" component={EditLinksScreen} />
      <MineStack.Screen name="userFollowedListScreen" component={userFollowedListScreen} />
    </MineStack.Navigator>
  );
}