import { StyleSheet } from 'react-native';

// 视图样式定义
export const styles = StyleSheet.create({
    box: {
        flex: 1,
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },

    descript: {
        paddingRight: 30,
    },

    descriptText: {
        color: '#000',
        fontSize: 15,
        lineHeight: 24,
    },

    bold: {
        fontWeight: 'bold'
    },

    desImgBox: {
        paddingRight: 10
    },

    climbingImg: {
        height: 20,
        width: 20,
        marginTop: 3,
    },

    desBox: {
        flexDirection: 'row',
        paddingTop: 15,
        justifyContent: 'space-between',
        width: '100%',
    }
});