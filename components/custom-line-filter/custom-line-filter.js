import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Image } from 'react-native';
import { Button, CheckBox } from 'react-native-elements';
import { CustomLabelsGroup } from "../../components/custom-labels-group/custom-labels-group";
import MultiSlider from '@ptomasroos/react-native-multi-slider';
import { styles } from "./custom-line-filter.styles";
import { LINE_LEVEL_LIST } from "../../config/line";
import { getBoardSettingType } from "../../redux/selectors";
import { connect } from "react-redux";
import { BOARD_TYPE_NAME } from "../../config/board"

// prop: {
//     filterValue: 当前的筛选条件，属性：（haveVideo, creater, levelValue, labelIDList）,
//     markLabelList: 岩板标签数组,
//     resetOnPress: 重置按钮事件的绑定函数,
//     saveOnPress: 确认按钮事件的绑定函数,
// }

const CustomLineFilter = ({ navigation, filterValueProp, markLabelList, resetOnPress, saveOnPress, referringPage, boardType }) => {
    // 岩板标签数组
    const [labelList, setLabelList] = useState(markLabelList || []);
    // 难度滑动选择器的 Width
    const [sliderWidth, setSliderWidth] = useState(100);
    // 筛选-仅显示抱石线路
    const [normalLineOnly, setNormalLineOnly] = useState(filterValueProp.normalLineOnly || false);
    // 筛选-仅显示难度线路
    const [levelLineOnly, setLevelLineOnly] = useState(filterValueProp.levelLineOnly || false);
    // 筛选-是否具有视频
    const [haveVideo, setHaveVideo] = useState(filterValueProp.haveVideo || false);
    // 筛选-仅显示认证线路
    const [onlyAuthentication, setOnlyAuthentication] = useState(filterValueProp.onlyAuthentication);
    // 筛选-无人完成的线路
    const [onlyNobodyFinish, setOnlyNobodyFinish] = useState(filterValueProp.onlyNobodyFinish);
    // 筛选-我还未完成的线路
    const [onlyINotFinish, setOnlyINotFinish] = useState(filterValueProp.onlyINotFinish);
    // 筛选-大小版
    const [boardSize, setBoardSize] = useState(boardType.id === BOARD_TYPE_NAME.L ? (filterValueProp.boardSize) : false);
    // 筛选-创建人
    const [creater, setCreater] = useState(filterValueProp.creater || '');
    // 筛选-标签 [id, id, id]
    const [labelIDList, setLabelIDList] = useState(filterValueProp.labelIDList || []);
    // 筛选-难度
    const [levelValue, setLevelValue] = useState(filterValueProp.levelValue.length ? filterValueProp.levelValue : [0, LINE_LEVEL_LIST.length - 1]);
    // 筛选-是否包括未知难度
    const [unknownLevel, setUnknownLevel] = useState(filterValueProp.unknownLevel || false);

    // 初始化时，恢复当前选择的筛选条件
    useEffect(() => {
        // 处理标签选择显示
        setLabelList(
            [...labelList].map(item => {
                if (labelIDList.indexOf(item.id) !== -1) {
                    item.selected = true;
                } else {
                    item.selected = false;
                }
                return item
            })
        );
    }, []);

    // 标签选择处理
    const handlerLabelSelect = (item) => {
        const list = [...labelIDList];
        if (item.selected) {
            list.push(item.id);
        } else {
            const index = list.indexOf(item.id);
            list.splice(index, 1);
        }
        setLabelIDList(list);
    }

    // 确认按钮处理
    const handlerSaveClick = () => {
        const data = {
            haveVideo: haveVideo,
            normalLineOnly: normalLineOnly,
            levelLineOnly: levelLineOnly,
            onlyAuthentication: onlyAuthentication,
            onlyNobodyFinish: onlyNobodyFinish,
            onlyINotFinish: onlyINotFinish,
            creater: creater,
            levelValue: levelValue,
            unknownLevel: unknownLevel,
            labelIDList: labelIDList,
            boardSize: boardSize
        }
        navigation.closeDrawer();
        navigation.navigate(referringPage, { filterValue: { ...data }, needRefresh: false });
        saveOnPress({ ...data });
    }

    return (
        <View style={[styles.sortBox]}>
            <View>
                {/* 标签 */}
                <View style={{ ...styles.sortItemBox, marginTop: 0 }}>
                    <Text style={styles.sortTitle}>标签:</Text>
                    <View style={styles.fliterLableBox}>
                        <CustomLabelsGroup labelList={markLabelList} labelOnPress={(item) => { handlerLabelSelect(item) }} />
                    </View>
                </View>
                {/* 难度 */}
                <View style={styles.sortItemBox} onLayout={(e) => { setSliderWidth(parseInt(e.nativeEvent.layout.width) - 40) }}>
                    <Text style={styles.sortTitle}>难度:</Text>
                    <View style={styles.multiSliderBox}>
                        <View style={styles.multiSliderTitleBox}>
                            <Text style={styles.levelText}>{LINE_LEVEL_LIST[levelValue[0]]}</Text>
                            <Text style={styles.levelText}>{LINE_LEVEL_LIST[levelValue[1]]}</Text>
                        </View>
                        <MultiSlider
                            values={levelValue}
                            min={0}
                            max={LINE_LEVEL_LIST.length - 1}
                            step={1}
                            snapped={true}
                            sliderLength={sliderWidth}
                            containerStyle={styles.sliderContainer}
                            markerStyle={styles.sliderMarker}
                            selectedStyle={styles.sliderSelected}
                            onValuesChange={(value) => { setLevelValue(value) }}
                        />
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: -15 }}>
                        <CheckBox
                            containerStyle={{ marginVertical: 0, marginLeft: 0, marginRight: 0 }}
                            checkedIcon={<Image style={styles.selectIcon} source={require('../../static/img/common-icons/check-box.png')} />}
                            uncheckedIcon={<Image style={styles.selectIcon} source={require('../../static/img/common-icons/check-box-outline.png')} />}
                            checked={unknownLevel}
                            onPress={() => setUnknownLevel(!unknownLevel)}
                        />
                        <Text style={{ fontSize: 13 }}>包括未知难度</Text>
                    </View>
                </View>
                {/* 仅显示抱石线路 */}
                {/* <View style={[styles.sortItemBox, styles.fleterHasVideoBox]}>
                    <Text style={styles.sortTitle}>仅显示抱石线路:</Text>
                    <CheckBox
                        containerStyle={styles.selectBox}
                        checkedIcon={<Image style={styles.selectIcon} source={require('../../static/img/common-icons/check-box.png')} />}
                        uncheckedIcon={<Image style={styles.selectIcon} source={require('../../static/img/common-icons/check-box-outline.png')} />}
                        checked={normalLineOnly}
                        onPress={() => { setNormalLineOnly(!normalLineOnly); setLevelLineOnly(false) }}
                    />
                </View> */}
                {/* 仅显示难度线路 */}
                {/* <View style={[styles.sortItemBox, styles.fleterHasVideoBox]}>
                    <Text style={styles.sortTitle}>仅显示难度线路:</Text>
                    <CheckBox
                        containerStyle={styles.selectBox}
                        checkedIcon={<Image style={styles.selectIcon} source={require('../../static/img/common-icons/check-box.png')} />}
                        uncheckedIcon={<Image style={styles.selectIcon} source={require('../../static/img/common-icons/check-box-outline.png')} />}
                        checked={levelLineOnly}
                        onPress={() => { setLevelLineOnly(!levelLineOnly); setNormalLineOnly(false) }}
                    />
                </View> */}
                {/* 视频攻略 */}
                <View style={[styles.sortItemBox, styles.fleterHasVideoBox]}>
                    <Text style={styles.sortTitle}>具有视频攻略:</Text>
                    <CheckBox
                        containerStyle={styles.selectBox}
                        checkedIcon={<Image style={styles.selectIcon} source={require('../../static/img/common-icons/check-box.png')} />}
                        uncheckedIcon={<Image style={styles.selectIcon} source={require('../../static/img/common-icons/check-box-outline.png')} />}
                        checked={haveVideo}
                        onPress={() => setHaveVideo(!haveVideo)}
                    />
                </View>
                {/* 认证线路 */}
                {onlyAuthentication !== undefined &&
                    <View style={[styles.sortItemBox, styles.fleterHasVideoBox]}>
                        <Text style={styles.sortTitle}>具备认证的线路:</Text>
                        <CheckBox
                            containerStyle={styles.selectBox}
                            checkedIcon={<Image style={styles.selectIcon} source={require('../../static/img/common-icons/check-box.png')} />}
                            uncheckedIcon={<Image style={styles.selectIcon} source={require('../../static/img/common-icons/check-box-outline.png')} />}
                            checked={onlyAuthentication}
                            onPress={() => setOnlyAuthentication(!onlyAuthentication)}
                        />
                    </View>
                }
                {/* 无人完成的线路 */}
                {onlyNobodyFinish !== undefined &&
                    <View style={[styles.sortItemBox, styles.fleterHasVideoBox]}>
                        <Text style={styles.sortTitle}>无人完成的线路:</Text>
                        <CheckBox
                            containerStyle={styles.selectBox}
                            checkedIcon={<Image style={styles.selectIcon} source={require('../../static/img/common-icons/check-box.png')} />}
                            uncheckedIcon={<Image style={styles.selectIcon} source={require('../../static/img/common-icons/check-box-outline.png')} />}
                            checked={onlyNobodyFinish}
                            onPress={() => setOnlyNobodyFinish(!onlyNobodyFinish)}
                        />
                    </View>
                }
                {/* 我还未完成的线路 */}
                {onlyINotFinish !== undefined &&
                    <View style={[styles.sortItemBox, styles.fleterHasVideoBox]}>
                        <Text style={styles.sortTitle}>我还未完成的线路:</Text>
                        <CheckBox
                            containerStyle={styles.selectBox}
                            checkedIcon={<Image style={styles.selectIcon} source={require('../../static/img/common-icons/check-box.png')} />}
                            uncheckedIcon={<Image style={styles.selectIcon} source={require('../../static/img/common-icons/check-box-outline.png')} />}
                            checked={onlyINotFinish}
                            onPress={() => setOnlyINotFinish(!onlyINotFinish)}
                        />
                    </View>
                }
                {/* 筛选大小版 */}
                {boardType.id === BOARD_TYPE_NAME.L &&
                    <View style={[styles.sortItemBox, styles.fleterHasVideoBox]}>
                        <Text style={styles.sortTitle}>显示M尺寸岩板的线路:</Text>
                        <CheckBox
                            containerStyle={styles.selectBox}
                            checkedIcon={<Image style={styles.selectIcon} source={require('../../static/img/common-icons/check-box.png')} />}
                            uncheckedIcon={<Image style={styles.selectIcon} source={require('../../static/img/common-icons/check-box-outline.png')} />}
                            checked={boardSize}
                            onPress={() => setBoardSize(!boardSize)}
                        />
                    </View>
                }
                {/* 创建人 */}
                <View style={[styles.sortItemBox, styles.filterCreaterBox]}>
                    <Text style={styles.sortTitle}>创建人:</Text>
                    <View style={styles.sortInpufBox}>
                        <TextInput
                            style={[styles.input]}
                            placeholder="创建人关键字"
                            placeholderTextColor="#BFBFBF"
                            value={creater}
                            onChangeText={text => setCreater(text)}
                        />
                    </View>
                </View>
            </View>
            {/* 操作按钮 */}
            <View style={styles.sortButtonBox}>
                {/* <Button title="重置" containerStyle={styles.sortButton} buttonStyle={styles.sortResetButton} onPress={resetOnPress} /> */}
                <Button title="确认" containerStyle={styles.sortButton} buttonStyle={styles.sortSaveButton} onPress={handlerSaveClick} />
            </View>
        </View>
    );
};

const mapStateToProps = state => {
    return {
        boardType: getBoardSettingType(state),
    };
};

export default connect(
    mapStateToProps,
    {}
)(CustomLineFilter);