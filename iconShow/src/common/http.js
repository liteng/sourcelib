import util from '../util';
class Http {
    fetchRequest(url, options) {
        const token = util.getToken();
        const header = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };

        const newOptions = {
            ...options,
            Headers: {
                ...headers,
                ...options.headers
            }
        };

        return fetch(url, newOptions);
    }
}

const http = new Http();
export default http;