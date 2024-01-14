import React, { useState, useCallback, useEffect } from "react";
import { View, Text, TouchableOpacity, FlatList, Image, useWindowDimensions } from 'react-native';
import { styles } from "./custom-line-list.styles";
import { AVATAR_IMG_URL } from "../../config/http";
import { getUserToken } from "../../redux/selectors";
import { connect } from "react-redux";
import { DEFAULT_AVATER } from "../../config/mine";
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist'
import { Button, Overlay } from 'react-native-elements';
import { Rating } from 'react-native-ratings';
import { labelColorMap } from '../../config/line';

// 自定义通用线路列表

// prop: {
//     navigation: 导航对象，用于在此导航栈中塞入线路详情视图,
//     lineList: 线路数组，包含id、name、difficulty、属性,
//     showID: 临时属性，布尔值，是否显示id序号,
//     onPress: 选项点击事件的绑定函数,
//     onRefresh: 下拉刷新事件的绑定函数,
//     refreshing: 在等待加载新数据时将此属性设为 true，列表就会显示出一个正在加载的符号,
//     onEndReached: 当列表被滚动到距离内容最底部时调用,
//     sortMode: 排序模式
//     editMode: 编辑模式
//     onDelete: 选项删除事件的绑定函数
//     onSort: 排序事件的绑定函数
//     isTail: 是否已经到列表数据的底部
//     needHeader: 是否需要回到顶部
// }

