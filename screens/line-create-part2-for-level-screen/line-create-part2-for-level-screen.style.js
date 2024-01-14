import { StyleSheet } from 'react-native';

// 视图样式定义
export const styles = StyleSheet.create({
    box: {
        flex: 1,
        justifyContent: 'space-between'
    },

    titleBox: {
        height: 48,
        backgroundColor: '#ffffff',
        borderBottomWidth: 0.5,
        borderColor: '#808080',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },

    titleSubBox: {
        flexDirection: 'row',
        alignItems: 'center'
    },

    backButtonBox: {
        paddingHorizontal: 15
    },

    backButtonIcon: {
        height: 25,
        width: 25
    },

    titleTextBox: {
        flexDirection: 'row',
        alignItems: 'center'
    },

    titleText: {
        marginRight: 8,
        fontSize: 16
    },

    actionBox: {
        height: 50,
        backgroundColor: '#ffffff',
        borderTopWidth: 0.5,
        borderBottomWidth: 0.5,
        borderColor: '#808080',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },

    actiongBoxLeft: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center'
    },

    actiongBoxRight: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingRight: 10
    },

    nextButtonContainer: {
        minHeight: 10,
        marginLeft: 10
    },

    nextButton: {
        backgroundColor: '#3366ff',
        paddingHorizontal: 20,
        height: 35,
        borderRadius: 10,
    },

    levelButton: {
        backgroundColor: '#3366ff',
        paddingHorizontal: 10,
        height: 26,
        borderRadius: 5,
    },

    levelButtonBox: {
        marginLeft: 10
    },

    levelButtonText: {
        fontSize: 13,
        minHeight: 15
    },

    nextButtonText: {
        fontSize: 14,
        fontWeight: 'normal'
    },

    blIcon: {
        height: 18,
        width: 20
    },

    actionText: {
        fontSize: 12,
        marginTop: 2,
        color: '#808080'
    },

    actionButton: {
        marginLeft: 25
    },

    formBox: {
        flex: 1,
        backgroundColor: '#ffffff',
        paddingHorizontal: 20
    },

    formNameBox: {
        marginTop: 20,
    },

    formNameRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },

    formName: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#808080',
        paddingRight: 15,
    },

    formAngelName: {
        marginTop: 15
    },

    nameInput: {
        borderWidth: 0.5,
        borderRadius: 5,
        borderColor: '#808080',
        flex: 1,
        height: 38,
        paddingHorizontal: 10
    },

    formAngelBox: {
        marginTop: 10,
        flexDirection: 'row',
    },

    formLabelBox: {
        marginTop: 20,
        flexDirection: 'row',
        flex: 1,
    },

    formLevelBox: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 15
    },

    formDetailBox: {
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20
    },

    formRowsInput: {
        borderWidth: 0.5,
        borderRadius: 5,
        borderColor: '#808080',
        flex: 1,
        textAlignVertical: 'top',
        paddingHorizontal: 10,
        minHeight: 30
    },

    overOverlay: {

    },

    message: {
        color: 'red',
        fontSize: 12,
        marginLeft: 50
    },

    labelMessage: {
        color: 'red',
        fontSize: 12,
        marginLeft: 50,
        marginTop: -15
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