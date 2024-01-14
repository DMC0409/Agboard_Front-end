import { StyleSheet } from 'react-native';

// 视图样式定义
export const styles = StyleSheet.create({
    formRowsInput: {
        borderWidth: 0.5,
        borderRadius: 5,
        borderColor: '#808080',
        flex: 1,
        textAlignVertical: 'top',
        paddingHorizontal: 10,
        minHeight: 30
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

    formNameBox: {
        marginTop: 20,
    },

    sortItemBox: {
        backgroundColor: '#ffffff',
        marginTop: 0,
        paddingHorizontal: 0
    },

    selectBox: {
        marginLeft: -12,
        marginRight: -12,
        marginVertical: 0,
        paddingTop: 0,
        paddingBottom: 0,
        marginTop: -15
    },

    selectIcon: {
        height: 25,
        width: 25
    },

    fleterHasVideoBox: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },

    sortTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        padding: 10
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

    message: {
        color: 'red',
        fontSize: 12,
        marginLeft: 75
    },

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
});