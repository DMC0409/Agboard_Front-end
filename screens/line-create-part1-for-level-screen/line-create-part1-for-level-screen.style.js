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

    layoutBox: {
        flex: 1,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center'
    },

    layoutSubBox: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },

    pointCoverBox: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center'
    },

    tempRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    tempItemTextBox: {
        justifyContent: 'center',
        alignItems: 'center',
    },

    tempItemText: {
        
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
        minHeight: 10
    },

    nextButton: {
        backgroundColor: '#3366ff',
        paddingHorizontal: 20,
        height: 35,
        borderRadius: 10,

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
        marginLeft: 25,
        justifyContent: 'center',
        alignItems: 'center'
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