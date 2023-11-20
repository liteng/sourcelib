import axios from 'axios';
import util from '../util';
import Config from '../config';

const serviceBasePath = Config.serviceBasePath;
const http = axios.create({
    baseURL: serviceBasePath,
    headers: {
        'Content-Type': 'application/json'
    }
})

const userInfo = util.getLocalUserInfo();

const get = (url, params, options) => {
    const userInfo = util.getLocalUserInfo();
    const token = userInfo ? userInfo.token : null;
    return http.get(url, params, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
            ...options?.headers,
        }
    })
}

const post = (url, data, options) => {
    const userInfo = util.getLocalUserInfo();
    const token = userInfo ? userInfo.token : null;
    return http.post(url, data, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
            ...options?.headers,
        }
    })
}

const upload = (url, file, options) => {
    const userInfo = util.getLocalUserInfo();
    const token = userInfo ? userInfo.token : null;
    const formData = new FormData();
    formData.append('file', file);
    return http.post(url, formData, {
        ...options,
        headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': token ? `Bearer ${token}` : '',
            ...options?.headers,
        }
    })
}

export { get, post, upload };