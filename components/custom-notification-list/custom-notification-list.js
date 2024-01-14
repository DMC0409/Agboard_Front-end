import React from "react";
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { styles } from "./custom-notification-list.style";

// 自定义选项列表组件

// prop: {
//     listItem: FlatList 组件返回的列表项数据，包含id、title、content、createTime属性,
//     onPress: 选项点击事件的绑定函数
// }

export const CustomNotificationList = ({ listItem, onPress }) => {
    return (
        <View style={{
            flexDirection: 'column',
            paddingHorizontal: 15,
            paddingVertical: 12,
            backgroundColor: '#fff',
            borderRadius: 10,
        }}>
            <View style={styles.optionBox}>
                <View style={styles.option}>
                    {!!listItem.readTime ||
                        <View style={styles.point}></View>
                    }
                    <Text style={styles.optionLable}>{listItem.title}</Text>
                </View>
                <View style={{ flexDirection: 'row' }}>
                    <Text style={{ fontSize: 12, color: '#9a9a9a' }}>{listItem.createTime}</Text>
                </View>
            </View>
            <View style={{ marginTop: 5 }}>
                <Text numberOfLines={2} ellipsizeMode='tail' style={{ fontSize: 14, color: '#9a9a9a' }}>{listItem.content}</Text>
            </View>
            <View style={styles.separator}></View>
            <TouchableOpacity onPress={onPress} style={{}}>
                <Text style={{ fontSize: 16, color: '#000', fontWeight: 'bold' }}>
                    查看详情
                </Text>
            </TouchableOpacity>
        </View>
    );
};

// 用于 FlatList 组件的 ItemSeparatorComponent 属性的列表项分割线组件
export const CustomNotificationSeparator = () => {
    return <View style={{ marginVertical: 5 }}></View>
};