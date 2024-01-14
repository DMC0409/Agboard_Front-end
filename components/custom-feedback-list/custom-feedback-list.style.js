import { StyleSheet } from 'react-native';

// 视图样式定义
export const styles = StyleSheet.create({
    optionBox: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        color: '#000'
    },

    option: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1
    },

    optionIcon: {
        height: 16,
        width: 16,
        marginRight: 8
    },

    optionLable: {
        fontSize: 16,
        color: '#000'
    },

    arrowRight: {
        height: 18,
        width: 18
    },

    separator: {
        height: 0.5,
        backgroundColor: '#DADCDB',
        marginVertical: 8,

    },

    point: {
        height: 10,
        width: 10,
        backgroundColor: '#e04a3c',
        marginRight: 5,
        borderRadius: 10
    }
});
