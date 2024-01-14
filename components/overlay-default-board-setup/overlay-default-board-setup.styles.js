import { StyleSheet } from 'react-native';

// 视图样式定义
export const styles = StyleSheet.create({
    overlayBox: {
        justifyContent: 'space-between',
        padding: 5,
    },

    overlayTitle: {
        fontSize: 18
    },

    overlayDescription: {
        fontSize: 16,
        marginLeft: 5,
        marginTop: 5
    },

    buttonGroup: {
        alignSelf: 'flex-end',
        flexDirection: 'row'
    },

    labelBox: {
        marginTop: 10
    },

    labelText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#808080',
        paddingRight: 15,
        marginTop: 12
    }
});