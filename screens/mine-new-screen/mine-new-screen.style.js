import { StyleSheet } from 'react-native';

// 视图样式定义
export const styles = StyleSheet.create({
    box: {
        flex: 1,
        backgroundColor: '#fff',
    },

    topBackgroud: {
        height: 105,
        opacity: 0.7,
        justifyContent: 'flex-start'
    },

    hearderBox: {
        flexDirection: 'row',
        position: 'relative',
        top: -35,
        height: 100,
        alignItems: 'flex-end',
        paddingLeft: 15,
    },

    Avatar: {
        borderWidth: 7,
        borderColor: '#fff',
        borderRadius: 74,
    },

    lineBar: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        height: 60,
        alignSelf: 'flex-end',
    },

    lineBar1: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignSelf: 'flex-end',
        alignItems: 'center',
        paddingHorizontal: 5
    },

    lineEnterItem: {
        alignItems: 'center',
        height: 75,
        justifyContent: 'center',
    },

    lineEnterItem1: {
        alignItems: 'center',
        height: 60,
        width: 80,
        justifyContent: 'center',
    },

    lineEnterCount: {
        fontSize: 16,
        fontWeight: 'bold'
    },

    lineEnterText: {
        fontSize: 12
    },

    splitLines: {
        width: 0.5,
        backgroundColor: '#808080',
        marginVertical: 10
    },

    nameBox: {
        flexDirection: 'row',
        paddingHorizontal: 25,
        alignItems: 'center',
        marginTop: -20,
        justifyContent: 'space-between',
        backgroundColor: '#fff',
    },

    nameBoxLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    nameBoxRight: {
        height: 30
    },

    nameIcon: {
        height: 20,
        width: 20,
        marginLeft: 8
    },

    nameText: {
        fontSize: 18,
        fontWeight: 'bold',
    },

    briefBox: {
        flexDirection: 'row',
        paddingHorizontal: 25,
        alignItems: 'center',
        marginTop: 8
    },

    outerLinkBox: {
        flexDirection: 'row',
        paddingHorizontal: 25,
        alignItems: 'center',
        paddingTop: 0,
        paddingBottom: 5,
        backgroundColor: '#fff',
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
    },

    brieText: {
        color: '#9d9d9d',
        fontSize: 14,
    },

    outerLinkText: {
        color: '#22934f',
        opacity: 0.7,
    },

    outerLinkedText: {
        color: '#22934f',
        textDecorationLine: 'underline',
        opacity: 0.7,
    },

    followBtn: {
        height: 28,
        width: 45,
    },

    followBtnLabel: {
        fontSize: 12,
        marginTop: 0,
        marginBottom: 0,
        marginLeft: 17,
        marginRight: 0,
    },

    recordBox: {
        marginTop: 15,
    },

    listItem: {
        padding: 18,
        paddingBottom: 0,
        paddingHorizontal: 20
    },

    itemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10
    },

    itemHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    nameInfoBox: {
        marginLeft: 10,
    },

    nameBox1: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    nameText1: {
        fontSize: 14,
    },

    followText: {
        fontSize: 12,
        color: '#b2b2b2',
    },

    nameIcon1: {
        height: 17,
        width: 17,
        marginLeft: 5
    },

    linkText: {
        color: '#22934f',
        fontSize: 15,
        lineHeight: 24,
    },

    noteText: {
        fontSize: 15
    },

    timeTextBox: {
        flexDirection: 'row',
        marginBottom: 18
    },

    timeText: {
        color: '#b2b2b2',
        marginTop: 10,
        fontSize: 12
    },

    describeBox: {

    },

    describeTextBox: {
        flexDirection: 'row'
    },

    describeText: {
        fontSize: 15,
        lineHeight: 24,
        textAlignVertical: 'center'
    },

    starIcon: {
        height: 15,
        width: 15
    },

    flashIcon: {
        height: 18,
        width: 18,
    },

    cardBox: {
        flexDirection: 'row',
        paddingHorizontal: 5,
        alignItems: 'center',
        paddingTop: 8,
        marginHorizontal: 0,
        backgroundColor: '#fff',
    },

    Card: {
        flex: 1,
        backgroundColor: '#fff'
    },

    cardOuterOuterBox: {
        backgroundColor: '#f2f2f2',
    },

    cardOuterBox: {
        marginVertical: 10,
        borderRadius: 10,
    },

    lineEnterText1: {
        fontSize: 13,
        marginVertical: 5,
        color: '#808080'
    },
});
