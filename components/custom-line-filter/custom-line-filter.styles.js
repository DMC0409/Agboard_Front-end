import { StyleSheet } from 'react-native';

// 视图样式定义
export const styles = StyleSheet.create({
    sortBox: {
        flex: 1,
        display: 'flex',
        justifyContent: 'space-between',
    },

    sortItemBox: {
        backgroundColor: '#ffffff',
        marginTop: 15,
        paddingHorizontal: 5
    },

    selectBox: {
        marginLeft: -12,
        marginVertical: 0
    },

    selectIcon: {
        height: 25,
        width: 25
    },

    fliterLableBox: {
        marginHorizontal: 5
    },

    filterCreaterBox: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center'
    },

    fleterHasVideoBox: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center'
    },

    sortTitle: {
        fontSize: 13,
        fontWeight: 'bold',
        padding: 10
    },

    levelText: {
        fontSize: 12
    },

    multiSliderBox: {
        marginHorizontal: 15,
    },

    multiSliderTitleBox: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },

    sortInpufBox: {
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        marginVertical: 8,
        marginLeft: -15
    },

    input: {
        borderStyle: 'solid',
        backgroundColor: '#F3F3F3',
        paddingLeft: 12,
        fontSize: 12,
        height: 30,
        borderRadius: 5,
        marginHorizontal: 20,
        paddingVertical: 5
    },

    sortButtonBox: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 15,
        paddingHorizontal: 5,
    },

    sortButton: {
        flex: 1,
        marginHorizontal: 5
    },

    sortResetButton: {
        backgroundColor: '#808080'
    },

    sortSaveButton: {
        backgroundColor: '#3366ff'
    },

    sliderContainer: {
        marginTop: -12
    },

    sliderMarker: {
        height: 15,
        width: 15,
        padding: 5,
        backgroundColor: '#3356ff'
    },

    sliderSelected: {
        backgroundColor: '#3356ff'
    }
});
