import { StyleSheet } from 'react-native';

// 视图样式定义
export const styles = StyleSheet.create({
    overlayBox: {
        height: 125,
        justifyContent: 'space-between',
        padding: 5
    },
    
    input: {
        borderStyle: 'solid',
        backgroundColor: '#F3F3F3',
        fontSize: 14,
        height: 35,
        borderRadius: 5,
        marginHorizontal: 0,
        paddingVertical: 5,
        paddingHorizontal: 10
    },

    overlayTitle: {
        fontSize: 16,
        marginBottom: 10,
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
        fontSize: 14,
        paddingVertical: 5
    },

    input: {
        borderStyle: 'solid',
        backgroundColor: '#F3F3F3',
        fontSize: 14,
        height: 35,
        borderRadius: 5,
        marginHorizontal: 0,
        paddingVertical: 5,
        paddingHorizontal: 10
    },

    message: {
        color: 'red',
        fontSize: 12,
        marginLeft: 5,
        marginTop: 3
    },

});