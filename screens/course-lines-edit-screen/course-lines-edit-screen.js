import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, FlatList, Image } from 'react-native';
import CustomLineList from "../../components/custom-line-list/custom-line-list";
import { styles } from "./course-lines-edit-screen.styles";
import { http, GET, POST } from "../../common/http";
import { connect } from "react-redux";
import { getUserInfo } from "../../redux/selectors";
import { toastMessage } from "../../common/global";

// 视图主组件
const CourseLinesEditScreen = ({ route, navigation, userID }) => {
    // 课程线路列表
    const [lineList, setLineList] = useState([]);
    // 排序模式
    const [sortMode, setSortMode] = useState(false);
    // 编辑模式
    const [editMode, setEditMode] = useState(false);

    // 获得参数时，获取线路详细信息
    useEffect(() => {
        if (!route.params) {
            return;
        }
        getCourseLines(route.params.course.id);
    }, [route.params]);

    // 当页面聚焦时，重新获取数据
    useEffect(() => {
        // 当页面参数都填充好时绑定 focus 监听函数
        const unsubscribe = navigation.addListener('focus', () => {
            if (route.params.course.id) {
                getCourseLines(route.params.course.id);
            }
        });
        return () => {
            unsubscribe();
        };
    }, [navigation]);

    // 根据sort排序
    const lineSort = (lineList) => {
        if (lineList && lineList.length) {
            const list = [...lineList]
            list.sort((itemA, itemB) => {
                if (parseInt(itemA.sort) > parseInt(itemB.sort)) {
                    return 1;
                } else if (parseInt(itemA.sort) < parseInt(itemB.sort)) {
                    return -1;
                } else {
                    return 0;
                }
            });
            return list;
        } else {
            return [];
        }
    }

    // 删除线路
    const deleteLine = (line) => {
        if (!line) {
            return;
        }
        http(`course/line/delete/${line.lineId}`, GET)
            .then((res) => {
                // errorCode
                if (res.errCode) {
                    console.error('response error code: ', res.errCode);
                    toastMessage(`请求失败`);
                    return;
                }
                // response处理
                if (res.data) {
                    console.log('删除成功');
                    toastMessage(`删除成功`);
                    getCourseLines(route.params.course.id);
                } else {
                    toastMessage(`删除失败`);
                }
            })
            .catch((error) => {
                console.error(error);
                toastMessage(`请求失败`);
            })
    }

    // 获得课程线路列表
    const getCourseLines = (courseID) => {
        http(`course/lines/${courseID}/${userID}`, GET)
            .then((res) => {
                // errorCode
                if (res.errCode) {
                    console.error('response error code: ', res.errCode);
                    toastMessage(`请求失败`);
                    return;
                }
                // response处理
                if (res.data) {
                    res.data = res.data.map(item => {
                        return { ...item, lineId: item.id, lineName: item.name }
                    });
                    // 根据sort排序
                    setLineList(lineSort(res.data));
                }
            })
            .catch((error) => {
                console.error(error);
                toastMessage(`请求失败`);
            })
    }

    // 排序线路并上传
    const sortLine = (lineList) => {
        setLineList(lineList);
        if (lineList && lineList.length) {
            const data = [];
            lineList.forEach((item, index) => {
                data.push({ id: item.id, sort: (index + 1).toString() })
            })
            // 请求
            http(`course/line/sort/update`, POST, {
                body: data
            })
                .then((res) => {
                    // errorCode
                    if (res.errCode) {
                        console.error('response error code: ', res.errCode);
                        toastMessage(`请求失败`);
                        return;
                    }
                    // response处理
                    if (res.data) {
                        console.log('排序成功');
                    }
                })
                .catch((error) => {
                    console.error(error);
                    toastMessage(`请求失败`);
                })
        }
    }

    // 返回react组件
    return (
        <View style={{ flex: 1 }}>
            {/* 线路列表 */}
            <View style={{ flex: 1 }}>
                <CustomLineList
                    navigation={navigation}
                    lineList={lineList}
                    showID={true}
                    sortMode={sortMode}
                    editMode={editMode}
                    onPress={(item, index) => { navigation.navigate('AddCourseLinePart1Screen', { course: item }) }}
                    onDelete={(item) => { deleteLine(item) }}
                    onSort={(item) => { sortLine(item) }}
                />
            </View>
            {/* 新增线路 */}
            <TouchableOpacity
                onPress={() => { navigation.navigate('AddCourseLinePart1Screen', { course: route.params.course }) }}
                style={{ position: 'absolute', bottom: 20, right: 15, backgroundColor: '#e6e6e6', borderRadius: 50, height: 50, width: 50, alignItems: 'center', justifyContent: 'center' }}
            >
                <Image source={require('../../static/img/common-icons/add.png')} style={{ height: 35, width: 35 }}></Image>
            </TouchableOpacity>
            {/* 编辑模式按钮 */}
            <TouchableOpacity
                onPress={() => { setEditMode(!editMode); setSortMode(false) }}
                style={{ position: 'absolute', bottom: 20, right: 80, backgroundColor: editMode ? '#bababa' : '#e6e6e6', borderRadius: 50, height: 50, width: 50, alignItems: 'center', justifyContent: 'center' }}
            >
                <Image source={require('../../static/img/common-icons/setting-filling.png')} style={{ height: 35, width: 35 }}></Image>
            </TouchableOpacity>
            {/* 排序模式按钮 */}
            <TouchableOpacity
                onPress={() => { setSortMode(!sortMode); setEditMode(false) }}
                style={{ position: 'absolute', bottom: 20, right: 145, backgroundColor: sortMode ? '#bababa' : '#e6e6e6', borderRadius: 50, height: 50, width: 50, alignItems: 'center', justifyContent: 'center' }}
            >
                <Image source={require('../../static/img/common-icons/ascending.png')} style={{ height: 35, width: 35 }}></Image>
            </TouchableOpacity>
        </View>
    );
}

const mapStateToProps = state => {
    return {
        ...getUserInfo(state),
    };
};

export default connect(
    mapStateToProps,
    {}
)(CourseLinesEditScreen);