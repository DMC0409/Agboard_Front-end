import { BACK_END_URL, BACK_END_API } from "../config/http";
import { getBoardSettingType, getUserToken, getMainNavigation } from "../redux/selectors";
import store from "../redux/store";

export const GET = 'GET';
export const POST = 'POST';

const URL = BACK_END_URL;
const HEADER_TAG_MAP = {
    '1': 'pro',
    '2': 'pro',
    '3': 'home',
    '': ''
}

// 封装网络请求的共同部分
export const http = (url = '', method = GET, requestInfo = {}) => {
    // 初始化请求信息
    const request = {
        headers: {
            // headers共同部分
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: (store || '') && (getUserToken(store.getState()) || ''),
            // headers特殊处理部分
            tag: HEADER_TAG_MAP[getBoardSettingType(store.getState()).id] || '',
            // headers自定义部分
            ...(requestInfo['headers'] || {})
        },
        body: requestInfo['body'] && JSON.stringify(requestInfo.body)
    };
    // 返回fetch的promise对象
    return fetch(
        `${URL}/${BACK_END_API}/${url}`,
        {
            method: method,
            headers: request.headers,
            body: request.body
        }
    )
        // 检查请求是否成功，成功返回响应体
        .then((response) => {
            console.log(`${URL}/${BACK_END_API}/${url}`);
            console.log('requestBody:', request.body);
            return new Promise((resolve, reject) => {
                // 协议错误
                if (response['ok'] === false) {
                    if (response.status === 401) {
                        const navigation = getMainNavigation(store.getState());
                        if (navigation) {
                            console.log('http返回401，跳转登录页');
                            navigation.reset({
                                index: 0,
                                routes: [
                                    { name: 'LoginScreen' }
                                ],
                            });
                        }
                    }
                    reject(`${response['status']}`);
                    return;
                }
                resolve(response.json());
            })
        })
};