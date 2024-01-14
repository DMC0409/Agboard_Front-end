import React from "react";
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { styles } from "./custom-user-list.style";
import { AVATAR_IMG_URL } from "../../config/http";
import { DEFAULT_AVATER } from "../../config/mine";

// 自定义选项列表组件

// prop: {
//     listItem: FlatList 组件返回的列表项数据，包含id、userName、avatar(可选)属性,
//     hideArrow: 隐藏箭头，布尔值
//     onPress: 选项点击事件的绑定函数
// }

export const CustomUserList = ({ listItem, hideArrow, onPress, userToken }) => {
    return (
        <TouchableOpacity style={styles.optionBox} onPress={onPress}>
            <View style={styles.option}>
                {listItem['avatar'] ?
                    <Image
                        source={{
                            uri: `${AVATAR_IMG_URL}${listItem.avatar}`,
                            headers: { 'Authorization': userToken }
                        }}
                        style={styles.optionIcon}></Image>
                    :
                    <Image source={DEFAULT_AVATER} style={styles.optionIcon}></Image>
                }
                <Text style={styles.optionLable}>{listItem.userName}</Text>
            </View>
            <View style={{flexDirection: 'row'}}>
                {listItem.cert === 1 &&
                    <Image source={require('../../static/img/common-icons/V-idenity.png')} style={styles.optionIcon}></Image>
                }
                {listItem.linePermission !== 2 &&
                    <Image source={require('../../static/img/common-icons/brush_fill.png')} style={styles.optionIcon}></Image>
                }
                {listItem.coursePermission === 1 &&
                    <Image source={require('../../static/img/common-icons/task_fill.png')} style={styles.optionIcon}></Image>
                }
                {!hideArrow &&
                    <Image source={require('../../static/img/common-icons/arrow-right.png')} style={styles.arrowRight}></Image>
                }
            </View>
        </TouchableOpacity>
    );
};

// 用于 FlatList 组件的 ItemSeparatorComponent 属性的列表项分割线组件
export const CustomUserSeparator = () => {
    return <View style={styles.separator}></View>
};