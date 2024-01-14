// 登录视图
import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Pressable } from 'react-native';
import { Button, CheckBox } from 'react-native-elements';
import { styles } from "./login-screen.styles";
import { CODE_COUNTDOWN } from "../../config/login";
import { connect } from "react-redux";
import { setUserToken, setUserInfo, setUserPermission, setUserDeleteLinePermission } from "../../redux/actions";
import { getStore, getLoginArea } from "../../redux/selectors";
import { http, GET } from "../../common/http";
import { saveUserToken, saveUserInfo } from "../../common/user";
import { toastMessage } from "../../common/global";

// 利用 Context 在此 screen 范围内全局化 navigation 对象
// export const MainNavContext = React.createContext();

// 视图主组件
const LoginScreen = ({ navigation, setUserToken, setUserInfo, setUserPermission, setUserDeleteLinePermission, loginArea }) => {
  // 获取验证码按钮的 disabled 状态
  const [codeBtnDisabled, setCodeBtnDisabled] = useState(false);
  // 验证码重新获取的倒计时显示
  const [codeCountdown, setCodeCountdown] = useState(CODE_COUNTDOWN);
  // 表单value-手机号
  const [phoneValue, setPhoneValue] = useState('');
  // 表单value-短信验证码
  const [codeValue, setCodeValue] = useState('');
  // 是否有效-表单value-手机号
  const [validPhoneValue, setValidPhoneValue] = useState(false);
  // 是否有效-表单value-短信验证码
  const [validCodeValue, setValidCodeValue] = useState(false);
  // 当前是否在登录中
  const [isLogin, setIsLogin] = useState(false);
  // 是否勾选用户隐私政策
  const [isCheckUserAgreement, setIsCheckUserAgreement] = useState(false);

  // 验证码防抖倒计时处理
  useEffect(() => {
    let interval;
    if (codeBtnDisabled === true) {
      let countdown = CODE_COUNTDOWN;
      interval = setInterval(() => {
        countdown = countdown - 1;
        setCodeCountdown(countdown);
        if (countdown <= 0) {
          clearInterval(interval);
          setCodeBtnDisabled(false);
          setCodeCountdown(CODE_COUNTDOWN);
        }
      }, 1000);
    }
    return () => {
      interval && console.log('清除了定时器');
      interval && clearInterval(interval);
    };
  }, [codeBtnDisabled]);

  // 验证表单内容是否为有效内容
  useEffect(() => {
    // 去除空格
    setPhoneValue(phoneValue.replace(/\s+/g, ""));
    setCodeValue(codeValue.replace(/\s+/g, ""));
    // 验证手机号
    if (phoneValue.toString() && String(loginArea) === '0' && phoneValue.toString().length === 11) {
      setValidPhoneValue(true);
    } else if (phoneValue.toString() && String(loginArea) === '1' && phoneValue.toString().length >= 9 && phoneValue.toString().length <= 13) {
      setValidPhoneValue(true);
    } else {
      setValidPhoneValue(false);
    }
    // 验证code
    if (codeValue.toString() && codeValue.toString().length === 6) {
      setValidCodeValue(true);
    } else {
      setValidCodeValue(false);
    }
  }, [phoneValue, codeValue]);

  // 获取验证码按钮处理
  const handlerGetVerificationCode = () => {
    // 按钮disable处理
    setCodeBtnDisabled(true);
    // 网络请求-获取验证码 1海外 0国内
    http(`sms/${phoneValue}/${loginArea}`, GET)
      .then((res) => {
        // errorCode
        if (res.errCode) {
          console.error('response error code: ', res.errCode);
          toastMessage(`请求失败`);
          setCodeBtnDisabled(false);
          return;
        }
        // response处理
        if (res.data) {
          // 短信发送成功
        } else {
          // 短信发送失败
          toastMessage(`短信发送失败`);
        }
      })
      .catch((error) => {
        console.error(error);
        toastMessage(`请求失败`);
        setCodeBtnDisabled(false);
      });
  }

  // 登录按钮处理
  const handlerLogin = () => {
    setIsLogin(true);
    // 网络请求-登录
    http(`login/${phoneValue}/${codeValue}`, GET)
      .then((res) => {
        // errorCode
        if (res.errCode) {
          console.error('response error code: ', res.errCode);
          toastMessage(`请求失败`);
          setCodeBtnDisabled(false);
          return;
        }
        // response处理
        data = res.data
        if (data) {
          // 登录成功
          // 持久化保存用户信息
          saveUserToken(data.token);
          saveUserInfo(data.user.id, data.user.role);
          // redux中保存用户信息
          setUserToken(data.token);
          setUserInfo(data.user.id, data.user.role);
          setUserPermission(data.user.linePermission, data.user.coursePermission);
          setUserDeleteLinePermission(data.user.del_permission);
          // 重定向跳转
          navigation.reset({
            index: 0,
            routes: [
              { name: 'TabNode' }
            ],
          });
        } else {
          // 登录失败
          toastMessage(`登录失败`);
        }
      })
      .catch((error) => {
        console.error(error);
        toastMessage(`请求失败`);
      })
      .finally(() => {
        setIsLogin(false);
      });
  }

  // 展示用户隐私政策
  const goToUserAgreement = () => {
    navigation.navigate('PrivacyPolicyScreen');
  }

  // 切换登录地区 
  const switchLoginArea = () => {
    navigation.navigate('SwitchLoginAreaScreen', { areaID: loginArea });
  }

  // 返回react组件
  return (
    // <MainNavContext.Provider value={navigation}>
    <View style={styles.box}>
      <View style={styles.header}>
        <Text style={styles.title}>手机号登录/注册</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.loginText}>ALPHA WALL</Text>
        {/* 登录表单 */}
        <View>
          {/* 手机号 */}
          <TextInput
            style={styles.input}
            placeholder="输入手机号码"
            keyboardType="number-pad"
            placeholderTextColor="#BFBFBF"
            value={phoneValue}
            onChangeText={text => setPhoneValue(text)}
          />
          {/* 验证码 */}
          <View style={styles.identifyingCodeBox}>
            <TextInput
              style={[styles.input, styles.identifyingCodeInput]}
              placeholder="输入验证码"
              keyboardType="number-pad"
              placeholderTextColor="#BFBFBF"
              value={codeValue}
              onChangeText={text => setCodeValue(text)}
            />
            <Button
              title={codeBtnDisabled ? `重新获取（${codeCountdown}）` : '获取验证码'}
              containerStyle={styles.getVerificationButtonContainer}
              buttonStyle={styles.getVerificationButton}
              disabled={codeBtnDisabled || !validPhoneValue}
              onPress={() => { handlerGetVerificationCode() }}
              disabledStyle={styles.disabledStyle}
              disabledTitleStyle={styles.disabledTitleStyle}
            />
          </View>
          {/* 登录按钮 */}
          <View style={styles.loginButtonBox}>
            <Button
              title="登录"
              buttonStyle={styles.buttonStyle}
              onPress={() => handlerLogin()}
              disabled={!validPhoneValue || !validCodeValue}
              loading={isLogin}
              disabledStyle={styles.disabledStyle}
              disabledTitleStyle={styles.disabledTitleStyle}
            />
          </View>
        </View>
      </View>
      {/* 用户隐私政策入口 */}
      <View style={styles.userAgreementBox}>
        {/* <CheckBox
          containerStyle={{ marginVertical: 0, marginLeft: 0, marginRight: 0 }}
          checkedIcon={<Image style={styles.selectIcon} source={require('../../static/img/common-icons/check-box.png')} />}
          uncheckedIcon={<Image style={styles.selectIcon} source={require('../../static/img/common-icons/check-box-outline.png')} />}
          checked={isCheckUserAgreement}
          onPress={() => setIsCheckUserAgreement(!isCheckUserAgreement)}
        /> */}
        <Text>
          <Pressable onPress={() => setIsCheckUserAgreement(!isCheckUserAgreement)}>
            <Text style={styles.userAgreementText}>登录即代表您同意我们的 </Text>
          </Pressable>
          <Pressable onPress={() => goToUserAgreement()}>
            <Text style={styles.privacyPolicyText}>用户隐私政策</Text>
          </Pressable>
        </Text>
      </View>
      <View style={styles.loginAreaBox}>
        <TouchableOpacity onPress={() => switchLoginArea()}>
          <Text style={styles.loginAreaText}>切换登录地区</Text>
        </TouchableOpacity>
      </View>
    </View>
    // </MainNavContext.Provider>
  );
}

// 把redux状态映射至组件的props的属性中，本质也是一个selector函数，可以组合其他selector使用
const mapStateToProps = state => {
  return {
    ...getStore(state),
    loginArea: getLoginArea(state),
  };
};
// 对用到redux的组件进行包装，用到了react-redux的connect特性；
// connect的意思是将组件和redux进行连接，能在组件逻辑里使用redux的action和state；
// 实现是由两个函数实现，且两个函数分别作为了connect函数的两个参数，第一个参数可映射store状态进来，第二个参数可映射action进来；
// 实例：例中的addTodo-action函数会被映射到组件的props的属性中，即可以在组件内调用；
// 实例：例中的mapStateToProps函数会把状态映射至组件的props的属性中，即可以在组件内调用；
export default connect(
  mapStateToProps,
  { setUserToken, setUserInfo, setUserPermission, setUserDeleteLinePermission }
)(LoginScreen);