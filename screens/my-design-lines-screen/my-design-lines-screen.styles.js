import { StyleSheet } from 'react-native';

// 视图样式定义
export const styles = StyleSheet.create({
    box: {
        flex: 1,
    },

    searchBoxIcon: {
        height: 20,
        width: 20
    },

    searchBoxCleanIcon: {
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

    newLineButton: {
        width: 50,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ffffff'
    },

    newLineButtonIcon: {
        height: 30,
        width: 30
    },

    lineListBox: {
        flex: 1
    },

    drawerBox: {
        flex: 1
    },

    drawe: {
        backgroundColor: '#f2f2f2',
        width: '75%'
    },

    sortBarBox: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        height: 36,
        marginTop: -5
    },

    sortOrFilterItem: {
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row'
    },

    sortOrFilterText: {
        color: '#6c6c6c',
        fontSize: 13
    },

    sortOrFilterSelected: {
        color: '#3356ff'
    },

    sortIcon: {
        height: 10,
        width: 10,
        marginLeft: 5
    },

    filterIcon: {
        height: 15,
        width: 15,
        marginLeft: 5
    },

    overlayBackdrop: {
        // borderTopWidth: 84,
        // borderTopColor: '#ffffff00'
    },

    overOverlay: {
        position: 'absolute',
        top: 84,
        borderRadius: 0,
        width: '100%',
        padding: 0
    },

    optionBox: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        paddingHorizontal: 20,
    },

    option: {
        flexDirection: 'row',
        alignItems: 'center'
    },

    optionIcon: {
        height: 28,
        width: 28,
        marginRight: 8
    },

    optionLable: {
        fontSize: 14
    },

    optionLableSelected: {
        color: '#3366ff'
    },

    arrowRight: {
        height: 18,
        width: 18
    },

    optionList: {
        paddingBottom: 5
    },

    separator: {
        height: 1,
        backgroundColor: '#DADCDB',
        marginHorizontal: 8
    },

    searchBtnView: {
        backgroundColor: '#fff',
        width: 50,
        justifyContent: 'center',
        alignContent: 'center',
        paddingLeft: 11,
    },

    searchBtnText: {
        fontSize: 13,
        color: '#6c6c6c'
    }

});