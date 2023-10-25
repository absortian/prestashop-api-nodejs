const request = require('request');
const httpBuildQuery = require('http-build-query');
var nodeBase64 = require('nodejs-base64-converter');

const params = ['filter', 'display', 'sort', 'limit', 'schema', 'id_shop', 'id_group_shop', 'query', 'language'];

const req = (opt) => {
    return new Promise((resolve) => {
        request(opt, (err, res, body) => {
            resolve({
                err: err,
                res: res,
                body: body
            });
        });
    });
};

const exec = async (opt) => {
    let {err, res, body} = await req(opt);
    if(err) return {status_code: 500, response: null, headers: null}
    return {
        status_code: res.statusCode,
        response: body,
        headers: res.headers
    };
};

const buildQuery = (opt) => {
    let url_params = {};
    let query = '';
    for(let param of params) {
        for(let [key, value] of Object.entries(opt)) {
            if(key === param || key.includes(param)) {
                url_params[key] = opt[key];
            }
        }
    }
    if(Object.entries(url_params).length > 0) {
        query = `${httpBuildQuery(url_params)}`;
    }
    return query;
};

const buildRoute = (options, opt) => {
    let route = `${options.url}/api/${opt['resource']}`;
    if(opt['id']) route = `${route}/${opt['id']}`;
    return route;
};

const buildUrl = (options, opt) => {
    let route = buildRoute(options, opt);
    let query = buildQuery(opt);
    url = `${route}?ws_key=${options.key}&${query}`;
    return url;
};

module.exports = function( options ) {
    const base64_key = nodeBase64.encode(options.key + ':')
    const baseHeaders = {
        'Authorization': 'Basic ' + base64_key
    };

    this.post = async (opt) => {
        let url = buildUrl(options, opt);
        let body = opt['body'];
        let headers = baseHeaders;
        if(opt['headers']) headers = {...headers, ...opt['headers']};
        let req = await exec({
            url: url,
            method: 'POST',
            headers: headers,
            body: body
        });
        return req['response'];
    };
    this.get = async (opt) => {
        let url = buildUrl(options, opt);
        let headers = baseHeaders;
        if(opt['headers']) headers = {...headers, ...opt['headers']};
        let req = await exec({
            url: url,
            method: 'GET',
            headers: headers
        });
        return req['response'];
    };
    this.head = async (opt) => {
        let url = buildUrl(options, opt);
        let headers = baseHeaders;
        if(opt['headers']) headers = {...headers, ...opt['headers']};
        let req = await exec({
            url: url,
            method: 'HEAD',
            headers: headers
        });
        return req['response'];
    };
    this.put = async (opt) => {
        let url = buildUrl(options, opt);
        let body = opt['body'];
        let headers = baseHeaders;
        if(opt['headers']) headers = {...headers, ...opt['headers']};
        let req = await exec({
            url: url,
            method: 'PUT',
            headers: headers,
            body: body
        });
        return req['response'];
    };
    this.delete = async (opt) => {
        let url = buildUrl(options, opt);
        let headers = baseHeaders;
        headers['Expect'] = '100-continue';
        if(opt['headers']) headers = {...headers, ...opt['headers']};
        let req = await exec({
            url: url,
            method: 'DELETE',
            headers: headers
        });
        return req['response'];
    };
}
