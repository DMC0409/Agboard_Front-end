import React, { useState, useEffect } from "react";
import { View, FlatList, } from 'react-native';
import { styles } from "./color-pick-screen.styles";
import { CustomOptionList, CustomOptionSeparator } from "../../components/custom-option-list/custom-option-list";
import { connect } from "react-redux";
import { getBoardSettingType, getBoardSettingAngel, getUserInfo } from "../../redux/selectors";
import { updateBoardSettingType } from "../../redux/actions";
import { toastMessage } from "../../common/global";
import { ColorPicker, TriangleColorPicker } from 'react-native-color-picker'
import { Button } from 'react-native-elements';
import { toHsv, fromHsv } from 'react-native-color-picker'
import { START, FOOT, HAND, END } from '../../config/board'
import { BT_COLOR_SENT } from '../../config/led'

// 视图主组件
const ColorPickScreen = ({ navigation, userID, currentBoardType, currentAngelType, updateBoardSettingType }) => {
    // 切换选择器类型
    const [isTriangle, setIsTriangle] = useState(false);
    // 当前色值
    const [curColor, setCurColor] = useState('');
    // 同步的颜色回显
    const [start, setStart] = useState('');
    // 同步的颜色回显
    const [foot, setFoot] = useState('');
    // 同步的颜色回显
    const [haed, setHaed] = useState('');
    // 同步的颜色回显
    const [end, setEnd] = useState('');

    // 组件初始化时
    useEffect(() => {

    }, []);

    // 更换颜色指令
    const changeColor = () => {
        // 定义led 8 个颜色的 RGB （第一个默认设为关灯）注意顺序
        const LED_COLOR_DEFINE = [
            // 0 关灯
            0x00, 0x00, 0x00,
            // 1 START
            parseInt(`0x${START.COLOR.slice(1, 3)}`), parseInt(`0x${START.COLOR.slice(3, 5)}`), parseInt(`0x${START.COLOR.slice(5, 7)}`),
            // 2 FOOT
            parseInt(`0x${FOOT.COLOR.slice(1, 3)}`), parseInt(`0x${FOOT.COLOR.slice(3, 5)}`), parseInt(`0x${FOOT.COLOR.slice(5, 7)}`),
            // 3 HAND
            parseInt(`0x${HAND.COLOR.slice(1, 3)}`), parseInt(`0x${HAND.COLOR.slice(3, 5)}`), parseInt(`0x${HAND.COLOR.slice(5, 7)}`),
            // 4 END
            parseInt(`0x${END.COLOR.slice(1, 3)}`), parseInt(`0x${END.COLOR.slice(3, 5)}`), parseInt(`0x${END.COLOR.slice(5, 7)}`),
            // 5 关灯
            0x00, 0x00, 0x00,
            // 6 关灯
            0x00, 0x00, 0x00,
            // 7 关灯
            0x00, 0x00, 0x00,
        ];
        BT_COLOR_SENT.splice(0, BT_COLOR_SENT.length, ...[0xAA, 0x1f, 0x82, 0x00, 0x18, ...LED_COLOR_DEFINE, 0x00, 0x00]);
    }

    // 同步岩点颜色
    const Synchronize = (index) => {
        if (!curColor) {
            alert(`未记录到颜色，请滑动指针`)
        }
        if (index === 1) {
            START.COLOR = curColor;
            setStart(curColor);
            changeColor();
        } else if (index === 2) {
            FOOT.COLOR = curColor;
            setFoot(curColor);
            changeColor();
        } else if (index === 3) {
            HAND.COLOR = curColor;
            setHaed(curColor);
            changeColor();
        } else if (index === 4) {
            END.COLOR = curColor;
            setEnd(curColor);
            changeColor();
        }
    }

    // 返回react组件
    return (
        <View style={styles.box}>
            <Button
                title="点击切换选择器类型"
                onPress={() => { setIsTriangle(!isTriangle) }}
                containerStyle={{ margin: 5, marginBottom: 0 }}
            />
            {isTriangle &&
                <TriangleColorPicker
                    onColorSelected={color => alert(`色值: ${color}`)}
                    onColorChange={color => setCurColor(fromHsv({ h: color.h, s: color.s, v: color.v }))}
                    style={{ flex: 1, marginBottom: 20 }}
                />
            }
            {isTriangle ||
                <ColorPicker
                    onColorSelected={color => alert(`色值: ${color}`)}
                    onColorChange={color => setCurColor(fromHsv({ h: color.h, s: color.s, v: color.v }))}
                    style={{ flex: 1, margin: 20 }}
                />
            }
            <Button
                title={`同步到始点${start}`}
                onPress={() => { Synchronize(1) }}
                containerStyle={{ margin: 8 }}
            />
            <Button
                title={`同步到仅脚点${foot}`}
                onPress={() => { Synchronize(2) }}
                containerStyle={{ margin: 8 }}
            />
            <Button
                title={`同步到手脚点${haed}`}
                onPress={() => { Synchronize(3) }}
                containerStyle={{ margin: 8 }}
            />
            <Button
                title={`同步到终点${end}`}
                onPress={() => { Synchronize(4) }}
                containerStyle={{ margin: 8 }}
            />
        </View>
    );
}

const mapStateToProps = state => {
    return {
        currentBoardType: getBoardSettingType(state),
        currentAngelType: getBoardSettingAngel(state),
        userID: getUserInfo(state).userID
    };
};

export default connect(
    mapStateToProps,
    { updateBoardSettingType }
)(ColorPickScreen);