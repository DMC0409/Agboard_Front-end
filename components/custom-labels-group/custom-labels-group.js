import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, useWindowDimensions } from 'react-native';
import { styles } from "./custom-labels-group.styles";

// 自定义标签组

// prop: {
//     labelList: 标签数组，包含id、name、selected、disable 属性,
//     singleOnly: 仅单选、可多选模式，布尔值
//     labelOnPress: 选项点击事件的绑定函数,
// }

export const CustomLabelsGroup = ({ labelList, singleOnly, labelOnPress }) => {
    // 屏幕尺寸
    let screenWidth = useWindowDimensions().width;
    let screenHeight = useWindowDimensions().height;

    // state
    const [listState, setListState] = useState([]);

    // 每当prop改变时，赋值进state
    useEffect(() => {
        setListState([...labelList]);
    }, [labelList]);

    // 改变按钮状态
    const changeLabelStatus = (item) => {
        let targetIndex = null;
        listState.forEach((element, index) => {
            if (element.id === item.id) {
                targetIndex = index;
            }
        });
        if (targetIndex !== null) {
            const list = [...listState];
            // 如果是单选模式，先将全部标签置false
            if (singleOnly) {
                list.forEach((element) => element.selected = false);
            }
            list[targetIndex].selected = !list[targetIndex].selected;
            setListState(list);
        }
    }

    // 点击事件处理
    const handlerOnPress = (item) => {
        changeLabelStatus(item);
        labelOnPress(item);
    }

    const list = [...listState].map((item) => {
        return item.disable === true ?
            (
                <TouchableOpacity
                    disabled={true}
                    key={item.id}
                    style={{...styles.label, opacity: 0.5}}
                    onPress={() => handlerOnPress(item)}
                >
                    <Text
                        style={{...styles.labelText, color: '#b5b5b5'}}>{item.name}
                    </Text>
                </TouchableOpacity>
            )
            :
            (
                <TouchableOpacity
                    key={item.id}
                    style={item.selected ? styles.labelSelected : styles.label}
                    onPress={() => handlerOnPress(item)}
                >
                    <Text
                        style={item.selected ? styles.labelTextSelected : styles.labelText}>{item.name}
                    </Text>
                </TouchableOpacity>
            )
    });

    return (
        <View style={{ ...styles.labelBox, flex: 1 }}>
            {list}
        </View>
    );
};