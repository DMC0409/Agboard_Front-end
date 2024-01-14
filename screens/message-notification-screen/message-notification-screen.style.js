import { StyleSheet } from 'react-native';

// 视图样式定义
export const styles = StyleSheet.create({
    box: {
        flex: 1,
    },

    site: {
        height: 10,
    },

    overlayBox: {
        justifyContent: 'space-between',
        padding: 5
    },

    listGroup: {
        marginTop: 1,
    },

    buttonBox: {
        justifyContent: 'center',
        alignItems: 'center',
        height: 100
    },

    button: {
        backgroundColor: '#d81e06',
        width: '90%',
        height: 42
    },

    searchBoxCleanIcon: {
        height: 20,
        width: 20
    },

    searchBoxIcon: {
        height: 20,
        width: 20
    },

    searchBox: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },

    searchBoxInput: {
        fontSize: 14
    },

    searchBoxInputInputContainer: {
        height: 35,
        backgroundColor: '#e6e6e6',
        marginRight: -8,
        marginLeft: 5,
        borderRadius: 35
    },

    searchInputLeftIcon: {
        paddingLeft: 5
    },

    searchBarContainer: {
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 0,
        borderTopColor: '#fff'
    },

    searchBtnView: {
        backgroundColor: '#fff',
        width: 45,
        justifyContent: 'center',
        alignContent: 'center',
        paddingLeft: 5
    },

    searchBtnText: {
        fontSize: 12,
        color: '#6c6c6c'
    },

    sortItemBox: {
        backgroundColor: '#ffffff',
        marginTop: 0,
        paddingHorizontal: 5
    },

    selectBox: {
        marginLeft: -12,
        marginRight: -12,
        marginVertical: 0
    },

    selectIcon: {
        height: 25,
        width: 25
    },

    fleterHasVideoBox: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start'
    },

    sortTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        padding: 10
    },

    optionIcon: {
        height: 80,
        width: 80,
        marginRight: 8
    },
});