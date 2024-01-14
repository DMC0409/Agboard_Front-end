import React, { useEffect, useState } from 'react';
import { useWindowDimensions, View, Text } from 'react-native';
import { Overlay } from 'react-native-elements';
import { connect } from "react-redux";
import { Button } from 'react-native-elements';
import { Clipboard } from 'react-native'
import { toastMessage } from "../../common/global";
import { http, GET, POST } from "../../common/http";

// prop:
// isVisible：控制弹出框显示
// close： 调用后会关闭弹出框

const OverlayVideo = ({ isVisible, close, lineInfo, onVideoUpSuccess }) => {
    // 屏幕尺寸
    let screenWidth = useWindowDimensions().width;
    let screenHeight = useWindowDimensions().height;

    // 确认上传弹出框
    const [upConfirm, setUpConfirm] = useState(false);

    // 更新视频状态
    const updateVideo = () => {
        setUpConfirm(false);
        http(`line/video/update`, POST, {
            body: [{
                id: lineInfo.lineId || '',
                video: '1',
            }]
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
                    // 上传更新成功
                    onVideoUpSuccess()
                    toastMessage(`上传成功`);
                } else {
                    // 上传更新失败
                    toastMessage(`上传失败`);
                }
            })
            .catch((error) => {
                console.error(error);
                toastMessage(`请求失败`);
            })
    }

    // 复制关键词
    const copyKeyword = () => {
        Clipboard.setString(`#alphaWall #${lineInfo.name}${lineInfo.lineId}`);
        toastMessage('复制成功')
    }

    return (
        <Overlay
            isVisible={isVisible}
            overlayStyle={[{ width: 0.8 * screenWidth, height: 350 }]}
            onBackdropPress={close}
        >
            <>
                {lineInfo.video !== '' ?
                    <View style={{ flex: 1, padding: 10, alignContent: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontSize: 17, fontWeight: 'bold', textAlign: 'center', color: '#028b00', paddingVertical: 5 }}>此线路有攻略视频</Text>
                        <Text style={{ color: '#939393', fontSize: 14, paddingVertical: 1 }}>您可以按照如下步骤查看视频：</Text>
                        <Text style={{ color: '#939393', fontSize: 14, paddingVertical: 1 }}>1.打开微信，点击右上角搜索图标，进入搜索页面”</Text>
                        <Text style={{ color: '#939393', fontSize: 14, paddingVertical: 1 }}>2.搜索此线路关键词 “<Text style={{ color: '#000' }}>#alphaWall #{lineInfo.name}</Text>”</Text>
                        <Text style={{ color: '#939393', fontSize: 14, paddingVertical: 1 }}>3.点击搜索结果最底部的 “搜一搜”</Text>
                        <Text style={{ color: '#939393', fontSize: 14, paddingVertical: 1 }}>4.点击分类 “视频号”，即可看到相关攻略视频</Text>
                    </View>
                    :
                    <View style={{ flex: 1, padding: 10, alignContent: 'center', justifyContent: 'center' }}>
                        <Text style={{ fontSize: 17, fontWeight: 'bold', textAlign: 'center', color: '#eb9800' }}>此线路暂无攻略视频</Text>
                    </View>
                }
                <View style={{ justifyContent: 'space-between', alignItems: 'center', paddingTop: 10 }}>
                    {lineInfo.video !== '' &&
                        <Button
                            containerStyle={{ width: '100%' }}
                            buttonStyle={{ backgroundColor: '#3366ff' }}
                            title="复制线路关键词"
                            onPress={() => { copyKeyword() }}
                        />
                    }
                    <Button
                        containerStyle={{ width: '100%', marginTop: 10 }}
                        buttonStyle={{ backgroundColor: '#3366ff' }}
                        title="上传我的攻略视频"
                        onPress={() => { setUpConfirm(true) }}
                    />
                </View>
                <Overlay
                    isVisible={upConfirm}
                    overlayStyle={[{ width: 0.8 * screenWidth, height: 400 }]}
                    onBackdropPress={() => { setUpConfirm(false) }}
                >
                    <>
                        <View style={{ flex: 1, padding: 10, justifyContent: 'center' }}>
                            <View style={{ flex: 1, padding: 0, alignContent: 'center', justifyContent: 'center' }}>
                                <Text style={{ fontSize: 17, fontWeight: 'bold', textAlign: 'center', color: '#000', paddingVertical: 5 }}>视频上传步骤</Text>
                                <Text style={{ color: '#939393', fontSize: 14, paddingVertical: 2 }}>步骤如下：</Text>
                                <Text style={{ color: '#939393', fontSize: 14, paddingVertical: 2 }}>1.打开微信，点击 “发现”-&gt;“视频号”-&gt;右上角“我的”图标</Text>
                                <Text style={{ color: '#939393', fontSize: 14, paddingVertical: 2 }}>2.点击 “发表新动态”</Text>
                                <Text style={{ color: '#939393', fontSize: 14, paddingVertical: 2 }}>3.录制或选择视频素材</Text>
                                <Text style={{ color: '#939393', fontSize: 14, paddingVertical: 2 }}>4.在填写视频信息时，将关键词 “<Text style={{ color: '#000' }}>#alphaWall #{lineInfo.name}{lineInfo.lineId}</Text>” 粘贴进描述中</Text>
                                <Text style={{ color: '#939393', fontSize: 14, paddingVertical: 2 }}>5.在成功发表视频后，点击下面的 “确认已上传” 按钮，即完成上传流程</Text>
                            </View>
                        </View>
                        <View style={{ justifyContent: 'space-between', alignItems: 'center', paddingTop: 10 }}>
                            <Button
                                containerStyle={{ width: '100%' }}
                                buttonStyle={{ backgroundColor: '#3366ff' }}
                                title="复制线路关键词"
                                onPress={() => { copyKeyword() }}
                            />
                            <Button
                                containerStyle={{ width: '100%', marginTop: 10 }}
                                buttonStyle={{ backgroundColor: '#3366ff' }}
                                title="确认已上传"
                                onPress={() => { updateVideo() }}
                            />
                        </View>
                    </>
                </Overlay>
            </>
        </Overlay>
    );
};

const mapStateToProps = state => {
    return {

    };
};

export default connect(
    mapStateToProps,
    {}
)(OverlayVideo);