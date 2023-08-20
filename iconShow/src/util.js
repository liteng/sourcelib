import jwtDecode from 'jwt-decode';

class Util {
    // clearCookie() {

    // }

    getCookie() {
        console.log("get cookie...");
        const cookieString = document.cookie;
        console.log(cookieString);
        const cookiesGroup = cookieString.split('; ');
        const cookies = {};
        for(const cookie of cookiesGroup) {
            const [cookieName, cookieValue] = cookie.split('=');
            cookies[cookieName] = cookieValue;
        }
        console.log(cookies);
        return cookies;
    }

    // 从sessionStorage获取本地存储的用户信息
    getLocalUserInfo() {
        const userInfoString = sessionStorage.getItem('userInfo');
        const userInfo = JSON.parse(userInfoString);
        // console.log(userInfoString, userInfo);
        return userInfo;
    }

    // 从sessionStorage获取本地存储的Token
    getToken() {
        const userInfo = this.getLocalUserInfo();
        const token = userInfo.token;
        console.log('getToken:', token);
        return token;
    }

    // 解析Base64编码的Token
    getJwttokenPayload(token) {
        return jwtDecode(token);
    }

    // isLogin() {
    //     const token = this.getToken();
    //     return token ? true : false;
    // }
}
export default new Util();