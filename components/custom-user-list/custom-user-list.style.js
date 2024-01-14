import { StyleSheet } from 'react-native';

// 视图样式定义
export const styles = StyleSheet.create({
    optionBox: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 14
    },

    option: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1
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
