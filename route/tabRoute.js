// tab 路由

import React from 'react';
import { Image, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { TAB_ICON } from "../config/tab";
import { LineStackNode } from "./lineRoute";
import { TrendsStackNode } from "./trendsRoute";
import { CourseStackNode } from "./courseRoute";
import { MineStackNode } from "./mineRoute";
import OverlayDefaultBoardSetup from "../components/overlay-default-board-setup/overlay-default-board-setup";

// 创建底部 Tab 堆栈导航组件
const Tab = createBottomTabNavigator();
// 导航 Tab 组件
export const TabNode = () => {
    return (
        <View style={{ flex: 1 }}>
            {/* 覆盖框，当用户未选择默认板型和角度时弹出 */}
            <OverlayDefaultBoardSetup />
            <Tab.Navigator
                backBehavior={'none'}
                screenOptions={({ route }) => ({
                    // tab图标配置
                    tabBarIcon: ({ focused, size }) => {
                        let iconSrc;
                        if (route.name === 'LineStackNode') {
                            iconSrc = focused ? TAB_ICON.LINE_FOCUSED : TAB_ICON.LINE;
                        } else if (route.name === 'TrendsStackNode') {
                            iconSrc = focused ? TAB_ICON.TRENDS_FOCUSED : TAB_ICON.TRENDS;
                        } else if (route.name === 'CourseStackNode') {
                            iconSrc = focused ? TAB_ICON.COURSE_FOCUSED : TAB_ICON.COURSE;
                        } else if (route.name === 'MineStackNode') {
                            iconSrc = focused ? TAB_ICON.MINE_FOCUSED : TAB_ICON.MINE;
                        }
                        return <Image source={iconSrc} style={{ height: 25, width: 25 }} />;
                    },
                })}
                // 样式设置
                tabBarOptions={{
                    activeTintColor: '#22934f',
                    inactiveTintColor: '#808080',
                    labelStyle: { fontSize: 12, marginBottom: 6 },
                    iconStyle: { marginTop: 6 },
                    style: { height: 58 }
                }}>
                {/* 线路tab */}
                <Tab.Screen name="LineStackNode" component={LineStackNode} options={{ title: '线路' }} />
                {/* 动态tab */}
                <Tab.Screen name="TrendsStackNode" component={TrendsStackNode} options={{ title: '动态' }} />
                {/* 课程tab */}
                <Tab.Screen name="CourseStackNode" component={CourseStackNode} options={{ title: '课程' }} />
                {/* 我的tab */}
                <Tab.Screen name="MineStackNode" component={MineStackNode} options={{ title: '我的' }} />
            </Tab.Navigator>
        </View>
    );
};