const CustomLineList = ({ navigation, lineList, showID, sortMode, editMode, onPress, onRefresh, refreshing, onEndReached, userToken, onDelete, onSort, isTail, needHeader }) => {
    showID = showID || null;
    isTail = isTail || false;
    needHeader = needHeader || false;
    // 屏幕宽度
    const screenWidth = useWindowDimensions().width;

    // 筛选用线路列表
    const [sortLineList, setSortLineList] = useState([...lineList]);
    // 确认删除弹出框
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    // 需要删除的目标
    const [needDelete, setNeedDelete] = useState();
    // 列表对象
    const [listObj, setListObj] = useState({});

    // 当切换排序模式时
    useEffect(() => {
        if (sortMode) {
            setSortLineList([...lineList]);
        }
    }, [sortMode]);

    // 监听是否需要回到顶部
    useEffect(() => {
        setTimeout(() => {
            if (needHeader === true && listObj && lineList && lineList.length > 3) {
                listObj.scrollToIndex({
                    animated: false,
                    index: 0,
                    viewPosition: 0
                });
            }
        }, 0);
    }, [needHeader]);

    // 线路标签列表视图
    const itemLabelArrar = (labelList) => {
        return [...labelList].map((item, index) => {
            return (
                <View key={index}>
                    {
                        !!item &&
                        <View style={{ ...styles.labelBox, borderColor: labelColorMap.has(item) ? labelColorMap.get(item) : '#3366ff' }}>
                            <Text style={{ ...styles.labelText, color: labelColorMap.has(item) ? labelColorMap.get(item) : '#3366ff' }}>{item}</Text>
                        </View>
                    }
                </View>
            )
        });
    }

    // 列表项
    const renderItem = ({ item, index }) => (
        <TouchableOpacity key={index} style={styles.lineItemBox} onPress={() => { onPress(item, index) }}>
            {/* 第一行 */}
            <View style={styles.lineRow1}>
                <View style={styles.titleBox}>
                    <View style={styles.titleBoxLeft}>
                        {/* 大V认证： 1认证  2未认证 */}
                        {item.cert === 1 &&
                            <Image source={require('../../static/img/common-icons/V-idenity.png')} style={styles.VidenityImg}></Image>
                        }
                        {/* 顺序 */}
                        {showID && <Text style={styles.lineID}>{index + 1}</Text>}
                        {/* 名称 */}
                        <Text style={styles.lineName}>{item.name}</Text>
                        {/* 有无视频标识 */}
                        {item.video === '1' && <Image source={require('../../static/img/common-icons/video.png')} style={styles.videoIcon}></Image>}
                        {/* 我是否收藏 */}
                        {item.is_collect &&
                            // 已收藏
                            <View style={styles.lineInfoItem}>
                                <Image source={require('../../static/img/common-icons/collect-fill.png')} style={styles.lineInfoIcon}></Image>
                            </View>
                        }
                    </View>
                    <View style={styles.titleBoxRight}>
                        {/* 角度 */}
                        <Text style={styles.lineLevel2}>{item.angelValue || '未知角度'}</Text>
                        {/* 难度 */}
                        <Text style={styles.lineLevel2}>
                            {'/'}
                            {
                                item.level ?
                                    (
                                        item.level.indexOf('@') !== -1 ?
                                            (
                                                item.type === 2 ?
                                                    item.level.slice(item.level.indexOf('@') + 1)
                                                    : item.level.slice(0, `${item.level}`.indexOf('@'))
                                            )
                                            : item.level
                                    )
                                    : '未知难度'
                            }
                        </Text>
                    </View>
                </View>
            </View>
            {/* 第二行 */}
            <View style={styles.lineRow2}>
                <View style={styles.lineRow2Left}>
                    {item.labels && item.labels.length !== 0 && item.labels[0] !== '' &&
                        // 标签
                        <View style={styles.lineLable}>{itemLabelArrar(item.labels)}</View>
                    }
                </View>
                <View style={styles.lineRow2Right}>
                    {/* 该用户是否已完成 */}
                    {item.complete === '1' &&
                        <View>
                            <Text style={styles.lineInfoText}>{'已完成'}</Text>
                        </View>
                    }
                </View>
            </View>
            {/* 第三行 */}
            {false &&
                <View style={styles.lineRow3}>
                    <View style={styles.lineInfoBox}>
                        {/* 完成数 */}
                        {/* <View style={styles.lineInfoItem}>
                        <Image source={require('../../static/img/common-icons/complete.png')} style={styles.lineInfoIcon}></Image>
                        <Text style={styles.lineInfoText}>{item.completeCount}</Text>
                    </View> */}
                        {/* 收藏数 */}
                        {/* {item.is_collect ?
                        // 已收藏
                        <View style={styles.lineInfoItem}>
                            <Image source={require('../../static/img/common-icons/collect-fill.png')} style={styles.lineInfoIcon}></Image>
                            <Text style={styles.lineInfoText}>{item.collectCount}</Text>
                        </View>
                        :
                        // 未收藏
                        <View style={styles.lineInfoItem}>
                            <Image source={require('../../static/img/common-icons/collect.png')} style={styles.lineInfoIcon}></Image>
                            <Text style={styles.lineInfoText}>{item.collectCount}</Text>
                        </View>
                    } */}
                    </View>
                </View>
            }
            {/* 第四行 */}
            {(item.completeCount !== undefined && item.collectCount !== undefined && item.avgScore !== undefined) &&
                <View style={styles.lineRow4}>
                    {/* 创建人 */}
                    {/* <View style={styles.lineCreaterBox}>
                    {item.avatar === undefined ? false :
                        item.avatar ?
                            <Image
                                source={{
                                    uri: `${AVATAR_IMG_URL}${item.avatar}`,
                                    headers: { 'Authorization': userToken }
                                }}
                                style={styles.linCreaterIcon}
                            ></Image>
                            :
                            <Image source={DEFAULT_AVATER} style={styles.linCreaterIcon}></Image>
                    }
                    <Text style={styles.lineCreaterText}>{item.username}</Text>
                </View> */}
                    {/* SET & FA */}
                    <View style={styles.lineCreaterBox}>
                        <Text style={styles.lineCreaterText2}>{'SET: '}{item.username}{' '}{' FA: '}{item.firstComplete || '(暂无)'}</Text>
                    </View>
                    {/* 评分 */}
                    <View style={styles.lineInfoItem}>
                        {/* <Image source={require('../../static/img/common-icons/rate.png')} style={styles.lineInfoIcon}></Image>
                            <Text style={styles.lineInfoText}>{parseFloat(item.avgScore) === 0 ? '未评星' : parseFloat(item.avgScore).toFixed(2)}</Text> */}
                        <Rating
                            ratingCount={5}
                            startingValue={parseFloat(item.avgScore)}
                            imageSize={12}
                            readonly={true}
                            showRating={false}
                        />
                    </View>
                    {/* 创建时间 */}
                    {/* <Text style={styles.lineCreateDate}>{item.createTime}</Text> */}
                </View>
            }
            {/* 编辑选项 */}
            {!!editMode &&
                <>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 5, marginLeft: 10 }}>
                        <Button
                            title="删除"
                            containerStyle={styles.levelButtonBox}
                            buttonStyle={[styles.levelButton, { backgroundColor: '#d81e06' }]}
                            titleStyle={styles.levelButtonText}
                            onPress={() => { setDeleteConfirm(true); setNeedDelete(item) }}
                        />
                    </View>
                </>
            }
        </TouchableOpacity>
    );

    // 排序列表项
    const sortRenderItem = useCallback(
        ({ item, index, drag, isActive }) => (
            <TouchableOpacity key={index} style={styles.lineItemBox}
                onLongPress={drag}
            >
                {/* 第一行 */}
                <View style={styles.lineRow1}>
                    <View style={styles.titleBox}>
                        <View style={styles.titleBoxLeft}>
                            {/* 大V认证： 1认证  2未认证 */}
                            {item.cert === 1 &&
                                <Image source={require('../../static/img/common-icons/V-idenity.png')} style={styles.VidenityImg}></Image>
                            }
                            {/* 顺序 */}
                            {showID && <Text style={styles.lineID}>{index + 1}</Text>}
                            {/* 名称 */}
                            <Text style={styles.lineName}>{item.name}</Text>
                            {/* 有无视频标识 */}
                            {item.video === '1' && <Image source={require('../../static/img/common-icons/video.png')} style={styles.videoIcon}></Image>}
                        </View>
                    </View>
                    <View style={styles.titleBoxRight}>
                        {/* 角度 */}
                        <Text style={styles.lineLevel2}>{item.angelValue || '未知角度'}</Text>
                        {/* 难度 */}
                        <Text style={styles.lineLevel2}>{'/'}{item.level || '未知难度'}</Text>
                    </View>
                </View>
                {/* 第二行 */}
                <View style={styles.lineRow2}>
                    <View style={styles.lineRow2Left}>
                        {item.labels && item.labels.length !== 0 && item.labels[0] !== '' &&
                            // 标签
                            <View style={styles.lineLable}>{itemLabelArrar(item.labels)}</View>
                        }
                    </View>
                    <View style={styles.lineRow2Right}>
                        {/* 该用户是否已完成 */}
                        {item.complete === '1' &&
                            <View>
                                <Text style={styles.lineInfoText}>{'已完成'}</Text>
                            </View>
                        }
                    </View>
                </View>
                {/* 第三行 */}
                {false &&
                    <View style={styles.lineRow3}>
                        <View style={styles.lineInfoBox}>
                            {/* 完成数 */}
                            {/* <View style={styles.lineInfoItem}>
                                <Image source={require('../../static/img/common-icons/complete.png')} style={styles.lineInfoIcon}></Image>
                                <Text style={styles.lineInfoText}>{item.completeCount}</Text>
                            </View> */}
                            {/* 收藏数 */}
                            {/* {item.is_collect ?
                                // 已收藏
                                <View style={styles.lineInfoItem}>
                                    <Image source={require('../../static/img/common-icons/collect-fill.png')} style={styles.lineInfoIcon}></Image>
                                    <Text style={styles.lineInfoText}>{item.collectCount}</Text>
                                </View>
                                :
                                // 未收藏
                                <View style={styles.lineInfoItem}>
                                    <Image source={require('../../static/img/common-icons/collect.png')} style={styles.lineInfoIcon}></Image>
                                    <Text style={styles.lineInfoText}>{item.collectCount}</Text>
                                </View>
                            } */}
                        </View>
                    </View>
                }
                {/* 第四行 */}
                {(item.completeCount !== undefined && item.collectCount !== undefined && item.avgScore !== undefined) &&
                    <View style={styles.lineRow4}>
                        {/* 创建人 */}
                        {/* <View style={styles.lineCreaterBox}>
                                    {item.avatar === undefined ? false :
                                        item.avatar ?
                                            <Image
                                                source={{
                                                    uri: `${AVATAR_IMG_URL}${item.avatar}`,
                                                    headers: { 'Authorization': userToken }
                                                }}
                                                style={styles.linCreaterIcon}
                                            ></Image>
                                            :
                                            <Image source={DEFAULT_AVATER} style={styles.linCreaterIcon}></Image>
                                    }
                                    <Text style={styles.lineCreaterText}>{item.username}</Text>
                                </View> */}
                        {/* SET & FA */}
                        <View style={styles.lineCreaterBox}>
                            <Text style={styles.lineCreaterText2}>{'SET:'}{item.username}{' '}{' FA:'}{item.firstComplete}</Text>
                        </View>
                        {/* 评分 */}
                        <View style={styles.lineInfoItem}>
                            {/* <Image source={require('../../static/img/common-icons/rate.png')} style={styles.lineInfoIcon}></Image>
                                        <Text style={styles.lineInfoText}>{parseFloat(item.avgScore) === 0 ? '未评星' : parseFloat(item.avgScore).toFixed(2)}</Text> */}
                            <Rating
                                ratingCount={5}
                                startingValue={parseFloat(item.avgScore)}
                                imageSize={12}
                                readonly={true}
                                showRating={false}
                            />
                        </View>
                        {/* 创建时间 */}
                        {/* <Text style={styles.lineCreateDate}>{item.createTime}</Text> */}
                    </View>
                }
            </TouchableOpacity>
        )
    )

    return (
        <View style={{ flex: 1 }}>
            {(!!lineList && lineList.length === 0) &&
                <View style={{ felx: 1, justifyContent: 'center', alignContent: 'center', paddingVertical: 20 }}>
                    <Text style={{ textAlign: 'center', fontSize: 16, color: '#808080' }}>无线路数据</Text>
                </View>
            }
            {sortMode ?
                // 排序模式
                <DraggableFlatList
                    data={sortLineList}
                    renderItem={sortRenderItem}
                    keyExtractor={(item, index) => index}
                    onDragEnd={({ data }) => { setSortLineList(data); onSort(data) }}
                    onRefresh={onRefresh}
                    refreshing={refreshing}
                    onEndReached={onEndReached}
                    onEndReachedThreshold={0.25}
                    ListFooterComponent={
                        (!!lineList && lineList.length !== 0 && isTail === true) ?
                            <View style={{ felx: 1, justifyContent: 'center', alignContent: 'center', paddingVertical: 15 }}>
                                <Text style={{ textAlign: 'center', fontSize: 14, color: '#808080' }}>——— 到底了 ———</Text>
                            </View>
                            :
                            null
                    }
                />
                :
                // 正常模式
                <FlatList
                    ref={ref => setListObj(ref)}
                    data={lineList}
                    renderItem={renderItem}
                    keyExtractor={(item, index) => index}
                    onRefresh={onRefresh}
                    refreshing={refreshing}
                    onEndReached={onEndReached}
                    onEndReachedThreshold={0.25}
                    ListFooterComponent={
                        (!!lineList && lineList.length !== 0 && isTail === true) ?
                            <View style={{ felx: 1, justifyContent: 'center', alignContent: 'center', paddingVertical: 15 }}>
                                <Text style={{ textAlign: 'center', fontSize: 14, color: '#808080' }}>——— 到底了 ———</Text>
                            </View>
                            :
                            null
                    }
                />
            }
            {/* 删除弹出框 */}
            <Overlay isVisible={deleteConfirm} onBackdropPress={() => { setDeleteConfirm(false) }}>
                <View style={{ ...styles.overlayBox, width: screenWidth * 0.7 }}>
                    <View>
                        <Text style={styles.overlayTitle}>确认要删除此线路吗？</Text>
                    </View>
                    <View style={styles.buttonGroup}>
                        <Button
                            title="取消"
                            type="clear"
                            titleStyle={styles.cancelButtonBox}
                            buttonStyle={styles.cancelButton}
                            onPress={() => { setDeleteConfirm(false); setNeedDelete(null) }}
                        />
                        <Button
                            title="确认"
                            type="clear"
                            titleStyle={styles.saveButtonBox}
                            buttonStyle={styles.saveButton}
                            onPress={() => { setDeleteConfirm(false), onDelete(needDelete) }}
                        />
                    </View>
                </View>
            </Overlay>
        </View>
    );
};

const mapStateToProps = state => {
    return { userToken: getUserToken(state) };
};

export default connect(
    mapStateToProps,
    {}
)(CustomLineList);