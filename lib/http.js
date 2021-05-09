const fetch = require('node-fetch');

const DEFAULT_HEADERS = {
    'Content-Type': 'application/json',
};
const request = async (method, uri, body, headers) => new Promise((resolve, reject) => {
    fetch(uri, {
        method,
        body: body ? JSON.stringify(body) : undefined,
        headers: { DEFAULT_HEADERS, ...headers },
    })
        .then((res) => resolve(res.text()))
        .catch((err) => reject(err));
});

const get = async ({ uri, headers }) => request('get', uri, undefined, headers);

// const post = async ({ uri, body, headers }) => request('post', uri, body, headers);

// const patch = async ({ uri, body, headers }) => request('patch', uri, body, headers);

// const put = async ({ uri, body, headers }) => request('put', uri, body, headers);

// const del = async ({ uri, headers }) => request('delete', uri, undefined, headers);

module.exports = {
    get,
    // post,
    // patch,
    // put,
    // delete: del,
};
