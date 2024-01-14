import { StyleSheet } from 'react-native';

// 视图样式定义
export const styles = StyleSheet.create({
    box: {
        flex: 1,
        flexDirection: 'column'
    },

    logoBox: {
        flex: 2,
        justifyContent: 'center',
        alignItems: 'center'
    },

    icon: {
        height: 80,
        width: 80
    },

    fontBox: {
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center'
    },

    nameFont: {
        fontWeight: 'bold',
        fontSize: 23
    }
});