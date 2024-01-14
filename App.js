/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import 'react-native-gesture-handler';
import React from 'react';
import NavigationRoot from "./route/mainRoute";
import { Provider } from 'react-redux'
import store from './redux/store'
import OverlayVersionCheck from "./components/overlay-version-check/overlay-version-check";
import OverlayUsernameCheck from "./components/overlay-username-check/overlay-username-check";
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Text, SafeAreaView } from 'react-native';
import { RootSiblingParent } from 'react-native-root-siblings';
import { Provider as PaperProvider } from 'react-native-paper';

// React$Node
const App = () => {

  // 改写覆盖 Text 组件 的 render，实现修改字体全局配置
  // 解决部分机型字符不显示问题
  const defaultFontFamily = {
    ...Platform.select({
      android: { fontFamily: '' }
    })
  };
  const oldRender = Text.render;
  Text.render = function (...args) {
    const origin = oldRender.call(this, ...args);
    return React.cloneElement(origin, {
      style: [defaultFontFamily, origin.props.style]
    });
  };

  // 根组件
  return (
    // 在安全区域内渲染视图 for IOS
    <SafeAreaView style={{ flex: 1 }}>
      {/* 在安全区域内渲染视图 */}
      <SafeAreaProvider>
        {/* 用户通知 */}
        <RootSiblingParent>
          {/* redux 状态管理 Provider */}
          <Provider store={store}>
            {/* Paper样式提供 */}
            <PaperProvider>
              {/* 全局覆盖框，android平台检查更新和下载 */}
              <OverlayVersionCheck />
              {/* 全局覆盖框，检查新用户注册必须填写用户名 */}
              <OverlayUsernameCheck />
              {/* 路由根节点 */}
              <NavigationRoot />
            </PaperProvider>
          </Provider>
        </RootSiblingParent>
      </SafeAreaProvider>
    </SafeAreaView>
  );
};

export default App;
