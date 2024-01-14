import React, { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, FlatList, Image, useWindowDimensions } from 'react-native';
import { styles } from "./course-management-screen.styles";
import { http, GET, POST } from "../../common/http";
import { imgScale } from "../../config/course";
import { COURSE_IMG_URL } from "../../config/http";
import { Button, Overlay } from 'react-native-elements';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist'
import { connect } from "react-redux";
import { toastMessage } from "../../common/global";
import { getUserInfo, getUserToken } from "../../redux/selectors";
import { USER_ROLE } from "../../config/login";

// 视图主组件
const CourseManagementScreen = ({ navigation, userID, userRole, userToken }) => {
    // 屏幕宽度
    const screenWidth = useWindowDimensions().width;

    // 编辑模式
    const [editMode, setEditMode] = useState(false);
    // 排序模式
    const [sortMode, setSortMode] = useState(false);
    // 确认删除弹出框
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    // 需要删除的目标
    const [needDelete, setNeedDelete] = useState();
    // 课程列表
    const [courseList, setCourseList] = useState([]);

    // 组件初始化
    useEffect(() => {
    }, []);

    // 当页面聚焦时，重新获取数据
    useEffect(() => {
        // 当页面参数都填充好时绑定 focus 监听函数
        const unsubscribe = navigation.addListener('focus', () => {
            getCoures();
        });
        return () => {
            unsubscribe();
        };
    }, [navigation]);

    // 获取课程列表
    const getCoures = () => {
        http(`course/courses/${userRole === USER_ROLE.ADMIN ? '*' : userID}`, GET)
            .then((res) => {
                // errorCode
                if (res.errCode) {
                    console.error('response error code: ', res.errCode);
                    toastMessage(`请求失败`);
                    return;
                }
                // response处理
                if (res.data) {
                    const courseList = [...res.data]
                    courseList.sort((itemA, itemB) => {
                        if (parseInt(itemA.sort) > parseInt(itemB.sort)) {
                            return 1;
                        } else if (parseInt(itemA.sort) < parseInt(itemB.sort)) {
                            return -1;
                        } else {
                            return 0;
                        }
                    });
                    setCourseList(courseList);
                }
            })
            .catch((error) => {
                console.error(error);
                toastMessage(`请求失败`);
            })
    }

    // 删除课程
    const deleteCoures = () => {
        if (!needDelete) {
            return;
        }
        http(`course/delete/${needDelete.id}`, GET)
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
                    getCoures();
                } else {
                    console.log('删除失败');
                    toastMessage(`删除失败`);
                }
            })
            .catch((error) => {
                console.error(error);
                toastMessage(`请求失败`);
            })
            .finally(() => {
                setNeedDelete(null);
                setDeleteConfirm(false);
            })
    }

    // 编辑课程
    const editCoures = (course) => {
        navigation.navigate('CourseEditScreen', { courseInfo: { ...course } })
    }

    // 课程排序
    const courseSort = (courseList) => {
        setCourseList(courseList);
        if (courseList && courseList.length) {
            const data = [];
            courseList.forEach((item, index) => {
                data.push({ id: item.id, sort: (index + 1).toString() })
            })
            // 请求
            http(`course/sort/update`, POST, {
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

    // 列表项
    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={{ backgroundColor: '#ffffff', marginTop: 10, borderRadius: 8 }}
            onPress={() => { navigation.navigate('CourseLinesEditScreen', { course: { ...item } }) }}
        >
            {/* 封面 */}
            {!!item.imgUrl &&
                <Image
                    source={{
                        uri: `${COURSE_IMG_URL}${item.imgUrl}`,
                        headers: { 'Authorization': userToken }
                    }}
                    style={{ width: screenWidth - 20, height: (screenWidth - 20) / imgScale, resizeMode: 'contain', borderRadius: 2 }}
                ></Image>
            }
            <View style={{ paddingHorizontal: 15, paddingVertical: 10, }}>
                {/* 名称 */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 0 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                        <Text style={{ fontWeight: 'bold', fontSize: 15 }}>{item.name}</Text>
                        {item.private === '1' &&
                            < Image source={require('../../static/img/common-icons/lock.png')} style={{ height: 20, width: 20, marginLeft: 5 }}></Image>
                        }
                    </View>
                    <View></View>
                </View>
                {/* 子标题 */}
                {!!item.subtitle &&
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5, marginLeft: 10 }}>
                        <Text style={{ color: '#808080', fontSize: 14 }}>“{item.subtitle}”</Text>
                    </View>
                }
                {/* 编辑选项 */}
                {!!editMode &&
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 5, marginLeft: 10 }}>
                        <Button
                            title="删除"
                            containerStyle={styles.levelButtonBox}
                            buttonStyle={[styles.levelButton, { backgroundColor: '#d81e06' }]}
                            titleStyle={styles.levelButtonText}
                            onPress={() => { setDeleteConfirm(true), setNeedDelete(item) }}
                        />
                        <Button
                            title="编辑"
                            containerStyle={[styles.levelButtonBox, { marginLeft: 10 }]}
                            buttonStyle={[styles.levelButton]}
                            titleStyle={styles.levelButtonText}
                            onPress={() => { editCoures(item) }}
                        />
                    </View>
                }
            </View>
        </TouchableOpacity>
    );

    // 排序列表项
    const sortRenderItem = useCallback(
        ({ item, index, drag, isActive }: RenderItemParams<Item>) => {
            return (
                <TouchableOpacity
                    style={{ backgroundColor: '#ffffff', marginTop: 10, borderRadius: 8 }}
                    onLongPress={drag}
                >
                    {/* 封面 */}
                    {!!item.imgUrl &&
                        <Image
                            source={{
                                uri: `${COURSE_IMG_URL}${item.imgUrl}`,
                                headers: { 'Authorization': userToken }
                            }}
                            style={{ width: screenWidth - 20, height: (screenWidth - 20) / imgScale, resizeMode: 'contain', borderRadius: 2 }}
                        ></Image>
                    }
                    <View style={{ paddingHorizontal: 15, paddingVertical: 10 }}>
                        {/* 名称 */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 0 }}>
                            <View style={{ flexDirection: 'row' }}>
                                <Text style={{ fontWeight: 'bold', fontSize: 15 }}>{item.name}</Text>
                            </View>
                            <View></View>
                        </View>
                        {/* 适合人群 */}
                        {!!item.subtitle &&
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5, marginLeft: 10 }}>
                                <Text style={{ color: '#808080', fontSize: 14 }}>“{item.subtitle}”</Text>
                            </View>
                        }
                    </View>
                </TouchableOpacity>
            );
        },
        []
    );

    // 返回react组件
    return (
        <View style={{ flex: 1, paddingHorizontal: 10 }}>
            {/* 课程列表 */}
            <View style={{ flex: 1 }}>
                {sortMode ?
                    // 排序模式
                    <DraggableFlatList
                        data={courseList}
                        renderItem={sortRenderItem}
                        keyExtractor={item => item.id}
                        onDragEnd={({ data }) => courseSort(data)}
                    />
                    :
                    // 正常模式
                    <FlatList
                        data={courseList}
                        renderItem={renderItem}
                        keyExtractor={item => item.id}
                    />
                }
                {/* 新增按钮 */}
                <TouchableOpacity
                    onPress={() => { navigation.navigate('CourseEditScreen') }}
                    style={{ position: 'absolute', bottom: 20, right: 5, backgroundColor: '#e6e6e6', borderRadius: 50, height: 50, width: 50, alignItems: 'center', justifyContent: 'center' }}
                >
                    <Image source={require('../../static/img/common-icons/add.png')} style={{ height: 35, width: 35 }}></Image>
                </TouchableOpacity>
                {/* 编辑模式按钮 */}
                <TouchableOpacity
                    onPress={() => { setEditMode(!editMode), setSortMode(false) }}
                    style={{ position: 'absolute', bottom: 20, right: 70, backgroundColor: editMode ? '#bababa' : '#e6e6e6', borderRadius: 50, height: 50, width: 50, alignItems: 'center', justifyContent: 'center' }}
                >
                    <Image source={require('../../static/img/common-icons/setting-filling.png')} style={{ height: 35, width: 35 }}></Image>
                </TouchableOpacity>
                {/* 排序模式按钮 */}
                <TouchableOpacity
                    onPress={() => { setSortMode(!sortMode); setEditMode(false) }}
                    style={{ position: 'absolute', bottom: 20, right: 135, backgroundColor: sortMode ? '#bababa' : '#e6e6e6', borderRadius: 50, height: 50, width: 50, alignItems: 'center', justifyContent: 'center' }}
                >
                    <Image source={require('../../static/img/common-icons/ascending.png')} style={{ height: 35, width: 35 }}></Image>
                </TouchableOpacity>
            </View>
            <Overlay isVisible={deleteConfirm} onBackdropPress={() => { setDeleteConfirm(false) }}>
                <View style={{ ...styles.overlayBox, width: screenWidth * 0.7 }}>
                    <View>
                        <Text style={styles.overlayTitle}>确认要删除此课程吗？</Text>
                    </View>
                    <View style={styles.buttonGroup}>
                        <Button
                            title="取消"
                            type="clear"
                            titleStyle={styles.cancelButtonBox}
                            buttonStyle={styles.cancelButton}
                            onPress={() => setDeleteConfirm(false)}
                        />
                        <Button
                            title="确认"
                            type="clear"
                            titleStyle={styles.saveButtonBox}
                            buttonStyle={styles.saveButton}
                            onPress={() => deleteCoures()}
                        />
                    </View>
                </View>
            </Overlay>
        </View>
    );
}

const mapStateToProps = state => {
    return {
        userToken: getUserToken(state),
        userID: getUserInfo(state).userID,
        userRole: getUserInfo(state).userRole,
    };
};

export default connect(
    mapStateToProps,
    {}
)(CourseManagementScreen);