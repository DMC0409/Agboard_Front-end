import { StyleSheet } from 'react-native';

// 视图样式定义
export const styles = StyleSheet.create({
    overlayBox: {
        height: 125,
        justifyContent: 'space-between',
        padding: 5
    },

    overlayTitle: {
        fontSize: 14
    },

    overlayDescription: {
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 5,
        marginTop: 5
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
        marginRight: 10,
        fontSize: 14
    },

    saveButtonBox: {
        fontSize: 14
    },

    saveButton: {
        marginRight: 5,
        fontSize: 14
    }
});