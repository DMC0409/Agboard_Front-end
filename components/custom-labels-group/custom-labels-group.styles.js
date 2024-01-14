import { StyleSheet } from 'react-native';

// 视图样式定义
export const styles = StyleSheet.create({
    labelBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        flexWrap: 'wrap',
        marginBottom: 10
    },

    label: {
        borderRadius: 32,
        height: 32,
        minWidth: 65,
        backgroundColor: '#e6e6e6',
        paddingHorizontal: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 5,
        marginBottom: 15
    },

    labelSelected: {
        borderRadius: 32,
        height: 32,
        minWidth: 69,
        backgroundColor: '#e6e6e6',
        paddingHorizontal: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 5,
        marginBottom: 15,
        borderWidth: 2.5,
        borderColor: '#2A85FF'
    },

    labelText: {
        color: '#808080',
        fontWeight: 'bold',
        fontSize: 12
    },

    labelTextSelected: {
        color: '#2A85FF',
        fontWeight: 'bold',
        fontSize: 12
    }
});
