import util from '../util';
class Http {
    fetchRequest(url, options) {
        const token = util.getToken();
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        const newOptions = {
            ...options,
            "headers": {
                ...headers,
                ...options.headers
            }
        };
        
        return fetch(url, newOptions);
    }
}

const http = new Http();
export default http;