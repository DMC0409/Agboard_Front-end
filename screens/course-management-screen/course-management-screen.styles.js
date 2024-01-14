import { StyleSheet } from 'react-native';

// 视图样式定义
export const styles = StyleSheet.create({
    levelButton: {
        backgroundColor: '#3366ff',
        paddingHorizontal: 10,
        height: 30,
        borderRadius: 5,
    },

    levelButtonBox: {
        marginLeft: 0
    },

    levelButtonText: {
        fontSize: 13,
        minHeight: 15
    },

    overlayBox: {
        height: 100,
        justifyContent: 'space-between',
        padding: 5
    },

    overlayTitle: {
        fontSize: 16,
        padding: 10
    },

    buttonGroup: {
        alignSelf: 'flex-end',
        flexDirection: 'row'
    },

    cancelButtonBox: {
        color: '#808080',
        fontSize: 14
    },

    cancelButton: {
        marginRight: 10
    },

    saveButtonBox: {
        fontSize: 14
    },

    saveButton: {
        marginRight: 5,
        fontSize: 14
    },
});