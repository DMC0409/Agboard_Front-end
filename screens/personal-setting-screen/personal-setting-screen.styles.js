import { StyleSheet } from 'react-native';

// 视图样式定义
export const styles = StyleSheet.create({
    box: {
        flex: 1
    },

    listBox: {
        marginTop: 15,
        backgroundColor: '#FFFFFF'
    },

    overlayBox: {
        height: 130,
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
        marginRight: 10
    },

    saveButtonBox: {
        fontSize: 14
    },

    saveButton: {
        marginRight: 5,
        fontSize: 14
    },

    nameInput: {
        borderWidth: 0.5,
        borderRadius: 5,
        borderColor: '#808080',
        height: 35,
        paddingHorizontal: 10,
        paddingVertical: 5,
        fontSize: 14,
        marginTop: 15
    },
});