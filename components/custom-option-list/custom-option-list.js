import React from "react";
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { styles } from "./custom-option-list.styles";

// 自定义选项列表组件

// prop: {
//     listItem: FlatList 组件返回的列表项数据，一般包含id、name、icon(可选)属性,
//     hideArrow: 隐藏箭头，布尔值
//     onPress: 选项点击事件的绑定函数
// }

export const CustomOptionList = ({ listItem, hideArrow, onPress }) => {
    return (
        <TouchableOpacity style={styles.optionBox} onPress={onPress}>
            <View style={styles.option}>
                {listItem['icon'] && <Image source={listItem.icon} style={styles.optionIcon}></Image>}
                <Text style={styles.optionLable}>{listItem.name}</Text>
            </View>
            {!hideArrow &&
                <Image source={require('../../static/img/common-icons/arrow-right.png')} style={styles.arrowRight}></Image>
            }
        </TouchableOpacity>
    );
};

// 用于 FlatList 组件的 ItemSeparatorComponent 属性的列表项分割线组件
export const CustomOptionSeparator = () => {
    return <View style={styles.separator}></View>;
};