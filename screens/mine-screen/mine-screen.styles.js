import { StyleSheet } from 'react-native';

// 视图样式定义
export const styles = StyleSheet.create({
    box: {
        flex: 1
    },

    mineInfoBox: {
        backgroundColor: '#FFFFFF'
    },

    mineInfoButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        margin: 20,
        marginBottom: 10
    },

    userNameBox: {
        flexDirection: 'row',
        alignItems: 'center'
    },

    avatarImg: {
        height: 60,
        width: 60,
        borderRadius: 10
    },

    nicknameBox: {
        marginLeft: 15
    },

    nicknameFa: {
        flexDirection: 'row',
        alignItems: 'center'
    },

    nickname: {
        fontWeight: 'bold', 
        fontSize: 17
    },

    userName: {
        fontSize: 12,
        marginTop: 5,
        color: '#808080'
    },

    arrowRight: {
        height: 20,
        width: 20
    },

    lineBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        height: 60,
    },

    lineEnterItem: {
        alignItems: 'center',
        width: '33%',
        height: 60,
        justifyContent: 'center'
    },

    lineEnterCount: {
        fontSize: 15,
        fontWeight: 'bold'
    },

    lineEnterText: {
        fontSize: 12
    },

    splitLines: {
        width: 0.5,
        backgroundColor: '#808080',
        marginVertical: 10
    },

    listBox: {
        flex: 1
    },

    listPart: {
        marginTop: 15,
        backgroundColor: '#FFFFFF'
    },

    VidenityImg: {
        height: 17,
        width: 17,
        marginRight: 2
    }

});