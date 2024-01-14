import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Image, useWindowDimensions } from 'react-native';
import { styles } from "./course-detail.styles";
import { http, GET, POST } from "../../common/http";
import { imgScale } from "../../config/course";
import { COURSE_IMG_URL } from "../../config/http";
import { Button } from 'react-native-elements';
import { getUserToken } from "../../redux/selectors";
import { connect } from "react-redux";
import { toastMessage } from "../../common/global";

// 视图主组件
export const CourseDetailScreen = ({ route, navigation, userToken }) => {
    // 屏幕宽度
    const screenWidth = useWindowDimensions().width;

    // 课程信息
    const [courseInfo, setCourseInfo] = useState(route.params.course);

    // 获得参数时，获取线路详细信息
    useEffect(() => {
        if (!route.params) {
            return;
        }
        getCourseInfo(route.params.course.id);
    }, [route.params]);

    // 获取课程列表
    const getCourseInfo = (courseID) => {
        http(`course/ID/${courseID}`, GET)
            .then((res) => {
                // errorCode
                if (res.errCode) {
                    console.error('response error code: ', res.errCode);
                    toastMessage(`请求失败`);
                    return;
                }
                // response处理
                if (res.data) {
                    setCourseInfo(res.data);
                }
            })
            .catch((error) => {
                console.error(error);
                toastMessage(`请求失败`);
            })
    }

    // 返回react组件
    return (
        <View style={{ flex: 1 }}>
            <ScrollView style={{ flex: 1 }}>
                {/* 封面 */}
                {!!courseInfo.imgUrl &&
                    <Image
                        source={{
                            uri: `${COURSE_IMG_URL}${courseInfo.imgUrl}`,
                            headers: { 'Authorization': userToken }
                        }}
                        style={{ width: screenWidth, height: (screenWidth) / imgScale, resizeMode: 'contain' }}
                    ></Image>
                }
                <View style={{ padding: 10, paddingHorizontal: 15, backgroundColor: '#fff' }}>
                    {/* 名称 */}
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 0 }}>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={{ fontSize: 18, }}>{courseInfo.name}</Text>
                        </View>
                        <View></View>
                    </View>
                    {/* 子标题 */}
                    {!!courseInfo.subtitle &&
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5, marginLeft: 10 }}>
                            <Text style={{ color: '#808080', fontSize: 14 }}>“{courseInfo.subtitle}”</Text>
                        </View>
                    }
                </View>

                {/* 简介 */}
                {!!courseInfo.introduction &&
                    <View style={{ padding: 12, paddingHorizontal: 15, marginHorizontal: 10, backgroundColor: '#fff', marginTop: 10, borderRadius: 6 }}>

                        <>
                            <Text style={{ fontSize: 14, fontWeight: 'bold' }}>课程介绍：</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 5, paddingHorizontal: 5 }}>
                                <Text style={{ color: '#808080', fontSize: 14 }}>{courseInfo.introduction}</Text>
                            </View>
                        </>

                    </View>
                }
            </ScrollView>
            {/* 查看线路按钮 */}
            <View
                style={{ position: 'absolute', bottom: 20, alignItems: 'center', justifyContent: 'center', width: screenWidth }}
            >
                <Button
                    title="查看课程线路"
                    containerStyle={{ borderRadius: 5 }}
                    buttonStyle={{ alignContent: 'center', justifyContent: 'center', width: screenWidth * 0.9, backgroundColor: '#3366ff' }}
                    titleStyle={{ fontSize: 15 }}
                    onPress={() => { navigation.navigate('CourseLineListScreen', { needRefresh: true, courseID: courseInfo.id }) }}
                />
            </View>
        </View>
    );
}

const mapStateToProps = state => {
    return { userToken: getUserToken(state) };
};

export default connect(
    mapStateToProps,
    {}
)(CourseDetailScreen);