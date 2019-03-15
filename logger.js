const fetch = require('node-fetch');
const util = require('util');

module.exports = {
    logRequestHeaders,
    logResponseHeaders,
    logSaveReturnReturnResponse
};

function logRequestHeaders(requestParams, context, ee, next) {
    console.log(requestParams);
    return next();
}

function logResponseHeaders(requestParams, response, context, ee, next) {
    if([200, 300].indexOf(response.statusCode) < 0) {
        logObject({
            url: requestParams.url,
            statusCode: response.statusCode,
            headers: response.headers,
            responseBody: response.body
        });
    }
    return next();
}

const logObject = (obj) => {
    console.log(util.inspect(obj, {showHidden: false, depth: null}))
}

const tryParseJson = (string) => {
    try {
        return JSON.parse(string);
    } catch (e) {
        return;
    }
}