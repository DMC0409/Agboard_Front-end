import React from "react";
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from "./custom-button.styles";

// prop: {
//     value: string 按钮字样,
//     style: StyleSheet对象 用于调节box样式对象,
//     radius: string 可用值为一组默认值的圆角程度：'little','more','full',
//     onPress: 按钮事件的绑定函数
// }

// 匹配指定圆角
const radiusMatching = (propRadius) => {
    switch (propRadius) {
        case 'little':
            return 5
        case 'more':
            return 10
        case 'full':
            return 50
        default:
            return 10
    }
}

export const CustomButton = (prop) => {
    // 匹配圆角
    const radius = radiusMatching(prop.radius);
    return (
        <TouchableOpacity activeOpacity={0.7} onPress={prop.onPress} style={[styles.buttonBox, { borderRadius: radius }, prop.style]}>
            <Text style={styles.buttonFont}>{prop.value}</Text>
        </TouchableOpacity>
    );
};