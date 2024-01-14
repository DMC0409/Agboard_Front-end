import React, { useEffect, useState } from 'react';
import { Text, View, Platform, useWindowDimensions } from 'react-native';
import { http, GET } from "../../common/http";
import { CURRENT_VERSION } from "../../config/version";
import { Button, Overlay } from 'react-native-elements';
import { styles } from "./overlay-version-check.styles";
import RNFetchBlob from 'rn-fetch-blob'
import { toastMessage } from "../../common/global";
import { BACK_END_URL, BACK_END_API } from "../../config/http";

const OverlayVersionCheck = () => {
    // 屏幕宽度
    const screenWidth = useWindowDimensions().width;
    // 覆盖框显示
    const [showOverlay, setShowOverlay] = useState(false);
    // 新版本说明
    const [updateDescription, setUpdateDescription] = useState(<View></View>);

    // 组件初始化时，检查app是否有更新
    useEffect(() => {
        // 网络请求-查询app最新版本（仅用于android端）
        if (Platform.OS !== 'android') {
            return;
        }
        http(`version`, GET)
            .then((res) => {
                if (res !== CURRENT_VERSION) {
                    // 当前版本非最新版本，弹框通知用户升级
                    setTimeout(() => {
                        setShowOverlay(true);
                    }, 3000);
                    const versionDisplay = `V${res[0]}.${parseInt(res[1] + res[2])}.${parseInt(res[3] + res[4])}`;
                    setUpdateDescription(
                        <View style={{ ...styles.overlayBox, width: screenWidth * 0.7 }}>
                            <View>
                                <Text style={styles.overlayTitle}>发现新版本：</Text>
                                <Text style={styles.overlayDescription}>{versionDisplay}</Text>
                            </View>
                            <View style={styles.buttonGroup}>
                                <Button
                                    title="取消"
                                    type="clear"
                                    titleStyle={styles.cancelButtonBox}
                                    buttonStyle={styles.cancelButton}
                                    onPress={() => setShowOverlay(false)}
                                />
                                <Button
                                    title="下载"
                                    type="clear"
                                    titleStyle={styles.saveButtonBox}
                                    buttonStyle={styles.saveButton}
                                    onPress={() => handlerDownloadButton()}
                                />
                            </View>
                        </View>
                    );
                }
            })
            .catch((error) => {
                console.error(error);
                toastMessage(`请求失败`);
            })
    }, []);

    // 点击下载按钮
    const handlerDownloadButton = () => {
        setShowOverlay(false);
        downloadAPK();
    }

    // 下载新版本apk（仅Android平台适用）
    const downloadAPK = async () => {
        try {
            const resp = await RNFetchBlob
                .config({
                    addAndroidDownloads: {
                        useDownloadManager: true,
                        notification: true,
                        mime: 'application/vnd.android.package-archive',
                        description: 'download app for new verson.'
                    }
                })
                .fetch('GET', `${BACK_END_URL}/${BACK_END_API}/download`);
            console.log(resp.path());
            console.log(resp);
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <Overlay isVisible={showOverlay} onBackdropPress={() => setShowOverlay(false)}>
            {updateDescription}
        </Overlay>
    );
};

export default OverlayVersionCheck;