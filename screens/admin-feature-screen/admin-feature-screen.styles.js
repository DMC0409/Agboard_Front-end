import { StyleSheet } from 'react-native';

// 视图样式定义
export const styles = StyleSheet.create({
    box: {
        flex: 1
    },

    listPart: {
        marginTop: 15,
        backgroundColor: '#FFFFFF'
    },

    listGroup: {
        marginTop: 15,
        backgroundColor: '#FFFFFF'
    },

    buttonBox: {
        justifyContent: 'center',
        alignItems: 'center',
        height: 100
    },

    buttonBox1: {
        justifyContent: 'center',
        alignItems: 'center',
        height: 50,
        marginBottom: -10
    },

    button: {
        backgroundColor: '#d81e06',
        width: '90%',
        height: 42
    },

    overlayBox: {
        height: 170,
        justifyContent: 'space-between',
        padding: 5,
    },

    overlayBox1: {
        height: 100,
        justifyContent: 'space-between',
        padding: 5,
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

    sortItemBox: {
        backgroundColor: '#ffffff',
        marginTop: 0,
        paddingHorizontal: 5,
    },

    fleterHasVideoBox: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start'
    },

    selectBox: {
        marginLeft: -12,
        marginRight: -12,
        marginVertical: 0,
    },

    selectIcon: {
        height: 25,
        width: 25,
    },

    sortTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        padding: 10
    },

    message: {
        color: 'red',
        fontSize: 12,
        marginLeft: 5,
        marginTop: 3
    },
});