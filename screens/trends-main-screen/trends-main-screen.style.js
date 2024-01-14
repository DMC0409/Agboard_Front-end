import { StyleSheet } from 'react-native';

// 视图样式定义
export const styles = StyleSheet.create({
    box: {
        flex: 1,
        backgroundColor: '#fff',
    },

    listBox: {
        flex: 1,
        color: '#000'
    },

    listItem: {
        padding: 18,
        paddingBottom: 0,
    },

    itemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10
    },

    itemHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    nameInfoBox: {
        marginLeft: 10,
    },

    nameBox: {
        flexDirection: 'row',
        alignItems: 'center',
    },

    nameText: {
        fontSize: 14,
    },

    followText: {
        fontSize: 12,
        color: '#b2b2b2',
    },

    nameIcon: {
        height: 17,
        width: 17,
        marginLeft: 5
    },

    followBtn: {
        height: 28,
        width: 45,
    },

    followBtnLabel: {
        fontSize: 12,
        marginTop: 0,
        marginBottom: 0,
        marginLeft: 17,
        marginRight: 0,
    },

    linkText: {
        color: '#22934f',
        fontSize: 16,
        lineHeight: 24,
    },

    noteText: {
        fontSize: 16
    },

    timeTextBox: {
        flexDirection: 'row',
        marginBottom: 18
    },

    timeText: {
        color: '#b2b2b2',
        marginTop: 10,
        fontSize: 12
    },

    describeBox: {

    },

    describeText: {
        fontSize: 16,
        lineHeight: 24,
        textAlignVertical: 'center'
    },

    starIcon: {
        height: 15,
        width: 15
    },

    flashIcon: {
        height: 18,
        width: 18,
    },

    describeTextBox: {
        flexDirection: 'row'
    },

    noHaveTreads: {
        justifyContent: 'center',
        alignItems: 'center',
    },

    noHaveTreadsText: {
        fontSize: 16,
        color: '#808080'
    },
});