import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Image, useWindowDimensions, TextInput } from 'react-native';
import { Button } from 'react-native-elements';
import { styles } from "./course-edit-screen.styles";
import ImagePicker from "react-native-image-crop-picker";
import RNFetchBlob from 'rn-fetch-blob'
import { getUserToken, getBoardSettingType, getUserInfo } from "../../redux/selectors";
import { connect } from "react-redux";
import { imgScale } from "../../config/course";
import { toastMessage } from "../../common/global";
import { BOARD_TYPE_NAME } from "../../config/board";
import { BACK_END_URL, BACK_END_API, COURSE_IMG_URL } from "../../config/http";
import { SearchBar, Overlay, CheckBox } from 'react-native-elements';
import { CustomLabelsGroup } from "../../components/custom-labels-group/custom-labels-group";

// 视图主组件
const CourseEditScreen = ({ route, navigation, userToken, userID, boardType }) => {
    const TYPE_OPTION = [
        {
            id: 1,
            name: '公开课程',
            selected: true
        },
        {
            id: 2,
            name: '私人课程',
            selected: false
        },
        {
            id: 3,
            name: '连线活动',
            selected: false
        },
    ]

    // 屏幕宽度
    const screenWidth = useWindowDimensions().width;

    // 表单值-名称
    const [nameValue, setNameValue] = useState('');
    // 表单值-名称
    const [typeValue, setTypeValue] = useState(1);
    // 表单值-简介
    const [introductionValue, setIntroductionValue] = useState('');
    // 表单值-注意事项
    // const [Value, setValue] = useState('');
    // 表单值-副标题
    const [subtitleValue, setSubtitleValue] = useState('');
    // 表单值-选取的图片路径
    const [imgValue, setImgValue] = useState('');
    // 表单值-是否私有课程
    const [privateCourse, setPrivateCourse] = useState(false);
    // 表单值-私有课程密码
    const [privateCoursePsw, setPrivateCoursePsw] = useState('');
    // 名称 input message
    const [nameInputMessage, setNameInputMessage] = useState('');
    // 课程密码 input message
    const [pswInputMessage, setPswInputMessage] = useState('');
    // 选取的图片base64
    const [imgBase64, setImgBase64] = useState('');
    // 编辑模式下的课程ID
    const [courseID, setCourseID] = useState('');
    // 编辑模式下的课程sort
    const [courseSort, setCourseSort] = useState('');
    // 编辑模式下的课程img
    const [courseImg, setCourseImg] = useState('');
    // 课程创建人
    const [creater, setCreater] = useState('');

    // 类型值变化
    useEffect(() => {
        TYPE_OPTION.forEach(item => {
            if (item.id === typeValue) {
                item.selected = true;
            } else {
                item.selected = false;
            }
        })
    }, [typeValue]);

    // 有路由参数则为编辑模式
    useEffect(() => {
        if (route.params && route.params.courseInfo) {
            // 还原表单
            setNameValue(route.params.courseInfo.name);
            setCourseID(route.params.courseInfo.id);
            setCourseSort(route.params.courseInfo.sort);
            setIntroductionValue(route.params.courseInfo.introduction);
            setSubtitleValue(route.params.courseInfo.subtitle);
            setCourseImg(route.params.courseInfo.imgUrl);
            setPrivateCourse(route.params.courseInfo.private === '1' ? true : false);
            setPrivateCoursePsw(route.params.courseInfo.password);
            setCreater(route.params.courseInfo.creator);
        }
    }, [route.params]);

    // 验证表单内容
    const validateForm = () => {
        let res = true;
        if (!nameValue) {
            setNameInputMessage('名称不能为空');
            res = false;
        } else {
            setNameInputMessage('');
        }
        if (privateCourse === true && privateCoursePsw === '') {
            setPswInputMessage('密码不能为空');
            res = false;
        } else {
            setPswInputMessage('');
        }
        return res
    }

    // 保存
    const save = () => {
        // 验证
        if (!validateForm()) {
            return;
        }
        // 请求
        RNFetchBlob.fetch('POST', `${BACK_END_URL}/${BACK_END_API}/course/update`, {
            Authorization: userToken,
            'Content-Type': 'multipart/form-data',
        }, [
            imgValue ?
                { name: 'courseImg', type: 'image/jpg', filename: 'userAvatar.jpg', data: RNFetchBlob.wrap(imgValue) } :
                { name: 'courseImg', data: '' },
            { name: 'id', data: courseID || '' },
            { name: 'name', data: nameValue || '' },
            { name: 'sort', data: courseSort || '9999' },
            { name: 'introduction', data: introductionValue || '' },
            { name: 'subtitle', data: subtitleValue || '' },
            { name: 'boardId', data: boardType.id || BOARD_TYPE_NAME.L },
            { name: 'creator', data: creater || userID || '' },
            { name: 'private', data: privateCourse === true ? '1' : '2' },
            { name: 'password', data: privateCourse === true ? privateCoursePsw : '' },
            { name: 'type', data: String(typeValue) || '1' },
        ]).then((resp) => {
            if (resp.respInfo.status !== 200) {
                console.error(resp.respInfo.status);
                return;
            }
            if (resp.data) {
                const res = JSON.parse(resp.data);
                // errorCode
                if (res.errCode) {
                    console.error('response error code: ', res.errCode);
                    toastMessage(`请求失败`);
                    return;
                }
                // response处理
                if (res.data) {
                    console.log('课程创建成功')
                    toastMessage(`操作成功`);
                    navigation.goBack();
                } else {
                    toastMessage(`操作失败`);
                }
            }
        }).catch((error) => {
            console.error(error);
        })
    }

    // 选择图库图像
    const selectImg = () => {
        ImagePicker.openPicker({
            width: 300 * imgScale,
            height: 300,
            cropping: true,
            cropperToolbarTitle: '选取封面区域',
            loadingLabelText: '正在处理',
            cropperChooseText: '选择',
            cropperCancelText: '取消',
            compressImageQuality: 0.8,
            compressImageMaxWidth: 500 * imgScale,
            compressImageMaxHeight: 500,
            mediaType: 'photo',
            hideBottomControls: false,
            includeBase64: true
        }).then(image => {
            setImgValue(image.path);
            setImgBase64(image.data);
        }).catch((error) => {
            console.warn('取消选择封面', error);
        });
    }

    // 返回react组件
    return (
        <View style={{ flex: 1 }}>
            <ScrollView style={{ flex: 1, backgroundColor: '#ffffff' }}>
                {/* 信息表单 */}
                <View style={{ flex: 1, paddingHorizontal: 20, paddingBottom: 20 }}>
                    <View style={styles.formNameBox}>
                        <View style={styles.formNameRow}>
                            <Text style={styles.formName}>课程名称</Text>
                            <TextInput
                                style={styles.nameInput}
                                placeholder='填写课程名称'
                                value={nameValue}
                                onChangeText={text => setNameValue(text)}
                            />
                        </View>
                        <Text style={styles.message}>{nameInputMessage}</Text>
                    </View>
                    <View style={{ marginTop: 20, flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#808080', paddingRight: 15 }}>课程类型</Text>
                        <CustomLabelsGroup
                            labelList={TYPE_OPTION}
                            singleOnly={true}
                            labelOnPress={(item) => { setTypeValue(item.id) }}
                        />
                    </View>
                    <View style={{ marginTop: 20, flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#808080', paddingRight: 15 }}>标题描述</Text>
                        <TextInput
                            style={styles.formRowsInput}
                            multiline
                            numberOfLines={4}
                            editable
                            maxLength={40}
                            placeholder='填写标题描述（选填）'
                            value={subtitleValue}
                            onChangeText={text => setSubtitleValue(text)}
                        />
                    </View>
                    <View style={{ marginTop: 20, flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#808080', paddingRight: 15 }}>课程介绍</Text>
                        <TextInput
                            style={styles.formRowsInput}
                            multiline
                            numberOfLines={4}
                            editable
                            maxLength={40}
                            placeholder='填写课程介绍（选填）'
                            value={introductionValue}
                            onChangeText={text => setIntroductionValue(text)}
                        />
                    </View>
                    <View style={{ marginTop: 20, flexDirection: 'row', alignContent: 'center' }}>
                        <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#808080', paddingRight: 15, height: 30 }}>课程封面</Text>
                        <Button
                            title="选择图片"
                            containerStyle={styles.levelButtonBox}
                            buttonStyle={styles.levelButton}
                            titleStyle={styles.levelButtonText}
                            onPress={() => { selectImg(true) }}
                        />
                    </View>
                    {/* 编辑显示图片 */}
                    {!!(courseImg && !imgBase64) &&
                        <Image
                            source={{
                                uri: `${COURSE_IMG_URL}${courseImg}`,
                                headers: { 'Authorization': userToken }
                            }}
                            style={{ width: screenWidth * 0.9, height: (screenWidth * 0.9) / imgScale, resizeMode: 'contain', marginTop: 15 }}
                        ></Image>
                    }
                    {!!imgBase64 &&
                        <Image
                            source={{ uri: `data:image/jpeg;base64,${imgBase64}` }}
                            style={{ width: screenWidth * 0.9, height: (screenWidth * 0.9) / imgScale, resizeMode: 'contain', marginTop: 15 }}
                        ></Image>
                    }
                    {/* 是否私有课程 */}
                    <View style={{ marginTop: 20, flexDirection: 'row', alignContent: 'center', }}>
                        <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#808080', paddingRight: 15, height: 30 }}>私有课程</Text>
                        <View style={[styles.sortItemBox, styles.fleterHasVideoBox]}>
                            <CheckBox
                                containerStyle={styles.selectBox}
                                checkedIcon={<Image style={styles.selectIcon} source={require('../../static/img/common-icons/check-box.png')} />}
                                uncheckedIcon={<Image style={styles.selectIcon} source={require('../../static/img/common-icons/check-box-outline.png')} />}
                                checked={privateCourse}
                                onPress={() => { setPrivateCourse(!privateCourse) }}
                            />
                            <Text style={styles.sortTitle}></Text>
                        </View>
                    </View>
                    {/* 私有课程密码 */}
                    {privateCourse === true &&
                        <View style={{ ...styles.formNameBox, marginTop: 5 }}>
                            <View style={styles.formNameRow}>
                                <Text style={styles.formName}>课程密码</Text>
                                <TextInput
                                    style={styles.nameInput}
                                    placeholder='填写课程密码'
                                    value={privateCoursePsw}
                                    onChangeText={text => setPrivateCoursePsw(text)}
                                />
                            </View>
                            <Text style={styles.message}>{pswInputMessage}</Text>
                        </View>
                    }
                </View>
            </ScrollView>
            {/* 底部操作栏 */}
            <View style={{ height: 50, backgroundColor: '#ffffff', borderTopWidth: 0.5, borderBottomWidth: 0.5, borderColor: '#808080', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}></View>
                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                    <Button
                        title="保存"
                        containerStyle={{ minHeight: 10, marginRight: 10 }}
                        buttonStyle={{ backgroundColor: '#3366ff', paddingHorizontal: 20, height: 35, borderRadius: 10 }}
                        titleStyle={{ fontSize: 14 }}
                        onPress={() => { save() }}
                    />
                </View>
            </View>
        </View >
    );
}

const mapStateToProps = state => {
    return {
        userToken: getUserToken(state),
        boardType: getBoardSettingType(state),
        userID: getUserInfo(state).userID,
    };
};

export default connect(
    mapStateToProps,
    {}
)(CourseEditScreen);