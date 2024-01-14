import { StyleSheet } from 'react-native';

// 视图样式定义
export const styles = StyleSheet.create({
    listItem: {
        paddingHorizontal: 18,
        paddingBottom: 24,
        paddingTop: 0,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },

    leftBox: {
        flex: 1,
        flexDirection: 'row',
    },

    leftInnerBox: {
        flexDirection: 'row',
        alignItems: 'center'
    },

    rightBox: {

    },

    nameText: {
        marginLeft: 12
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

    nameIcon: {
        height: 17,
        width: 17,
        marginLeft: 5
    },
});
