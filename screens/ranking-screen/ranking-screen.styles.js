import { StyleSheet } from 'react-native';

// 视图样式定义
export const styles = StyleSheet.create({
    topTab: {
        alignItems: 'center',
        justifyContent: 'center',
        height: 150,
        backgroundColor: '#fff',
    },

    listBox: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 10,
        alignContent: 'center'
    },

    listItem: {
        flexDirection: 'row',
        alignItems: 'center'
    },

    listImg: {
        height: 30,
        width: 30,
        marginRight: 8
    },

    listLable: {
        fontSize: 13
    },

    separator: {
        height: 1,
        backgroundColor: '#DADCDB',
        marginLeft: 15
    },

    tabSelectedText: {
        color: '#3366ff',
        fontWeight: 'bold'
    },

    countBox: {
        justifyContent: 'center'
    },

    headerIcon: {
        height: 55,
        width: 55,
        borderRadius: 10
    },

    hearderIconFirst: {
        height: 65,
        width: 65,
        borderRadius: 10
    }
});