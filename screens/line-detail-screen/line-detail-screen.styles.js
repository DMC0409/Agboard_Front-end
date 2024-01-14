import { StyleSheet } from 'react-native';

// 视图样式定义
export const styles = StyleSheet.create({
    optionBox: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        paddingHorizontal: 20,
        paddingVertical: 8,
        paddingLeft: 8,
    },

    option: {
        flexDirection: 'row',
    },

    optionIcon: {
        height: 25,
        width: 25,
        marginRight: 8
    },

    optionLable: {
        fontSize: 14
    },

    arrowRight: {
        height: 18,
        width: 18
    },

    separator: {
        height: 0.5,
        backgroundColor: '#DADCDB',
        marginLeft: 15
    }
});