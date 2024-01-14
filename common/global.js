import Toast from 'react-native-root-toast';

export const toastMessage = (message) => {
    Toast.show(message, {
        duration: 2000,
        position: 60,
        backgroundColor: '#454545'
    });
}

// 用于显示线路总条数
export const toastMessageForLineCount = (message) => {
    Toast.show(message, {
        // 持续时间
        duration: 2000,
        // 吐司在屏幕上显示的位置(负数表示到屏幕底部的距离。正数表示到屏幕顶部的距离。0将把吐司放置到屏幕中间。)
        position: -80,
        // 是否有动画
        animation: true,
        // 是否有阴影
        shadow: false,
        // 底色
        backgroundColor: '#fff',
        shadowColor: '#e3e3e3',
        textColor: '#000',
        textStyle: {
            fontSize: 13,
        },
        containerStyle: {
            paddingVertical: 7,
            paddingHorizontal: 14,
            borderWidth: 1,
            borderColor: '#d7d7d7'
        },
        // 开始出现在屏幕上之前的延迟时间
        delay: 0,
        // 当点击时隐藏
        hideOnPress: true,
        opacity: 1,
    });
}