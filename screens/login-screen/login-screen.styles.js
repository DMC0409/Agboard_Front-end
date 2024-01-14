import { StyleSheet } from 'react-native';

// 视图样式定义
export const styles = StyleSheet.create({
  box: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 25,
  },

  header: {
    marginTop: 60
  },

  title: {
    fontSize: 24,
    color: '#212121'
  },

  content: {
    marginBottom: 15,
    marginTop: 20,
  },

  loginText: {
    color: '#A1A1A1',
    fontSize: 12
  },

  input: {
    borderStyle: 'solid',
    backgroundColor: '#F3F3F3',
    paddingLeft: 15,
    fontSize: 16,
    marginTop: 20,
    height: 45,
    borderRadius: 5
  },

  identifyingCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 25,
  },

  identifyingCodeInput: {
    marginTop: 0,
    flex: 1,
    borderTopLeftRadius: 5,
    borderBottomLeftRadius: 5,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0
  },

  identifyingCodeImg: {
    maxWidth: 160,
    maxHeight: 45,
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5
  },

  loginButtonBox: {
    marginTop: 25,
  },

  getVerificationButtonContainer: {
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },

  getVerificationButton: {
    backgroundColor: '#3366ff',
    width: 140,
    height: 45,
    borderTopRightRadius: 5,
    borderBottomRightRadius: 5,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },

  buttonStyle: {
    backgroundColor: '#3366ff',
    paddingHorizontal: 20,
    height: 45,
    borderRadius: 5
  },

  disabledStyle: {
    backgroundColor: '#3366ff90'
  },

  disabledTitleStyle: {
    color: '#ffffff'
  },

  selectIcon: {
    height: 20,
    width: 20
  },

  userAgreementText: {
    color: '#808080',
    fontSize: 12
  },

  userAgreementBox: {
    flexDirection: 'row',
    alignItems: 'center'
  },

  privacyPolicyText: {
    color: '#0366d6',
    fontSize: 12
  },

  loginAreaText: {
    color: '#525252',
    fontSize: 15,
    padding: 20
  },

  loginAreaBox: {
    flex: 1,
    alignSelf: 'center',
    justifyContent: 'flex-end',
    marginBottom: 10
  }
});