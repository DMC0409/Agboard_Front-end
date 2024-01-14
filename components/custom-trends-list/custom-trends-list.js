import React from "react";
import { View, Text, Image } from 'react-native';
import { styles as styles1 } from "./custom-trends-list.style";
import { styles as styles2 } from "./custom-trends-list.style2";
import { AVATAR_IMG_URL } from "../../config/http";
import { DEFAULT_AVATER } from "../../config/mine";
import { Divider, Avatar, Button } from 'react-native-paper';
import { TouchableOpacity } from 'react-native-gesture-handler'
import { TREADS_TYPE } from "../../config/treads";

// 自定义选项列表组件

// prop: {
//      item: 数据
//      userToken: 用户登录token
//      myUserID: 我的用户ID
//      gotoPresentationPage: 函数，点击用户栏触发，参数：userID
//      followAction: 函数，点击关注或取关，参数：是否关注,被关注的userID
//      gotoLinePage: 函数，前去线路页面，参数：lineID
//      isPresentation: boolean, 标识是否是个人展示页里展示的
// }

export const CustomTerendsList = ({ item, userToken, myUserID, gotoPresentationPage, followAction, gotoLinePage, isPresentation = false }) => {
    const styles = isPresentation === true ? styles2 : styles1;

    // 处理星数
    const dealwithStar = (data) => {
        if (!data) {
            return [];
        }
        let temp = Math.round(data)
        const res = [];
        while (temp > 0) {
            res.push(1);
            temp--;
        }
        return res;
    }

    // 头像
    const CustomAvatar = <>
        {
            item.avatar ?
                <Avatar.Image size={36} source={{
                    uri: `${AVATAR_IMG_URL}${item.avatar}`,
                    headers: { 'Authorization': userToken }
                }} />
                :
                <Avatar.Image size={36} source={DEFAULT_AVATER} />
        }
    </>
    return (
        <View style={styles.listItem}>
            <View style={styles.itemHeader}>
                <View style={styles.itemHeaderLeft}>
                    {isPresentation === false ?
                        <TouchableOpacity extraButtonProps={{ rippleColor: '#fff' }} onPress={() => gotoPresentationPage(item.createUserID)}>
                            {CustomAvatar}
                        </TouchableOpacity>
                        :
                        CustomAvatar
                    }
                    {isPresentation === false ?
                        <View style={styles.nameInfoBox}>
                            <View style={styles.nameBox}>
                                <TouchableOpacity extraButtonProps={{ rippleColor: '#fff' }} onPress={() => gotoPresentationPage(item.createUserID)}>
                                    <Text numberOfLines={1} style={styles.nameText}>{item.userName}</Text>
                                </TouchableOpacity>
                                {item.cert === 1 &&
                                    <Image source={require('../../static/img/common-icons/V-idenity.png')} style={styles.nameIcon}></Image>
                                }
                            </View>
                            {item.fansNum !== 0 &&
                                <Text style={styles.followText}>{item.fansNum} 人关注了 ta</Text>
                            }
                        </View>
                        :
                        <View style={styles.nameInfoBox}>
                            <View style={styles.nameBox1}>
                                <Text numberOfLines={1} style={styles.nameText1}>{item.userName}</Text>
                            </View>
                            <Text style={styles.followText}>{item.lineContent.createTime}</Text>
                        </View>
                    }
                </View>
                <View style={styles.itemHeaderRight}>
                    {isPresentation === false && myUserID != item.createUserID &&
                        <>
                            {item.isFollowed === 0 ?
                                <Button mode="contained" buttonColor="#22934f" textColor="#fff"
                                    contentStyle={styles.followBtn}
                                    labelStyle={styles.followBtnLabel}
                                    onPress={() => followAction(true, item.createUserID, item.dynamicInfoID)}>
                                    关注
                                </Button>
                                :
                                <Button mode="outlined" textColor="#22934f"
                                    contentStyle={styles.followBtn}
                                    labelStyle={styles.followBtnLabel}
                                    style={{ borderColor: "#22934f" }}
                                    onPress={() => followAction(false, item.createUserID, item.dynamicInfoID)}>
                                    取关
                                </Button>
                            }
                        </>
                    }
                </View>
            </View>
            <View style={styles.describeBox}>
                {item.lineContent.type === TREADS_TYPE.COMPLETE &&
                    <>
                        <View style={styles.describeTextBox}>
                            <Text style={styles.describeText}>
                                我刚完成了线路
                            </Text>
                            <TouchableOpacity style={{ flexDirection: 'row' }} extraButtonProps={{ rippleColor: '#fff' }} onPress={() => gotoLinePage(item.lineContent)} >
                                <Text style={styles.linkText}> "</Text>
                                <Text numberOfLines={1} style={styles.linkText}>{item.lineContent.lineName}</Text>
                                <Text style={styles.linkText}>" </Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.describeText}>
                            挑战了{item.lineContent.successNum === 1 &&
                                <Image source={require('../../static/img/common-icons/lightning.png')} style={styles.flashIcon}></Image>
                            } {item.lineContent.successNum} 次成功
                        </Text>
                        <Text style={styles.describeText}>
                            认为难度在 "{item.lineContent.level}" 等级
                        </Text>
                        <Text style={styles.describeText}>
                            给出 {dealwithStar(item.lineContent.score).map(value =>
                                <Image source={require('../../static/img/common-icons/star.png')} style={styles.starIcon}></Image>
                            )
                            } 星的评价
                        </Text>
                        {!!item.lineContent.note &&
                            <Text style={styles.describeText}>笔记："{item.lineContent.note}"</Text>
                        }
                    </>
                }
                {item.lineContent.type === TREADS_TYPE.RELEASE &&
                    <>
                        <View style={styles.describeTextBox}>
                            <Text style={styles.describeText}>
                                我新发布了一条线路
                            </Text>
                            <TouchableOpacity style={{ flexDirection: 'row' }} extraButtonProps={{ rippleColor: '#fff' }} onPress={() => gotoLinePage(item.lineContent)} >
                                <Text style={styles.linkText}> "</Text>
                                <Text numberOfLines={1} style={{ ...styles.linkText, maxWidth: 180 }}>{item.lineContent.lineName}</Text>
                                <Text style={styles.linkText}>" </Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.describeTextBox}>
                            <Text style={styles.describeText}>
                                快来攀爬试试吧。
                            </Text>
                        </View>
                    </>
                }
                {item.lineContent.type === TREADS_TYPE.COLLECT &&
                    <>
                        <View style={styles.describeTextBox}>
                            <Text style={styles.describeText}>
                                我收藏了线路
                            </Text>
                            <TouchableOpacity style={{ flexDirection: 'row' }} extraButtonProps={{ rippleColor: '#fff' }} onPress={() => gotoLinePage(item.lineContent)} >
                                <Text style={styles.linkText}> "</Text>
                                <Text numberOfLines={1} style={{ ...styles.linkText, maxWidth: 220 }}>{item.lineContent.lineName}</Text>
                                <Text style={styles.linkText}>" </Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.describeTextBox}>
                            <Text style={styles.describeText}>
                                快来一起看看吧。
                            </Text>
                        </View>
                    </>
                }
            </View>
            <View style={styles.timeTextBox}>
                {isPresentation === false &&
                    <Text style={styles.timeText}>{item.lineContent.createTime}</Text>
                }
            </View>
            <Divider />
        </View>
    );
};