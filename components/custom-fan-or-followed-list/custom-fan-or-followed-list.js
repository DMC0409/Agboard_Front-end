import React from "react";
import { View, Text, Image, useWindowDimensions } from 'react-native';
import { styles } from "./custom-fan-or-followed-list.style";
import { AVATAR_IMG_URL } from "../../config/http";
import { DEFAULT_AVATER } from "../../config/mine";
import { Divider, Avatar, Button } from 'react-native-paper';
import { TouchableOpacity } from 'react-native-gesture-handler'

// 自定义选项列表组件

// prop: {
//      item: 数据
//      userToken: 用户登录token
//      myUserID: 我的用户ID
//      gotoPresentationPage: 函数，点击用户栏触发，参数：userID
// }

export const CustomFanOrFollowedList = ({ item, userToken, myUserID, gotoPresentationPage, followAction }) => {
    // 屏幕尺寸
    let screenWidth = useWindowDimensions().width;
    let screenHeight = useWindowDimensions().height;

    console.log('item', item);
    console.log('myUserID', myUserID);


    return (
        <View style={styles.listItem}>
            <View style={styles.leftBox}>
                <TouchableOpacity extraButtonProps={{ rippleColor: '#fff' }} style={styles.leftInnerBox} onPress={() => gotoPresentationPage(item.userID)}>
                    {
                        item.avatar ?
                            <Avatar.Image size={36} source={{
                                uri: `${AVATAR_IMG_URL}${item.avatar}`,
                                headers: { 'Authorization': userToken }
                            }} />
                            :
                            <Avatar.Image size={36} source={DEFAULT_AVATER} />
                    }
                    <Text numberOfLines={1} style={{ ...styles.nameText, maxWidth: screenWidth - 200 }}>{item.userName}</Text>
                    {item.cert === 1 &&
                        <Image source={require('../../static/img/common-icons/V-idenity.png')} style={styles.nameIcon}></Image>
                    }
                </TouchableOpacity>
            </View>
            <View style={styles.rightBox}>
                {myUserID != item.userID &&
                    <>
                        {item.isFollowed === 0 ?
                            <Button mode="contained" buttonColor="#22934f" textColor="#fff"
                                contentStyle={styles.followBtn}
                                labelStyle={styles.followBtnLabel}
                                onPress={() => followAction(true, item.userID)}>
                                关注
                            </Button>
                            :
                            <Button mode="outlined" textColor="#22934f"
                                contentStyle={styles.followBtn}
                                labelStyle={styles.followBtnLabel}
                                style={{ borderColor: "#22934f" }}
                                onPress={() => followAction(false, item.userID)}>
                                取关
                            </Button>
                        }
                    </>
                }
            </View>
        </View>
    );
};